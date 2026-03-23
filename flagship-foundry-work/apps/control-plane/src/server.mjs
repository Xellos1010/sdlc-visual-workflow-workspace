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
import { detectEnvironmentArtifacts } from '../../../packages/core/src/environment-detect.mjs';

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

function parseBearerToken(request) {
  const authHeader = request.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

export function authorizeRequest(request, pathname) {
  const clientIp = getClientIp(request, { trustForwardedFor: false });
  if (allowLoopbackNoAuth && isLoopbackAddress(clientIp)) {
    return { ok: true, reason: 'loopback_no_auth' };
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
  const pathname = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`).pathname;
  const allowedOrigin = resolveAllowedOrigin(request);

  if (allowedOrigin === '__denied__') {
    sendJson(response, 403, { error: 'origin_not_allowed' }, null);
    return;
  }

  if (request.method === 'OPTIONS') {
    sendJson(response, 200, { ok: true }, allowedOrigin);
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
      sendJson(response, 200, await loadGraph(graphMatch[1], graphMatch[1]), allowedOrigin);
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

    if (request.method === 'GET' && pathname === '/plans') {
      sendJson(response, 200, await listPlans(), allowedOrigin);
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
      sendJson(response, 200, await listRuns(), allowedOrigin);
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
