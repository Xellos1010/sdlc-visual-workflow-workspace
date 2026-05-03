import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { loadCatalogs } from '../../../packages/core/src/catalogs.mjs';
import { applyGraphPatches, loadGraph, saveGraph } from '../../../packages/core/src/graph-store.mjs';
import { importWorkspace } from '../../../packages/core/src/import-pipeline.mjs';
import { createPlan, listPlans, loadPlan, updatePlanApproval } from '../../../packages/core/src/plans.mjs';
import { createRunForPlan, listRuns, loadRun, transitionRun } from '../../../packages/core/src/runs.mjs';
import { readJson, stateRoot } from '../../../packages/core/src/io.mjs';
import { ingestKnowledgeSources, listKnowledgeBases, loadKnowledgeBaseManifest, loadKnowledgeDocuments } from '../../../packages/core/src/knowledge-base.mjs';
import { analyzeKnowledgeGaps, writeGapReport } from '../../../packages/core/src/gap-analysis.mjs';
import { buildFocusView, writeFocusView } from '../../../packages/core/src/focus-views.mjs';
import { scaffoldEnvironment } from '../../../packages/core/src/environment-scaffold.mjs';
import { assessSystemImpact } from '../../../services/system-orchestrator/index.mjs';
import { initProject, readState, transitionPhase, addBlocker, resolveBlocker, getResumeChecklist, getPhasePolicy, checkCompliance } from '../../../packages/core/src/continuity.mjs';
import { scheduleLocalShellExecution, shouldExecuteLocally } from '../../../packages/core/src/run-executor.mjs';
import { syncRalphProgress } from '../../../packages/core/src/ralph-state-sync.mjs';
import { loadSwarmRegistry, buildSwarmOrchestrationStub } from '../../../packages/core/src/swarm-registry.mjs';
import { buildLayeredPlanningContext } from '../../../packages/core/src/knowledge-retrieval.mjs';
import { loadDebate, appendDebateRound } from '../../../packages/core/src/debate-store.mjs';
import { assembleEvidenceBundle } from '../../../packages/core/src/evidence-bundle.mjs';
import { traceForwardFromNode, traceBackwardToNode, traceFileHeuristic } from '../../../packages/core/src/traceability.mjs';
import { buildArtifactGraph, loadArtifactGraph, rebuildArtifactGraph, queryConnected, queryLifecycleTrace, selectSubgraph } from '../../../packages/core/src/artifact-graph.mjs';
import { indexArtifact, indexEcosystem } from '../../../packages/core/src/embedding-pipeline.mjs';
import { buildRagStatus, retrieve } from '../../../packages/core/src/retrieval-engine.mjs';
import { packageExport, importExportPackage } from '../../../packages/core/src/export-packager.mjs';
import { composePipeline } from '../../../packages/core/src/pipeline-composer.mjs';
import { dispatchPipeline, loadPipeline, listPipelines } from '../../../packages/core/src/stage-dispatcher.mjs';
import { detectEnvironmentArtifacts } from '../../../packages/core/src/environment-detect.mjs';
import { chooseWorkspaceTarget, loadWorkspaceTarget, resolveWorkspaceCandidates, saveWorkspaceTarget } from '../../../packages/core/src/workspace-targets.mjs';
import { addContextCartItem, createContextCart, listContextCarts, loadContextCart, saveContextCart } from '../../../packages/core/src/context-cart.mjs';
import { canGeneratePlanFromRefinement, createRefinementSession, listRefinementSessions, loadRefinementSession, saveRefinementSession } from '../../../packages/core/src/requirement-refinement.mjs';
import { buildVisualArtifact, listVisualArtifacts, loadVisualArtifact, saveVisualArtifact } from '../../../packages/core/src/visual-artifacts.mjs';
import { buildAdvisoryBudgetSnapshot } from '../../../packages/model-gateway/src/gateway.mjs';
import { buildExecutionSessionBoard } from '../../../packages/core/src/session-projection.mjs';
import { projectPlanForBoard } from '../../../packages/core/src/plans.mjs';

const port = Number(process.env.FLAGSHIP_PORT ?? 4010);
const serverFile = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(serverFile), '../../../');
const defaultCorsOrigins = [
  'http://localhost:3000',
  'http://localhost:4010',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4010'
];
const allowedCorsOrigins = (process.env.FLAGSHIP_CORS_ORIGINS ?? defaultCorsOrigins.join(','))
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const allowLoopbackNoAuth = process.env.FLAGSHIP_DEV_MODE === '1'
  && process.env.FLAGSHIP_ALLOW_LOOPBACK_NO_AUTH === '1';
const bodyLimitBytes = Number(process.env.FLAGSHIP_BODY_LIMIT_BYTES ?? 262144);
const criticalTimeoutMs = Number(process.env.FLAGSHIP_CRITICAL_TIMEOUT_MS ?? 15000);
const rateLimitWindowMs = Number(process.env.FLAGSHIP_RATE_LIMIT_WINDOW_MS ?? 60000);
const rateLimitMax = Number(process.env.FLAGSHIP_RATE_LIMIT_MAX ?? 30);
const rateLimitStore = new Map();

const criticalWriteEndpoints = [
  /^\/ingestion\/workspace-import$/,
  /^\/knowledge\/ingest$/,
  /^\/analysis\/blast-radius$/,
  /^\/analysis\/gaps$/,
  /^\/analysis\/focus$/,
  /^\/planning\/create$/,
  /^\/plans\/[^/]+\/(approve|reject|auto-approval)$/,
  /^\/runs\/start$/,
  /^\/runs\/[^/]+\/(pause|resume|stop|start)$/,
  /^\/runs\/[^/]+\/ralph-sync$/,
  /^\/graph\/patch$/,
  /^\/ecosystems\/[^/]+\/graph\/rebuild$/,
  /^\/ecosystems\/[^/]+\/graph\/query$/,
  /^\/ecosystems\/[^/]+\/rag\/index$/,
  /^\/ecosystems\/[^/]+\/rag\/query$/,
  /^\/ecosystems\/[^/]+\/export$/,
  /^\/ecosystems\/[^/]+\/import$/,
  /^\/pipelines\/create$/,
  /^\/pipelines\/[^/]+\/launch$/,
  /^\/pipelines\/[^/]+\/pause$/,
  /^\/pipelines\/[^/]+\/resume$/,
  /^\/environments\/scaffold$/,
  /^\/swarm\/orchestration-stub$/,
  /^\/plans\/[^/]+\/debate$/,
  /^\/projects\/[^/]+\/init$/,
  /^\/projects\/[^/]+\/transition$/,
  /^\/projects\/[^/]+\/blocker$/,
  /^\/projects\/[^/]+\/blocker\/\d+$/
];

function getRequiredScope(pathname) {
  if (/^\/runs\/start$/.test(pathname) || /^\/runs\/[^/]+\/(pause|resume|stop|start)$/.test(pathname)) {
    return 'control-plane:execute';
  }
  if (criticalWriteEndpoints.some((pattern) => pattern.test(pathname))) {
    return 'control-plane:write';
  }
  return 'control-plane:read';
}

function parseTokenRegistry() {
  const rawRegistry = process.env.FLAGSHIP_CONTROL_PLANE_TOKENS;
  if (rawRegistry) {
    const parsed = JSON.parse(rawRegistry);
    if (!Array.isArray(parsed)) {
      throw new Error('FLAGSHIP_CONTROL_PLANE_TOKENS must be a JSON array');
    }
    return parsed.map((entry) => ({
      token: String(entry.token ?? ''),
      scopes: Array.isArray(entry.scopes) ? entry.scopes.map((scope) => String(scope)) : []
    })).filter((entry) => entry.token);
  }

  const singleToken = process.env.FLAGSHIP_CONTROL_PLANE_BEARER_TOKEN;
  if (!singleToken) return [];
  return [{
    token: singleToken,
    scopes: (process.env.FLAGSHIP_CONTROL_PLANE_BEARER_SCOPES ?? 'control-plane:read,control-plane:write,control-plane:execute')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  }];
}

const tokenRegistry = parseTokenRegistry();

function getClientIp(request, options = {}) {
  const trustForwardedFor = options.trustForwardedFor === true;
  if (trustForwardedFor) {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
      return forwarded.split(',')[0].trim();
    }
  }
  return request.socket?.remoteAddress ?? '';
}

function isLoopbackAddress(address) {
  if (!address) return false;
  return address === '::1'
    || address === '127.0.0.1'
    || address === '::ffff:127.0.0.1';
}

function stripIpv4MappedPrefix(address) {
  if (!address.startsWith('::ffff:')) {
    return address;
  }
  return address.slice(7);
}

/**
 * RFC 1918 private IPv4 (supports IPv4-mapped IPv6). Host traffic to a published Docker port
 * appears as the bridge gateway (e.g. 172.17.0.1), not loopback, so the extension would otherwise
 * hit `auth_not_configured` with FLAGSHIP_ALLOW_LOOPBACK_NO_AUTH alone.
 */
function isPrivateIpv4Address(address) {
  const ip = stripIpv4MappedPrefix(address);
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip);
  if (!match) return false;
  const octets = match.slice(1, 5).map((value) => Number(value));
  if (octets.some((value) => Number.isNaN(value) || value > 255)) return false;
  const [a, b] = octets;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

function parseBearerToken(request) {
  const authHeader = request.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

export function authorizeRequest(request, pathname) {
  const clientIp = getClientIp(request, { trustForwardedFor: false });
  if (allowLoopbackNoAuth) {
    if (isLoopbackAddress(clientIp)) {
      return { ok: true, reason: 'loopback_no_auth' };
    }
    if (isPrivateIpv4Address(clientIp)) {
      return { ok: true, reason: 'private_dev_no_auth' };
    }
  }
  if (tokenRegistry.length === 0) {
    return { ok: false, statusCode: 503, error: 'auth_not_configured' };
  }

  const token = parseBearerToken(request);
  if (!token) {
    return { ok: false, statusCode: 401, error: 'missing_bearer_token' };
  }

  const tokenEntry = tokenRegistry.find((entry) => entry.token === token);
  if (!tokenEntry) {
    return { ok: false, statusCode: 401, error: 'invalid_bearer_token' };
  }

  const requiredScope = getRequiredScope(pathname);
  if (!tokenEntry.scopes.includes(requiredScope)) {
    return {
      ok: false,
      statusCode: 403,
      error: 'insufficient_scope',
      requiredScope
    };
  }

  return { ok: true, reason: 'scoped_bearer_token', scope: requiredScope };
}

function isCriticalRequest(method, pathname) {
  if (method === 'DELETE') {
    return criticalWriteEndpoints.some((pattern) => pattern.test(pathname));
  }
  if (method !== 'POST') return false;
  return criticalWriteEndpoints.some((pattern) => pattern.test(pathname));
}

function checkRateLimit(request, pathname) {
  const now = Date.now();
  const key = `${getClientIp(request, { trustForwardedFor: false })}:${pathname}`;
  const current = rateLimitStore.get(key);
  if (!current || now - current.windowStart >= rateLimitWindowMs) {
    rateLimitStore.set(key, { windowStart: now, count: 1 });
    return { ok: true };
  }
  if (current.count >= rateLimitMax) {
    return { ok: false, retryAfterSeconds: Math.ceil((rateLimitWindowMs - (now - current.windowStart)) / 1000) };
  }
  current.count += 1;
  return { ok: true };
}

function validateCriticalPayload(pathname, body) {
  if (/^\/knowledge\/ingest$/.test(pathname)) {
    if (!body || typeof body.knowledgeBaseId !== 'string' || !body.knowledgeBaseId.trim() || typeof body.name !== 'string' || !body.name.trim()) {
      return 'knowledgeBaseId and name are required';
    }
  }
  if (/^\/runs\/start$/.test(pathname)) {
    if (!body || typeof body.planId !== 'string' || !body.planId.trim()) {
      return 'planId is required';
    }
  }
  if (/^\/analysis\/blast-radius$/.test(pathname)) {
    if (!body || typeof body.ecosystemId !== 'string' || typeof body.query !== 'string') {
      return 'ecosystemId and query are required';
    }
  }
  if (/^\/analysis\/gaps$/.test(pathname)) {
    if (!body || typeof body.ecosystemId !== 'string') {
      return 'ecosystemId is required';
    }
  }
  if (/^\/graph\/patch$/.test(pathname)) {
    if (!body || typeof body.ecosystemId !== 'string' || !Array.isArray(body.patches)) {
      return 'ecosystemId and patches[] are required';
    }
  }
  if (/^\/ecosystems\/[^/]+\/graph\/query$/.test(pathname)) {
    if (!body || typeof body.ecosystemId !== 'string' || !Array.isArray(body.startNodeIds)) {
      return 'ecosystemId and startNodeIds[] are required';
    }
  }
  if (/^\/ecosystems\/[^/]+\/graph\/rebuild$/.test(pathname)) {
    if (!body || typeof body.ecosystemId !== 'string') {
      return 'ecosystemId is required';
    }
  }
  if (/^\/ecosystems\/[^/]+\/rag\/index$/.test(pathname)) {
    if (!body || typeof body.ecosystemId !== 'string') {
      return 'ecosystemId is required';
    }
  }
  if (/^\/ecosystems\/[^/]+\/rag\/query$/.test(pathname)) {
    if (!body || typeof body.ecosystemId !== 'string' || typeof body.query !== 'string') {
      return 'ecosystemId and query are required';
    }
  }
  if (/^\/ecosystems\/[^/]+\/export$/.test(pathname)) {
    if (!body || typeof body.ecosystemId !== 'string') {
      return 'ecosystemId is required';
    }
  }
  if (/^\/ecosystems\/[^/]+\/import$/.test(pathname)) {
    if (!body || typeof body.ecosystemId !== 'string') {
      return 'ecosystemId is required';
    }
  }
  if (/^\/pipelines\/create$/.test(pathname)) {
    if (!body || typeof body.pipelineId !== 'string' || typeof body.ecosystemId !== 'string' || !Array.isArray(body.stages)) {
      return 'pipelineId, ecosystemId, and stages[] are required';
    }
  }
  if (/^\/pipelines\/[^/]+\/(launch|pause|resume)$/.test(pathname)) {
    if (!body || typeof body.ecosystemId !== 'string') {
      return 'ecosystemId is required';
    }
  }
  if (/^\/projects\/[^/]+\/transition$/.test(pathname)) {
    if (!body || typeof body.phase !== 'string' || !body.phase.trim()) {
      return 'phase is required';
    }
  }
  if (/^\/planning\/create$/.test(pathname)) {
    if (!body || typeof body.objective !== 'string' || !body.objective.trim()) {
      return 'objective is required';
    }
  }
  if (/^\/operator\/workspace-target$/.test(pathname)) {
    if (!body || typeof body.ecosystemId !== 'string' || !Array.isArray(body.workspaceFolders)) {
      return 'ecosystemId and workspaceFolders[] are required';
    }
  }
  return null;
}

function sendJson(response, statusCode, payload, origin = null) {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'authorization,content-type',
    vary: 'Origin'
  };
  if (origin) {
    headers['access-control-allow-origin'] = origin;
  }
  response.writeHead(statusCode, headers);
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

async function readBody(request, maxBytes = bodyLimitBytes) {
  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of request) {
    totalBytes += chunk.length;
    if (totalBytes > maxBytes) {
      const error = new Error('payload_too_large');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  const parsed = JSON.parse(raw);
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    const error = new Error('invalid_payload_shape');
    error.statusCode = 400;
    throw error;
  }
  return parsed;
}

export function withTimeout(promise, timeoutMs) {
  if (timeoutMs <= 0) {
    const error = new Error('request_timeout');
    error.statusCode = 504;
    return Promise.reject(error);
  }
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      const error = new Error('request_timeout');
      error.statusCode = 504;
      reject(error);
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

function resolveAllowedOrigin(request) {
  const origin = request.headers.origin;
  if (typeof origin !== 'string' || !origin.trim()) return null;
  return allowedCorsOrigins.includes(origin) ? origin : '__denied__';
}

async function listEcosystemIds() {
  try {
    const entries = await fs.readdir(path.join(stateRoot, 'ecosystems'), { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  } catch {
    return [];
  }
}

async function loadEcosystemManifest(ecosystemId) {
  return readJson(path.join(stateRoot, 'ecosystems', ecosystemId, 'manifest.json'));
}

async function loadVisualizationIndex(ecosystemId) {
  return readJson(path.join(stateRoot, 'ecosystems', ecosystemId, 'visualizations', 'index.json'), []);
}

async function loadProfileIndex(ecosystemId) {
  return readJson(path.join(stateRoot, 'ecosystems', ecosystemId, 'profiles', 'index.json'), []);
}

async function handler(request, response) {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host ?? 'localhost'}`).pathname);
  const allowedOrigin = resolveAllowedOrigin(request);

  if (allowedOrigin === '__denied__') {
    sendJson(response, 403, { error: 'origin_not_allowed' }, null);
    return;
  }

  if (request.method === 'OPTIONS') {
    sendJson(response, 200, { ok: true }, allowedOrigin);
    return;
  }

  // Unauthenticated: callers are often Docker/K8s or host port-forward (not loopback inside the container).
  if (request.method === 'GET' && pathname === '/health') {
    sendJson(response, 200, {
      ok: true,
      service: 'flagship-foundry-control-plane',
      port,
      repoRoot,
      timestamp: new Date().toISOString()
    }, allowedOrigin);
    return;
  }

  const authorization = authorizeRequest(request, pathname);
  if (!authorization.ok) {
    sendJson(response, authorization.statusCode, {
      error: authorization.error,
      requiredScope: authorization.requiredScope
    }, allowedOrigin);
    return;
  }

  if (isCriticalRequest(request.method, pathname)) {
    const rateLimit = checkRateLimit(request, pathname);
    if (!rateLimit.ok) {
      response.setHeader('retry-after', String(rateLimit.retryAfterSeconds));
      sendJson(response, 429, { error: 'rate_limited' }, allowedOrigin);
      return;
    }
  }

  const url = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`);

  try {
    if (request.method === 'GET' && pathname === '/catalogs') {
      sendJson(response, 200, await loadCatalogs(), allowedOrigin);
      return;
    }

    if (request.method === 'GET' && pathname === '/ecosystems') {
      const ids = await listEcosystemIds();
      const ecosystems = [];
      for (const id of ids) {
        ecosystems.push(await loadEcosystemManifest(id));
      }
      sendJson(response, 200, ecosystems, allowedOrigin);
      return;
    }

    if (request.method === 'POST' && pathname === '/ingestion/workspace-import') {
      const body = await readBody(request);
      const payloadIssue = validateCriticalPayload(pathname, body);
      if (payloadIssue) {
        sendJson(response, 400, { error: payloadIssue }, allowedOrigin);
        return;
      }
      const result = await withTimeout(importWorkspace(body), criticalTimeoutMs);
      sendJson(response, 201, result, allowedOrigin);
      return;
    }

    if (request.method === 'GET' && pathname === '/knowledge-bases') {
      sendJson(response, 200, await listKnowledgeBases(), allowedOrigin);
      return;
    }

    if (request.method === 'POST' && pathname === '/knowledge/ingest') {
      const body = await readBody(request);
      const payloadIssue = validateCriticalPayload(pathname, body);
      if (payloadIssue) {
        sendJson(response, 400, { error: payloadIssue }, allowedOrigin);
        return;
      }
      sendJson(response, 201, await withTimeout(ingestKnowledgeSources(body), criticalTimeoutMs), allowedOrigin);
      return;
    }

    const knowledgeBaseMatch = pathname.match(/^\/knowledge-bases\/([^/]+)$/);
    if (request.method === 'GET' && knowledgeBaseMatch) {
      sendJson(response, 200, await loadKnowledgeBaseManifest(knowledgeBaseMatch[1]), allowedOrigin);
      return;
    }

    const knowledgeDocumentsMatch = pathname.match(/^\/knowledge-bases\/([^/]+)\/documents$/);
    if (request.method === 'GET' && knowledgeDocumentsMatch) {
      sendJson(response, 200, await loadKnowledgeDocuments(knowledgeDocumentsMatch[1]), allowedOrigin);
      return;
    }

    const ecosystemManifestMatch = pathname.match(/^\/ecosystems\/([^/]+)$/);
    if (request.method === 'GET' && ecosystemManifestMatch) {
      sendJson(response, 200, await loadEcosystemManifest(ecosystemManifestMatch[1]), allowedOrigin);
      return;
    }

    const graphMatch = pathname.match(/^\/ecosystems\/([^/]+)\/graph$/);
    if (request.method === 'GET' && graphMatch) {
      sendJson(response, 200, await loadArtifactGraph(graphMatch[1]), allowedOrigin);
      return;
    }

    const graphRebuildMatch = pathname.match(/^\/ecosystems\/([^/]+)\/graph\/rebuild$/);
    if (request.method === 'POST' && graphRebuildMatch) {
      const body = await readBody(request);
      const payloadIssue = validateCriticalPayload(pathname, body);
      if (payloadIssue) {
        sendJson(response, 400, { error: payloadIssue }, allowedOrigin);
        return;
      }
      sendJson(response, 200, await rebuildArtifactGraph(graphRebuildMatch[1], { ecosystemName: body.ecosystemName ?? graphRebuildMatch[1] }), allowedOrigin);
      return;
    }

    const graphQueryMatch = pathname.match(/^\/ecosystems\/([^/]+)\/graph\/query$/);
    if (request.method === 'POST' && graphQueryMatch) {
      const body = await readBody(request);
      const payloadIssue = validateCriticalPayload(pathname, body);
      if (payloadIssue) {
        sendJson(response, 400, { error: payloadIssue }, allowedOrigin);
        return;
      }
      const graph = await loadArtifactGraph(graphQueryMatch[1]);
      const result = body.queryType === 'lifecycle-trace'
        ? queryLifecycleTrace(graph, body.featureId ?? body.query ?? graphQueryMatch[1])
        : body.subgraphNodeIds?.length
          ? selectSubgraph(graph, body.subgraphNodeIds)
          : queryConnected(graph, body.startNodeIds, body);
      sendJson(response, 200, result, allowedOrigin);
      return;
    }

    const ragIndexMatch = pathname.match(/^\/ecosystems\/([^/]+)\/rag\/index$/);
    if (request.method === 'POST' && ragIndexMatch) {
      const body = await readBody(request);
      const payloadIssue = validateCriticalPayload(pathname, body);
      if (payloadIssue) {
        sendJson(response, 400, { error: payloadIssue }, allowedOrigin);
        return;
      }
      sendJson(response, 200, await indexEcosystem(ragIndexMatch[1], body), allowedOrigin);
      return;
    }

    const ragQueryMatch = pathname.match(/^\/ecosystems\/([^/]+)\/rag\/query$/);
    if (request.method === 'POST' && ragQueryMatch) {
      const body = await readBody(request);
      const payloadIssue = validateCriticalPayload(pathname, body);
      if (payloadIssue) {
        sendJson(response, 400, { error: payloadIssue }, allowedOrigin);
        return;
      }
      sendJson(response, 200, await retrieve(ragQueryMatch[1], body), allowedOrigin);
      return;
    }

    const ragStatusMatch = pathname.match(/^\/ecosystems\/([^/]+)\/rag\/status$/);
    if (request.method === 'GET' && ragStatusMatch) {
      sendJson(response, 200, await buildRagStatus(ragStatusMatch[1]), allowedOrigin);
      return;
    }

    const exportMatch = pathname.match(/^\/ecosystems\/([^/]+)\/export$/);
    if (request.method === 'POST' && exportMatch) {
      const body = await readBody(request);
      const payloadIssue = validateCriticalPayload(pathname, body);
      if (payloadIssue) {
        sendJson(response, 400, { error: payloadIssue }, allowedOrigin);
        return;
      }
      sendJson(response, 200, await packageExport(exportMatch[1], body.selection ?? body, body), allowedOrigin);
      return;
    }

    const importMatch = pathname.match(/^\/ecosystems\/([^/]+)\/import$/);
    if (request.method === 'POST' && importMatch) {
      const body = await readBody(request);
      const payloadIssue = validateCriticalPayload(pathname, body);
      if (payloadIssue) {
        sendJson(response, 400, { error: payloadIssue }, allowedOrigin);
        return;
      }
      sendJson(response, 200, await importExportPackage(importMatch[1], body.archive ?? body, body), allowedOrigin);
      return;
    }

    const pipelineCreateMatch = pathname.match(/^\/pipelines\/create$/);
    if (request.method === 'POST' && pipelineCreateMatch) {
      const body = await readBody(request);
      const payloadIssue = validateCriticalPayload(pathname, body);
      if (payloadIssue) {
        sendJson(response, 400, { error: payloadIssue }, allowedOrigin);
        return;
      }
      const pipeline = composePipeline(body);
      const dir = path.join(stateRoot, 'ecosystems', pipeline.ecosystemId, 'pipelines');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, `${pipeline.pipelineId.replace(/[:/]+/g, '-')}.json`), `${JSON.stringify(pipeline, null, 2)}\n`, 'utf8');
      sendJson(response, 201, pipeline, allowedOrigin);
      return;
    }

    const pipelineLaunchMatch = pathname.match(/^\/pipelines\/([^/]+)\/launch$/);
    if (request.method === 'POST' && pipelineLaunchMatch) {
      const body = await readBody(request);
      const payloadIssue = validateCriticalPayload(pathname, body);
      if (payloadIssue) {
        sendJson(response, 400, { error: payloadIssue }, allowedOrigin);
        return;
      }
      const pipelineId = pipelineLaunchMatch[1];
      const pipeline = await loadPipeline(body.ecosystemId, pipelineId);
      if (!pipeline) {
        sendJson(response, 404, { error: 'pipeline_not_found' }, allowedOrigin);
        return;
      }
      const result = await dispatchPipeline(pipeline, body);
      sendJson(response, 200, result, allowedOrigin);
      return;
    }

    const pipelineStatusMatch = pathname.match(/^\/pipelines\/([^/]+)\/status$/);
    if (request.method === 'GET' && pipelineStatusMatch) {
      const ecosystemId = url.searchParams.get('ecosystemId');
      if (!ecosystemId) {
        sendJson(response, 400, { error: 'ecosystemId query required' }, allowedOrigin);
        return;
      }
      sendJson(response, 200, await loadPipeline(ecosystemId, pipelineStatusMatch[1]), allowedOrigin);
      return;
    }

    const pipelinePauseMatch = pathname.match(/^\/pipelines\/([^/]+)\/pause$/);
    if (request.method === 'POST' && pipelinePauseMatch) {
      const body = await readBody(request);
      const payloadIssue = validateCriticalPayload(pathname, body);
      if (payloadIssue) {
        sendJson(response, 400, { error: payloadIssue }, allowedOrigin);
        return;
      }
      const state = await loadPipeline(body.ecosystemId, pipelinePauseMatch[1]);
      if (!state) {
        sendJson(response, 404, { error: 'pipeline_not_found' }, allowedOrigin);
        return;
      }
      state.status = 'paused';
      state.updatedAt = nowIso();
      await fs.mkdir(path.join(stateRoot, 'ecosystems', body.ecosystemId, 'pipelines'), { recursive: true });
      await fs.writeFile(path.join(stateRoot, 'ecosystems', body.ecosystemId, 'pipelines', `${pipelinePauseMatch[1].replace(/[:/]+/g, '-')}.json`), `${JSON.stringify(state, null, 2)}\n`, 'utf8');
      sendJson(response, 200, state, allowedOrigin);
      return;
    }

    const pipelineResumeMatch = pathname.match(/^\/pipelines\/([^/]+)\/resume$/);
    if (request.method === 'POST' && pipelineResumeMatch) {
      const body = await readBody(request);
      const payloadIssue = validateCriticalPayload(pathname, body);
      if (payloadIssue) {
        sendJson(response, 400, { error: payloadIssue }, allowedOrigin);
        return;
      }
      const state = await loadPipeline(body.ecosystemId, pipelineResumeMatch[1]);
      if (!state) {
        sendJson(response, 404, { error: 'pipeline_not_found' }, allowedOrigin);
        return;
      }
      state.status = 'running';
      state.updatedAt = nowIso();
      await fs.mkdir(path.join(stateRoot, 'ecosystems', body.ecosystemId, 'pipelines'), { recursive: true });
      await fs.writeFile(path.join(stateRoot, 'ecosystems', body.ecosystemId, 'pipelines', `${pipelineResumeMatch[1].replace(/[:/]+/g, '-')}.json`), `${JSON.stringify(state, null, 2)}\n`, 'utf8');
      sendJson(response, 200, state, allowedOrigin);
      return;
    }

    const visualizationsMatch = pathname.match(/^\/ecosystems\/([^/]+)\/visualizations$/);
    if (request.method === 'GET' && visualizationsMatch) {
      sendJson(response, 200, await loadVisualizationIndex(visualizationsMatch[1]), allowedOrigin);
      return;
    }

    const profilesMatch = pathname.match(/^\/ecosystems\/([^/]+)\/profiles$/);
    if (request.method === 'GET' && profilesMatch) {
      sendJson(response, 200, await loadProfileIndex(profilesMatch[1]), allowedOrigin);
      return;
    }

    const gapMatch = pathname.match(/^\/ecosystems\/([^/]+)\/analysis\/gap$/);
    if (request.method === 'GET' && gapMatch) {
      sendJson(response, 200, await readJson(path.join(stateRoot, 'ecosystems', gapMatch[1], 'analysis', 'gap-report.json'), null), allowedOrigin);
      return;
    }

    if (request.method === 'POST' && pathname === '/analysis/blast-radius') {
      const body = await readBody(request);
      const payloadIssue = validateCriticalPayload(pathname, body);
      if (payloadIssue) {
        sendJson(response, 400, { error: payloadIssue }, allowedOrigin);
        return;
      }
      const result = await withTimeout(assessSystemImpact(body.ecosystemId, body.query), criticalTimeoutMs);
      sendJson(response, 200, result, allowedOrigin);
      return;
    }

    if (request.method === 'POST' && pathname === '/analysis/gaps') {
      const body = await readBody(request);
      const payloadIssue = validateCriticalPayload(pathname, body);
      if (payloadIssue) {
        sendJson(response, 400, { error: payloadIssue }, allowedOrigin);
        return;
      }
      const ecosystem = await loadEcosystemManifest(body.ecosystemId);
      const report = await analyzeKnowledgeGaps(ecosystem, body.knowledgeBaseId ?? null);
      await writeGapReport(report);
      sendJson(response, 200, report, allowedOrigin);
      return;
    }

    if (request.method === 'POST' && pathname === '/analysis/focus') {
      const body = await readBody(request);
      const graph = await loadGraph(body.ecosystemId, body.ecosystemId);
      const result = body.persist === false
        ? buildFocusView(graph, body.query)
        : await writeFocusView(graph, body.query);
      sendJson(response, 200, result, allowedOrigin);
      return;
    }

    if (request.method === 'POST' && pathname === '/planning/create') {
      const body = await readBody(request);
      const payloadIssue = validateCriticalPayload(pathname, body);
      if (payloadIssue) {
        sendJson(response, 400, { error: payloadIssue }, allowedOrigin);
        return;
      }
      const plan = await withTimeout(createPlan(body), criticalTimeoutMs);
      sendJson(response, 201, plan, allowedOrigin);
      return;
    }

    if (request.method === 'POST' && pathname === '/operator/workspace-target') {
      const body = await readBody(request);
      const payloadIssue = validateCriticalPayload(pathname, body);
      if (payloadIssue) {
        sendJson(response, 400, { error: payloadIssue }, allowedOrigin);
        return;
      }
      const candidates = resolveWorkspaceCandidates(body);
      const selected = chooseWorkspaceTarget({ candidates, targetId: body.targetId, source: body.source });
      const saved = await saveWorkspaceTarget(body.ecosystemId, selected);
      sendJson(response, 201, { target: saved, candidates, ambiguous: candidates.length > 1 }, allowedOrigin);
      return;
    }

    const workspaceTargetMatch = pathname.match(/^\/ecosystems\/([^/]+)\/operator\/workspace-target$/);
    if (request.method === 'GET' && workspaceTargetMatch) {
      sendJson(response, 200, await loadWorkspaceTarget(workspaceTargetMatch[1]), allowedOrigin);
      return;
    }

    const contextCartCollectionMatch = pathname.match(/^\/ecosystems\/([^/]+)\/operator\/context-carts$/);
    if (request.method === 'GET' && contextCartCollectionMatch) {
      sendJson(response, 200, await listContextCarts(contextCartCollectionMatch[1]), allowedOrigin);
      return;
    }
    if (request.method === 'POST' && contextCartCollectionMatch) {
      const body = await readBody(request);
      let cart = createContextCart(body);
      for (const item of body.items ?? []) {
        cart = addContextCartItem(cart, item);
      }
      sendJson(response, 201, await saveContextCart(contextCartCollectionMatch[1], cart), allowedOrigin);
      return;
    }

    const contextCartMatch = pathname.match(/^\/ecosystems\/([^/]+)\/operator\/context-carts\/([^/]+)$/);
    if (request.method === 'GET' && contextCartMatch) {
      sendJson(response, 200, await loadContextCart(contextCartMatch[1], contextCartMatch[2]), allowedOrigin);
      return;
    }

    const contextCartItemMatch = pathname.match(/^\/ecosystems\/([^/]+)\/operator\/context-carts\/([^/]+)\/items$/);
    if (request.method === 'POST' && contextCartItemMatch) {
      const body = await readBody(request);
      const current = await loadContextCart(contextCartItemMatch[1], contextCartItemMatch[2]);
      if (!current) {
        sendJson(response, 404, { error: 'context_cart_not_found' }, allowedOrigin);
        return;
      }
      const next = addContextCartItem(current, body);
      sendJson(response, 200, await saveContextCart(contextCartItemMatch[1], next), allowedOrigin);
      return;
    }

    const refinementCollectionMatch = pathname.match(/^\/ecosystems\/([^/]+)\/operator\/refinement-sessions$/);
    if (request.method === 'GET' && refinementCollectionMatch) {
      sendJson(response, 200, await listRefinementSessions(refinementCollectionMatch[1]), allowedOrigin);
      return;
    }
    if (request.method === 'POST' && refinementCollectionMatch) {
      const body = await readBody(request);
      const cart = await loadContextCart(refinementCollectionMatch[1], body.contextCartId);
      const session = createRefinementSession({
        ...body,
        contextCart: cart
      });
      sendJson(response, 201, await saveRefinementSession(refinementCollectionMatch[1], session), allowedOrigin);
      return;
    }

    const refinementMatch = pathname.match(/^\/ecosystems\/([^/]+)\/operator\/refinement-sessions\/([^/]+)$/);
    if (request.method === 'GET' && refinementMatch) {
      sendJson(response, 200, await loadRefinementSession(refinementMatch[1], refinementMatch[2]), allowedOrigin);
      return;
    }

    const visualArtifactCollectionMatch = pathname.match(/^\/ecosystems\/([^/]+)\/operator\/visual-artifacts$/);
    if (request.method === 'GET' && visualArtifactCollectionMatch) {
      sendJson(response, 200, await listVisualArtifacts(visualArtifactCollectionMatch[1]), allowedOrigin);
      return;
    }
    if (request.method === 'POST' && visualArtifactCollectionMatch) {
      const body = await readBody(request);
      const artifact = buildVisualArtifact(body);
      sendJson(response, 201, await saveVisualArtifact(visualArtifactCollectionMatch[1], artifact), allowedOrigin);
      return;
    }

    const visualArtifactMatch = pathname.match(/^\/ecosystems\/([^/]+)\/operator\/visual-artifacts\/([^/]+)$/);
    if (request.method === 'GET' && visualArtifactMatch) {
      sendJson(response, 200, await loadVisualArtifact(visualArtifactMatch[1], visualArtifactMatch[2]), allowedOrigin);
      return;
    }

    const budgetSnapshotMatch = pathname.match(/^\/ecosystems\/([^/]+)\/operator\/budget-snapshot$/);
    if (request.method === 'GET' && budgetSnapshotMatch) {
      const target = await loadWorkspaceTarget(budgetSnapshotMatch[1]);
      sendJson(response, 200, buildAdvisoryBudgetSnapshot({ workspaceTargetId: target?.targetId }), allowedOrigin);
      return;
    }

    const sessionBoardMatch = pathname.match(/^\/ecosystems\/([^/]+)\/operator\/session-board$/);
    if (request.method === 'GET' && sessionBoardMatch) {
      const ecosystemId = sessionBoardMatch[1];
      const [plans, runs, refinements] = await Promise.all([
        listPlans(ecosystemId),
        listRuns(ecosystemId),
        listRefinementSessions(ecosystemId)
      ]);
      const budgetSnapshot = buildAdvisoryBudgetSnapshot({
        workspaceTargetId: (await loadWorkspaceTarget(ecosystemId))?.targetId
      });
      sendJson(response, 200, buildExecutionSessionBoard({
        plans,
        runs,
        refinements,
        budgetSnapshots: [budgetSnapshot]
      }), allowedOrigin);
      return;
    }

    const planningBoardMatch = pathname.match(/^\/ecosystems\/([^/]+)\/operator\/planning-board$/);
    if (request.method === 'GET' && planningBoardMatch) {
      const ecosystemId = planningBoardMatch[1];
      const plans = await listPlans(ecosystemId);
      const details = await Promise.all(plans.slice(0, 5).map(async (planHeader) => projectPlanForBoard(await loadPlan(planHeader.id))));
      sendJson(response, 200, details, allowedOrigin);
      return;
    }

    if (request.method === 'GET' && pathname === '/plans') {
      const ecosystemIdFilter = url.searchParams.get('ecosystemId') ?? null;
      sendJson(response, 200, await listPlans(ecosystemIdFilter), allowedOrigin);
      return;
    }

    const planMatch = pathname.match(/^\/plans\/([^/]+)$/);
    if (request.method === 'GET' && planMatch) {
      sendJson(response, 200, await loadPlan(planMatch[1]), allowedOrigin);
      return;
    }

    const approveMatch = pathname.match(/^\/plans\/([^/]+)\/(approve|reject|auto-approval)$/);
    if (request.method === 'POST' && approveMatch) {
      const [, planId, mode] = approveMatch;
      const body = await readBody(request);
      let update = {};
      if (mode === 'approve') {
        update = {
          status: 'approved',
          approvedBy: body.approvedBy ?? 'human',
          autoStartOnApproval: body.autoStartOnApproval ?? false,
          notes: body.notes ?? null
        };
      } else if (mode === 'reject') {
        update = {
          status: 'rejected',
          approvedBy: body.rejectedBy ?? 'human',
          notes: body.reason ?? null
        };
      } else {
        update = {
          status: body.enabled ? 'approved' : 'pending',
          autoApprove: Boolean(body.enabled),
          mode: body.enabled ? 'auto' : 'manual',
          autoStartOnApproval: Boolean(body.autoStartOnApproval)
        };
      }
      sendJson(response, 200, await withTimeout(updatePlanApproval(planId, update), criticalTimeoutMs), allowedOrigin);
      return;
    }

    if (request.method === 'POST' && pathname === '/runs/start') {
      const body = await readBody(request);
      const payloadIssue = validateCriticalPayload(pathname, body);
      if (payloadIssue) {
        sendJson(response, 400, { error: payloadIssue }, allowedOrigin);
        return;
      }
      const run = await withTimeout(createRunForPlan(body.planId, body), criticalTimeoutMs);
      const started = await withTimeout(transitionRun(run.id, 'start'), criticalTimeoutMs);
      if (shouldExecuteLocally(started)) {
        scheduleLocalShellExecution(started.id);
      }
      sendJson(response, 201, started, allowedOrigin);
      return;
    }

    const ralphSyncMatch = pathname.match(/^\/runs\/([^/]+)\/ralph-sync$/);
    if (request.method === 'POST' && ralphSyncMatch) {
      const body = await readBody(request);
      const prdPath = body.prdPath;
      const projectName = body.projectName ?? 'default';
      if (!prdPath) {
        sendJson(response, 400, { error: 'prdPath required' }, allowedOrigin);
        return;
      }
      const report = await syncRalphProgress(prdPath, projectName);
      sendJson(response, 200, { runId: ralphSyncMatch[1], ...report }, allowedOrigin);
      return;
    }

    const evidenceBundleMatch = pathname.match(/^\/runs\/([^/]+)\/evidence-bundle$/);
    if (request.method === 'GET' && evidenceBundleMatch) {
      const result = await assembleEvidenceBundle(evidenceBundleMatch[1]);
      sendJson(response, 200, result, allowedOrigin);
      return;
    }

    if (request.method === 'GET' && pathname === '/runs') {
      const ecosystemIdFilter = url.searchParams.get('ecosystemId') ?? null;
      sendJson(response, 200, await listRuns(ecosystemIdFilter), allowedOrigin);
      return;
    }

    if (request.method === 'GET' && pathname === '/pipelines') {
      const ecosystemIdFilter = url.searchParams.get('ecosystemId') ?? null;
      if (!ecosystemIdFilter) {
        sendJson(response, 400, { error: 'ecosystemId query required' }, allowedOrigin);
        return;
      }
      sendJson(response, 200, await listPipelines(ecosystemIdFilter), allowedOrigin);
      return;
    }

    const runMatch = pathname.match(/^\/runs\/([^/]+)$/);
    if (request.method === 'GET' && runMatch) {
      sendJson(response, 200, await loadRun(runMatch[1]), allowedOrigin);
      return;
    }

    const runControlMatch = pathname.match(/^\/runs\/([^/]+)\/(pause|resume|stop|start)$/);
    if (request.method === 'POST' && runControlMatch) {
      const [, runId, action] = runControlMatch;
      sendJson(response, 200, await withTimeout(transitionRun(runId, action), criticalTimeoutMs), allowedOrigin);
      return;
    }

    if (request.method === 'POST' && pathname === '/graph/patch') {
      const body = await readBody(request);
      const payloadIssue = validateCriticalPayload(pathname, body);
      if (payloadIssue) {
        sendJson(response, 400, { error: payloadIssue }, allowedOrigin);
        return;
      }
      const graph = await loadGraph(body.ecosystemId, body.ecosystemId);
      const patched = applyGraphPatches(graph, body.patches ?? []);
      await saveGraph(patched);
      sendJson(response, 200, patched, allowedOrigin);
      return;
    }

    if (request.method === 'POST' && pathname === '/environments/scaffold') {
      const body = await readBody(request);
      sendJson(response, 200, await withTimeout(scaffoldEnvironment(body), criticalTimeoutMs), allowedOrigin);
      return;
    }

    if (request.method === 'GET' && pathname === '/environments/detect') {
      const targetDir = url.searchParams.get('targetDir');
      if (!targetDir) {
        sendJson(response, 400, { error: 'targetDir query required' }, allowedOrigin);
        return;
      }
      sendJson(response, 200, await detectEnvironmentArtifacts(targetDir), allowedOrigin);
      return;
    }

    if (request.method === 'GET' && pathname === '/planning/context') {
      const ecosystemId = url.searchParams.get('ecosystemId');
      const knowledgeBaseId = url.searchParams.get('knowledgeBaseId');
      if (!ecosystemId) {
        sendJson(response, 400, { error: 'ecosystemId query required' }, allowedOrigin);
        return;
      }
      sendJson(response, 200, await buildLayeredPlanningContext(ecosystemId, knowledgeBaseId), allowedOrigin);
      return;
    }

    if (request.method === 'GET' && pathname === '/planning/readiness') {
      const ecosystemId = url.searchParams.get('ecosystemId');
      const sessionId = url.searchParams.get('sessionId');
      if (!ecosystemId || !sessionId) {
        sendJson(response, 400, { error: 'ecosystemId and sessionId query required' }, allowedOrigin);
        return;
      }
      const session = await loadRefinementSession(ecosystemId, sessionId);
      sendJson(response, 200, {
        ready: canGeneratePlanFromRefinement(session),
        session
      }, allowedOrigin);
      return;
    }

    if (request.method === 'GET' && pathname === '/swarm/registry') {
      sendJson(response, 200, await loadSwarmRegistry(), allowedOrigin);
      return;
    }

    if (request.method === 'POST' && pathname === '/swarm/orchestration-stub') {
      const body = await readBody(request);
      sendJson(response, 200, await withTimeout(buildSwarmOrchestrationStub(body), criticalTimeoutMs), allowedOrigin);
      return;
    }

    const debateMatch = pathname.match(/^\/plans\/([^/]+)\/debate$/);
    if (debateMatch && request.method === 'GET') {
      sendJson(response, 200, await loadDebate(debateMatch[1]), allowedOrigin);
      return;
    }

    if (debateMatch && request.method === 'POST') {
      const body = await readBody(request);
      sendJson(response, 201, await withTimeout(appendDebateRound(debateMatch[1], body), criticalTimeoutMs), allowedOrigin);
      return;
    }

    const projectGatesMatch = pathname.match(/^\/projects\/([^/]+)\/gates$/);
    if (request.method === 'GET' && projectGatesMatch) {
      const name = projectGatesMatch[1];
      const [compliance, policy] = await Promise.all([checkCompliance(name), getPhasePolicy(name)]);
      sendJson(response, 200, { project: name, compliance, policy }, allowedOrigin);
      return;
    }

    if (request.method === 'GET' && pathname === '/trace/forward') {
      const ecosystemId = url.searchParams.get('ecosystemId');
      const nodeId = url.searchParams.get('nodeId');
      if (!ecosystemId || !nodeId) {
        sendJson(response, 400, { error: 'ecosystemId and nodeId required' }, allowedOrigin);
        return;
      }
      sendJson(response, 200, await traceForwardFromNode(ecosystemId, nodeId), allowedOrigin);
      return;
    }

    if (request.method === 'GET' && pathname === '/trace/backward') {
      const ecosystemId = url.searchParams.get('ecosystemId');
      const nodeId = url.searchParams.get('nodeId');
      if (!ecosystemId || !nodeId) {
        sendJson(response, 400, { error: 'ecosystemId and nodeId required' }, allowedOrigin);
        return;
      }
      sendJson(response, 200, await traceBackwardToNode(ecosystemId, nodeId), allowedOrigin);
      return;
    }

    if (request.method === 'GET' && pathname === '/trace/file') {
      const ecosystemId = url.searchParams.get('ecosystemId');
      const filePath = url.searchParams.get('path');
      if (!ecosystemId || !filePath) {
        sendJson(response, 400, { error: 'ecosystemId and path required' }, allowedOrigin);
        return;
      }
      sendJson(response, 200, await traceFileHeuristic(ecosystemId, filePath), allowedOrigin);
      return;
    }

    // ── Continuity / Project State ──
    const projectInitMatch = pathname.match(/^\/projects\/([^/]+)\/init$/);
    if (request.method === 'POST' && projectInitMatch) {
      const body = await readBody(request);
      const state = await withTimeout(initProject(projectInitMatch[1], body.objective || 'No objective specified'), criticalTimeoutMs);
      sendJson(response, 200, state, allowedOrigin);
      return;
    }

    const projectStatusMatch = pathname.match(/^\/projects\/([^/]+)\/status$/);
    if (request.method === 'GET' && projectStatusMatch) {
      const state = await readState(projectStatusMatch[1]);
      sendJson(response, 200, {
        project: state.project.name,
        phase: state.currentPhase.id,
        phaseStatus: state.currentPhase.status,
        branch: state.activeBranch,
        blockers: state.blockedBy,
        doneCriteria: state.doneCriteria,
        nextCommands: state.nextCommandSet
      }, allowedOrigin);
      return;
    }

    const projectTransitionMatch = pathname.match(/^\/projects\/([^/]+)\/transition$/);
    if (request.method === 'POST' && projectTransitionMatch) {
      const body = await readBody(request);
      const payloadIssue = validateCriticalPayload(pathname, body);
      if (payloadIssue) {
        sendJson(response, 400, { error: payloadIssue }, allowedOrigin);
        return;
      }
      const state = await withTimeout(transitionPhase(projectTransitionMatch[1], body.phase, body.notes || ''), criticalTimeoutMs);
      sendJson(response, 200, state, allowedOrigin);
      return;
    }

    const projectBlockerMatch = pathname.match(/^\/projects\/([^/]+)\/blocker$/);
    if (request.method === 'POST' && projectBlockerMatch) {
      const body = await readBody(request);
      const state = await withTimeout(addBlocker(projectBlockerMatch[1], body.description), criticalTimeoutMs);
      sendJson(response, 200, state, allowedOrigin);
      return;
    }

    const projectBlockerResolveMatch = pathname.match(/^\/projects\/([^/]+)\/blocker\/(\d+)$/);
    if (request.method === 'DELETE' && projectBlockerResolveMatch) {
      const state = await withTimeout(resolveBlocker(projectBlockerResolveMatch[1], parseInt(projectBlockerResolveMatch[2], 10)), criticalTimeoutMs);
      sendJson(response, 200, state, allowedOrigin);
      return;
    }

    const projectResumeMatch = pathname.match(/^\/projects\/([^/]+)\/resume$/);
    if (request.method === 'GET' && projectResumeMatch) {
      const checklist = await getResumeChecklist(projectResumeMatch[1]);
      sendJson(response, 200, checklist, allowedOrigin);
      return;
    }

    const projectPolicyMatch = pathname.match(/^\/projects\/([^/]+)\/policy$/);
    if (request.method === 'GET' && projectPolicyMatch) {
      const policy = await getPhasePolicy(projectPolicyMatch[1]);
      sendJson(response, 200, policy, allowedOrigin);
      return;
    }

    const projectComplianceMatch = pathname.match(/^\/projects\/([^/]+)\/compliance$/);
    if (request.method === 'GET' && projectComplianceMatch) {
      const report = await checkCompliance(projectComplianceMatch[1]);
      sendJson(response, 200, report, allowedOrigin);
      return;
    }

    // ── Ontology ──
    if (request.method === 'GET' && pathname === '/ontology/phases') {
      const data = await readJson(path.join(repoRoot, 'ontology', 'phase-lifecycle.json'));
      sendJson(response, 200, data, allowedOrigin);
      return;
    }

    if (request.method === 'GET' && pathname === '/ontology/glossary') {
      const data = await readJson(path.join(repoRoot, 'ontology', 'glossary.json'));
      sendJson(response, 200, data, allowedOrigin);
      return;
    }

    if (request.method === 'GET' && pathname === '/ontology/principles') {
      const data = await readJson(path.join(repoRoot, 'ontology', 'principle-catalog.json'));
      sendJson(response, 200, data, allowedOrigin);
      return;
    }

    sendJson(response, 404, { error: 'not_found', pathname }, allowedOrigin);
  } catch (error) {
    sendJson(response, error.statusCode ?? 500, {
      error: 'internal_error',
      message: error.message,
      stack: process.env.FLAGSHIP_DEBUG === '1' ? error.stack : undefined
    }, allowedOrigin);
  }
}

export function createControlPlaneServer() {
  return http.createServer(handler);
}

const server = createControlPlaneServer();
if (process.env.FLAGSHIP_NO_AUTOSTART !== '1') {
  server.listen(port, () => {
    console.log(`[flagship-foundry] control plane listening on http://localhost:${port}`);
  });
}
