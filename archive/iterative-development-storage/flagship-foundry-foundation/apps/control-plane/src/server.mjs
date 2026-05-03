import http from 'node:http';
import { URL } from 'node:url';
import { loadAllCatalogs } from '../../../packages/core/src/catalog.mjs';
import { applyAndSavePatch, loadGraph, summarizeGraph, runtimeGraphPath } from '../../../packages/core/src/graph-store.mjs';
import { planChangeRequest } from '../../../packages/core/src/planner.mjs';
import { saveChangeRequest } from '../../../packages/core/src/change-requests.mjs';
import { telemetryToChangeRequest } from '../../../services/telemetry-intake/src/index.mjs';

const port = Number(process.env.PORT || 4000);

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type'
  });
  res.end(JSON.stringify(payload, null, 2));
}

function collectJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 5_000_000) {
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

const catalogs = loadAllCatalogs();

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      sendJson(res, 200, { ok: true });
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, {
        status: 'ok',
        graphPath: runtimeGraphPath,
        graphSummary: summarizeGraph(loadGraph())
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/graph') {
      sendJson(res, 200, loadGraph());
      return;
    }

    if (req.method === 'POST' && url.pathname === '/graph/patch') {
      const payload = await collectJson(req);
      const nextGraph = applyAndSavePatch(payload.patches || []);
      sendJson(res, 200, { ok: true, summary: summarizeGraph(nextGraph), graph: nextGraph });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/change-requests') {
      const payload = await collectJson(req);
      const path = saveChangeRequest(payload);
      sendJson(res, 201, { ok: true, storedAt: path, requestId: payload.requestId });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/orchestration/plan') {
      const payload = await collectJson(req);
      sendJson(res, 200, planChangeRequest(payload));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/telemetry/intake') {
      const payload = await collectJson(req);
      const changeRequest = telemetryToChangeRequest(payload);
      sendJson(res, 200, { changeRequest, plan: planChangeRequest(changeRequest) });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/catalogs/runbooks') {
      sendJson(res, 200, catalogs.runbooks);
      return;
    }
    if (req.method === 'GET' && url.pathname === '/catalogs/personas') {
      sendJson(res, 200, catalogs.personas);
      return;
    }
    if (req.method === 'GET' && url.pathname === '/catalogs/providers') {
      sendJson(res, 200, catalogs.providers);
      return;
    }
    if (req.method === 'GET' && url.pathname === '/catalogs/adapters') {
      sendJson(res, 200, catalogs.adapters);
      return;
    }
    if (req.method === 'GET' && url.pathname === '/catalogs/guardrails') {
      sendJson(res, 200, catalogs.guardrails);
      return;
    }

    sendJson(res, 404, { error: 'Not found', path: url.pathname });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
});

server.listen(port, () => {
  console.log(`Flagship Foundry control plane listening on http://localhost:${port}`);
});
