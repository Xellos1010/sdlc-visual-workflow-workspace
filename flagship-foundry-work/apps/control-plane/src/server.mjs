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

const port = Number(process.env.FLAGSHIP_PORT ?? 4010);
const serverFile = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(serverFile), '../../../');

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type'
  });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
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
  if (request.method === 'OPTIONS') {
    sendJson(response, 200, { ok: true });
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`);
  const pathname = url.pathname;

  try {
    if (request.method === 'GET' && pathname === '/health') {
      sendJson(response, 200, {
        ok: true,
        service: 'flagship-foundry-control-plane',
        port,
        repoRoot,
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (request.method === 'GET' && pathname === '/catalogs') {
      sendJson(response, 200, await loadCatalogs());
      return;
    }

    if (request.method === 'GET' && pathname === '/ecosystems') {
      const ids = await listEcosystemIds();
      const ecosystems = [];
      for (const id of ids) {
        ecosystems.push(await loadEcosystemManifest(id));
      }
      sendJson(response, 200, ecosystems);
      return;
    }

    if (request.method === 'POST' && pathname === '/ingestion/workspace-import') {
      const body = await readBody(request);
      const result = await importWorkspace(body);
      sendJson(response, 201, result);
      return;
    }

    if (request.method === 'GET' && pathname === '/knowledge-bases') {
      sendJson(response, 200, await listKnowledgeBases());
      return;
    }

    if (request.method === 'POST' && pathname === '/knowledge/ingest') {
      const body = await readBody(request);
      sendJson(response, 201, await ingestKnowledgeSources(body));
      return;
    }

    const knowledgeBaseMatch = pathname.match(/^\/knowledge-bases\/([^/]+)$/);
    if (request.method === 'GET' && knowledgeBaseMatch) {
      sendJson(response, 200, await loadKnowledgeBaseManifest(knowledgeBaseMatch[1]));
      return;
    }

    const knowledgeDocumentsMatch = pathname.match(/^\/knowledge-bases\/([^/]+)\/documents$/);
    if (request.method === 'GET' && knowledgeDocumentsMatch) {
      sendJson(response, 200, await loadKnowledgeDocuments(knowledgeDocumentsMatch[1]));
      return;
    }

    const ecosystemManifestMatch = pathname.match(/^\/ecosystems\/([^/]+)$/);
    if (request.method === 'GET' && ecosystemManifestMatch) {
      sendJson(response, 200, await loadEcosystemManifest(ecosystemManifestMatch[1]));
      return;
    }

    const graphMatch = pathname.match(/^\/ecosystems\/([^/]+)\/graph$/);
    if (request.method === 'GET' && graphMatch) {
      sendJson(response, 200, await loadGraph(graphMatch[1], graphMatch[1]));
      return;
    }

    const visualizationsMatch = pathname.match(/^\/ecosystems\/([^/]+)\/visualizations$/);
    if (request.method === 'GET' && visualizationsMatch) {
      sendJson(response, 200, await loadVisualizationIndex(visualizationsMatch[1]));
      return;
    }

    const profilesMatch = pathname.match(/^\/ecosystems\/([^/]+)\/profiles$/);
    if (request.method === 'GET' && profilesMatch) {
      sendJson(response, 200, await loadProfileIndex(profilesMatch[1]));
      return;
    }

    const gapMatch = pathname.match(/^\/ecosystems\/([^/]+)\/analysis\/gap$/);
    if (request.method === 'GET' && gapMatch) {
      sendJson(response, 200, await readJson(path.join(stateRoot, 'ecosystems', gapMatch[1], 'analysis', 'gap-report.json'), null));
      return;
    }

    if (request.method === 'POST' && pathname === '/analysis/blast-radius') {
      const body = await readBody(request);
      const result = await assessSystemImpact(body.ecosystemId, body.query);
      sendJson(response, 200, result);
      return;
    }

    if (request.method === 'POST' && pathname === '/analysis/gaps') {
      const body = await readBody(request);
      const ecosystem = await loadEcosystemManifest(body.ecosystemId);
      const report = await analyzeKnowledgeGaps(ecosystem, body.knowledgeBaseId ?? null);
      await writeGapReport(report);
      sendJson(response, 200, report);
      return;
    }

    if (request.method === 'POST' && pathname === '/analysis/focus') {
      const body = await readBody(request);
      const graph = await loadGraph(body.ecosystemId, body.ecosystemId);
      const result = body.persist === false
        ? buildFocusView(graph, body.query)
        : await writeFocusView(graph, body.query);
      sendJson(response, 200, result);
      return;
    }

    if (request.method === 'POST' && pathname === '/planning/create') {
      const body = await readBody(request);
      const plan = await createPlan(body);
      sendJson(response, 201, plan);
      return;
    }

    if (request.method === 'GET' && pathname === '/plans') {
      sendJson(response, 200, await listPlans());
      return;
    }

    const planMatch = pathname.match(/^\/plans\/([^/]+)$/);
    if (request.method === 'GET' && planMatch) {
      sendJson(response, 200, await loadPlan(planMatch[1]));
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
      sendJson(response, 200, await updatePlanApproval(planId, update));
      return;
    }

    if (request.method === 'POST' && pathname === '/runs/start') {
      const body = await readBody(request);
      const run = await createRunForPlan(body.planId, body);
      const started = await transitionRun(run.id, 'start');
      sendJson(response, 201, started);
      return;
    }

    if (request.method === 'GET' && pathname === '/runs') {
      sendJson(response, 200, await listRuns());
      return;
    }

    const runMatch = pathname.match(/^\/runs\/([^/]+)$/);
    if (request.method === 'GET' && runMatch) {
      sendJson(response, 200, await loadRun(runMatch[1]));
      return;
    }

    const runControlMatch = pathname.match(/^\/runs\/([^/]+)\/(pause|resume|stop|start)$/);
    if (request.method === 'POST' && runControlMatch) {
      const [, runId, action] = runControlMatch;
      sendJson(response, 200, await transitionRun(runId, action));
      return;
    }

    if (request.method === 'POST' && pathname === '/graph/patch') {
      const body = await readBody(request);
      const graph = await loadGraph(body.ecosystemId, body.ecosystemId);
      const patched = applyGraphPatches(graph, body.patches ?? []);
      await saveGraph(patched);
      sendJson(response, 200, patched);
      return;
    }

    if (request.method === 'POST' && pathname === '/environments/scaffold') {
      const body = await readBody(request);
      sendJson(response, 200, await scaffoldEnvironment(body));
      return;
    }

    // ── Continuity / Project State ──
    const projectInitMatch = pathname.match(/^\/projects\/([^/]+)\/init$/);
    if (request.method === 'POST' && projectInitMatch) {
      const body = await readBody(request);
      const state = await initProject(projectInitMatch[1], body.objective || 'No objective specified');
      sendJson(response, 200, state);
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
      });
      return;
    }

    const projectTransitionMatch = pathname.match(/^\/projects\/([^/]+)\/transition$/);
    if (request.method === 'POST' && projectTransitionMatch) {
      const body = await readBody(request);
      const state = await transitionPhase(projectTransitionMatch[1], body.phase, body.notes || '');
      sendJson(response, 200, state);
      return;
    }

    const projectBlockerMatch = pathname.match(/^\/projects\/([^/]+)\/blocker$/);
    if (request.method === 'POST' && projectBlockerMatch) {
      const body = await readBody(request);
      const state = await addBlocker(projectBlockerMatch[1], body.description);
      sendJson(response, 200, state);
      return;
    }

    const projectBlockerResolveMatch = pathname.match(/^\/projects\/([^/]+)\/blocker\/(\d+)$/);
    if (request.method === 'DELETE' && projectBlockerResolveMatch) {
      const state = await resolveBlocker(projectBlockerResolveMatch[1], parseInt(projectBlockerResolveMatch[2], 10));
      sendJson(response, 200, state);
      return;
    }

    const projectResumeMatch = pathname.match(/^\/projects\/([^/]+)\/resume$/);
    if (request.method === 'GET' && projectResumeMatch) {
      const checklist = await getResumeChecklist(projectResumeMatch[1]);
      sendJson(response, 200, checklist);
      return;
    }

    const projectPolicyMatch = pathname.match(/^\/projects\/([^/]+)\/policy$/);
    if (request.method === 'GET' && projectPolicyMatch) {
      const policy = await getPhasePolicy(projectPolicyMatch[1]);
      sendJson(response, 200, policy);
      return;
    }

    const projectComplianceMatch = pathname.match(/^\/projects\/([^/]+)\/compliance$/);
    if (request.method === 'GET' && projectComplianceMatch) {
      const report = await checkCompliance(projectComplianceMatch[1]);
      sendJson(response, 200, report);
      return;
    }

    // ── Ontology ──
    if (request.method === 'GET' && pathname === '/ontology/phases') {
      const data = await readJson(path.join(repoRoot, 'ontology', 'phase-lifecycle.json'));
      sendJson(response, 200, data);
      return;
    }

    if (request.method === 'GET' && pathname === '/ontology/glossary') {
      const data = await readJson(path.join(repoRoot, 'ontology', 'glossary.json'));
      sendJson(response, 200, data);
      return;
    }

    if (request.method === 'GET' && pathname === '/ontology/principles') {
      const data = await readJson(path.join(repoRoot, 'ontology', 'principle-catalog.json'));
      sendJson(response, 200, data);
      return;
    }

    sendJson(response, 404, { error: 'not_found', pathname });
  } catch (error) {
    sendJson(response, 500, {
      error: 'internal_error',
      message: error.message,
      stack: process.env.FLAGSHIP_DEBUG === '1' ? error.stack : undefined
    });
  }
}

const server = http.createServer(handler);
server.listen(port, () => {
  console.log(`[flagship-foundry] control plane listening on http://localhost:${port}`);
});
