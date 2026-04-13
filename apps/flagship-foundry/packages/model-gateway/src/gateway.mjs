import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { nowIso, makeId } from '../../core/src/io.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const GATEWAY_PORT = Number(process.env.GATEWAY_PORT ?? process.env.MODEL_GATEWAY_PORT ?? 4011);

// ---------------------------------------------------------------------------
// Config loading
// ---------------------------------------------------------------------------

const ROUTING_CONFIG_PATH = path.resolve(
  __dirname,
  '../../../configs/model-routing/default.json'
);

function loadRoutingConfig() {
  try {
    const raw = fs.readFileSync(ROUTING_CONFIG_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    process.stderr.write(
      `[model-gateway] WARN: Could not load routing config at ${ROUTING_CONFIG_PATH}: ${err.message}\n`
    );
    return null;
  }
}

function loadJsonConfig(relativePath, fallback) {
  try {
    const raw = fs.readFileSync(path.resolve(__dirname, relativePath), 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function providerHealthFromRouting(providerName, routingConfig) {
  const provider = routingConfig?.providers?.[providerName];
  if (!provider) return { health: 'unknown', configured: false, notes: ['Provider route not configured'] };
  if (provider.apiKeyEnv && !process.env[provider.apiKeyEnv]) {
    return { health: 'degraded', configured: false, notes: [`Missing ${provider.apiKeyEnv}`] };
  }
  return { health: 'healthy', configured: true, notes: [] };
}

function buildEmbeddingVector(text, dimensions = 16) {
  const hash = crypto.createHash('sha256').update(String(text ?? '')).digest();
  const vector = [];
  for (let index = 0; index < dimensions; index += 1) {
    vector.push(Number((hash[index % hash.length] / 255).toFixed(6)));
  }
  return vector;
}

export function buildAdvisoryBudgetSnapshot({ workspaceTargetId, routingConfig = loadRoutingConfig() } = {}) {
  const providersCatalog = loadJsonConfig('../../../configs/providers/providers.json', { providers: [] });
  const adapterDir = path.resolve(__dirname, '../../../configs/terminal-adapters');
  const adapterFiles = fs.existsSync(adapterDir) ? fs.readdirSync(adapterDir).filter((entry) => entry.endsWith('.json')) : [];
  const adaptersCatalog = adapterFiles.map((entry) => loadJsonConfig(`../../../configs/terminal-adapters/${entry}`, null)).filter(Boolean);
  const defaultRoute = resolveRoute(routingConfig ?? { providers: {}, defaultProvider: 'unknown', defaultModel: 'unknown' }, null, null);

  return {
    snapshotId: makeId('budget', workspaceTargetId ?? nowIso()),
    workspaceTargetId: workspaceTargetId ?? 'target:unknown',
    advisoryStatus: 'informational',
    createdAt: nowIso(),
    usageWindow: {
      startedAt: nowIso(),
      endedAt: nowIso()
    },
    defaultRoute: {
      provider: defaultRoute.provider,
      model: defaultRoute.model,
      taskClass: null,
      tier: null,
      fallbackProvider: defaultRoute.fallbackProvider ?? null
    },
    providers: (providersCatalog.providers ?? []).map((provider) => {
      const routeStatus = providerHealthFromRouting(provider.providerId.replace('provider:', '').replace('-cloud', ''), routingConfig);
      return {
        providerId: provider.providerId,
        displayName: provider.displayName,
        riskFit: provider.riskFit,
        health: routeStatus.health,
        configured: routeStatus.configured,
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        },
        thresholds: {
          unit: 'tokens',
          softLimit: 100000,
          hardLimit: 200000
        },
        notes: [...routeStatus.notes, ...(provider.roles ?? []).map((role) => `role:${role}`)]
      };
    }),
    adapters: adaptersCatalog.map((adapter) => ({
      adapterId: adapter.id,
      displayName: adapter.name,
      transport: adapter.transport,
      availability: 'available',
      supportsMcp: adapter.transport === 'mcp-or-cli',
      notes: [adapter.notes].filter(Boolean)
    })),
    connectors: []
  };
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

/**
 * Make an outbound HTTP/HTTPS request and return { statusCode, headers, body }.
 * body is a parsed object when Content-Type is application/json, otherwise a string.
 */
function request(url, options, bodyStr) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === 'https:';
    const lib = isHttps ? https : http;

    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + (parsed.search || ''),
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const outReq = lib.request(reqOptions, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        let body;
        const ct = res.headers['content-type'] || '';
        if (ct.includes('application/json')) {
          try {
            body = JSON.parse(raw);
          } catch {
            body = raw;
          }
        } else {
          body = raw;
        }
        resolve({ statusCode: res.statusCode, headers: res.headers, body });
      });
    });

    outReq.on('error', reject);

    if (bodyStr) {
      outReq.write(bodyStr);
    }
    outReq.end();
  });
}

// ---------------------------------------------------------------------------
// Provider reachability check (used for /health and fallback detection)
// ---------------------------------------------------------------------------

async function isReachable(baseUrl, timeoutMs = 2000) {
  return new Promise((resolve) => {
    const parsed = new URL(baseUrl);
    const isHttps = parsed.protocol === 'https:';
    const lib = isHttps ? https : http;

    const req = lib.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (isHttps ? 443 : 80),
        path: '/',
        method: 'HEAD',
        timeout: timeoutMs,
      },
      () => resolve(true)
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Format converters
// ---------------------------------------------------------------------------

/**
 * Convert OpenAI chat/completions request body to Anthropic messages API body.
 * Ref: https://docs.anthropic.com/en/api/messages
 */
function openAiToAnthropic(openAiBody, model) {
  const messages = (openAiBody.messages || []).filter((m) => m.role !== 'system');
  const systemMsg = (openAiBody.messages || [])
    .filter((m) => m.role === 'system')
    .map((m) => m.content)
    .join('\n')
    .trim();

  const anthropicBody = {
    model,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    max_tokens: openAiBody.max_tokens ?? 4096,
  };

  if (systemMsg) {
    anthropicBody.system = systemMsg;
  }
  if (openAiBody.temperature !== undefined) {
    anthropicBody.temperature = openAiBody.temperature;
  }
  if (openAiBody.top_p !== undefined) {
    anthropicBody.top_p = openAiBody.top_p;
  }

  return anthropicBody;
}

/**
 * Convert Anthropic messages API response to OpenAI chat/completions response shape.
 */
function anthropicToOpenAi(anthropicResponse, requestedModel) {
  const content = anthropicResponse.content ?? [];
  const text = content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');

  return {
    id: anthropicResponse.id ?? `chatcmpl-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: requestedModel,
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content: text },
        finish_reason: anthropicResponse.stop_reason ?? 'stop',
      },
    ],
    usage: {
      prompt_tokens: anthropicResponse.usage?.input_tokens ?? 0,
      completion_tokens: anthropicResponse.usage?.output_tokens ?? 0,
      total_tokens:
        (anthropicResponse.usage?.input_tokens ?? 0) +
        (anthropicResponse.usage?.output_tokens ?? 0),
    },
  };
}

// ---------------------------------------------------------------------------
// Provider dispatch functions
// ---------------------------------------------------------------------------

async function callOpenAiCompatible(baseUrl, apiKey, openAiBody, targetModel) {
  const url = `${baseUrl}/v1/chat/completions`;
  const body = { ...openAiBody, model: targetModel };
  const bodyStr = JSON.stringify(body);

  const headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(bodyStr),
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const result = await request(url, { method: 'POST', headers }, bodyStr);
  return result;
}

async function callAnthropic(baseUrl, apiKey, openAiBody, targetModel) {
  const anthropicBody = openAiToAnthropic(openAiBody, targetModel);
  const bodyStr = JSON.stringify(anthropicBody);

  const headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(bodyStr),
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
  };

  const url = `${baseUrl}/v1/messages`;
  const result = await request(url, { method: 'POST', headers }, bodyStr);

  if (result.statusCode >= 200 && result.statusCode < 300 && typeof result.body === 'object') {
    return {
      statusCode: result.statusCode,
      headers: result.headers,
      body: anthropicToOpenAi(result.body, targetModel),
    };
  }
  return result;
}

// ---------------------------------------------------------------------------
// Routing logic
// ---------------------------------------------------------------------------

function resolveRoute(config, taskClass, requestedModel) {
  if (!taskClass) {
    // No task class — use the model field directly with the default provider
    return {
      provider: config.defaultProvider,
      model: requestedModel || config.defaultModel,
      fallbackProvider: null,
    };
  }

  const route = (config.routes || []).find((r) => r.taskClass === taskClass);
  if (!route) {
    process.stderr.write(
      `[model-gateway] WARN: Unknown taskClass "${taskClass}", using default provider\n`
    );
    return {
      provider: config.defaultProvider,
      model: requestedModel || config.defaultModel,
      fallbackProvider: null,
    };
  }

  return {
    provider: route.provider,
    model: route.model,
    fallbackProvider: route.fallback ?? null,
  };
}

async function dispatchToProvider(config, providerName, model, openAiBody) {
  const providerConfig = config.providers[providerName];
  if (!providerConfig) {
    throw new Error(`No provider config for "${providerName}"`);
  }

  const format = providerConfig.format;
  const baseUrl = providerConfig.baseUrl;
  const apiKey = providerConfig.apiKeyEnv ? process.env[providerConfig.apiKeyEnv] : undefined;

  if (format === 'anthropic') {
    if (!apiKey) {
      throw new Error(
        `Provider "${providerName}" requires env var "${providerConfig.apiKeyEnv}" which is not set`
      );
    }
    return callAnthropic(baseUrl, apiKey, openAiBody, model);
  } else {
    // openai-compatible
    return callOpenAiCompatible(baseUrl, apiKey, openAiBody, model);
  }
}

// ---------------------------------------------------------------------------
// Request handler
// ---------------------------------------------------------------------------

async function handleChatCompletions(config, req, res) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const openAiBody = JSON.parse(Buffer.concat(chunks).toString('utf8'));

  // Task class can come from header or body field
  const taskClass =
    req.headers['x-task-class'] || openAiBody.taskClass || openAiBody.task_class || null;

  const { provider, model, fallbackProvider } = resolveRoute(
    config,
    taskClass,
    openAiBody.model
  );

  process.stderr.write(
    `[model-gateway] routing: taskClass=${taskClass ?? '(none)'} → provider=${provider} model=${model}\n`
  );

  // Strip gateway-specific fields before forwarding
  const forwardBody = { ...openAiBody };
  delete forwardBody.taskClass;
  delete forwardBody.task_class;

  let result;
  try {
    result = await dispatchToProvider(config, provider, model, forwardBody);
  } catch (primaryErr) {
    process.stderr.write(
      `[model-gateway] WARN: Primary provider "${provider}" failed: ${primaryErr.message}\n`
    );

    if (fallbackProvider) {
      process.stderr.write(
        `[model-gateway] Falling back to provider "${fallbackProvider}"\n`
      );
      const fallbackRoute = resolveRoute(config, null, null);
      const fallbackModel = fallbackRoute.model;
      try {
        result = await dispatchToProvider(config, fallbackProvider, fallbackModel, forwardBody);
      } catch (fallbackErr) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: 'Both primary and fallback providers failed',
            primary: primaryErr.message,
            fallback: fallbackErr.message,
          })
        );
        return;
      }
    } else {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({ error: 'Provider request failed', details: primaryErr.message })
      );
      return;
    }
  }

  const responseBody =
    typeof result.body === 'object' ? JSON.stringify(result.body) : result.body;

  res.writeHead(result.statusCode, { 'Content-Type': 'application/json' });
  res.end(responseBody);
}

async function handleEmbeddings(req, res) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  const inputs = Array.isArray(body.input) ? body.input : [body.input ?? ''];
  const model = body.model ?? 'local-embedding-hash';

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    object: 'list',
    data: inputs.map((input, index) => ({
      object: 'embedding',
      index,
      embedding: buildEmbeddingVector(input)
    })),
    model,
    usage: {
      prompt_tokens: inputs.reduce((sum, input) => sum + String(input ?? '').split(/\s+/).filter(Boolean).length, 0),
      total_tokens: inputs.reduce((sum, input) => sum + String(input ?? '').split(/\s+/).filter(Boolean).length, 0)
    }
  }));
}

async function handleHealth(config) {
  const providerNames = Object.keys(config.providers || {});
  const checks = await Promise.all(
    providerNames.map(async (name) => {
      const providerConfig = config.providers[name];
      const reachable = await isReachable(providerConfig.baseUrl);
      return { name, baseUrl: providerConfig.baseUrl, reachable };
    })
  );

  const status = checks.every((c) => c.reachable) ? 'ok' : 'degraded';
  return { status, providers: checks };
}

// ---------------------------------------------------------------------------
// Server factory
// ---------------------------------------------------------------------------

export function createGatewayServer() {
  const config = loadRoutingConfig();

  if (!config) {
    process.stderr.write(
      '[model-gateway] WARN: Running without routing config — all requests will fail\n'
    );
  }

  // Warn early if Anthropic key is absent
  if (config && config.providers?.anthropic?.apiKeyEnv) {
    if (!process.env[config.providers.anthropic.apiKeyEnv]) {
      process.stderr.write(
        `[model-gateway] WARN: ${config.providers.anthropic.apiKeyEnv} is not set — running in local-only mode\n`
      );
    }
  }

  return http.createServer(async (req, res) => {
    try {
      if (req.method === 'POST' && req.url === '/v1/chat/completions') {
        if (!config) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Gateway misconfigured: routing config not loaded' }));
          return;
        }
        await handleChatCompletions(config, req, res);
        return;
      }

      if (req.method === 'POST' && req.url === '/v1/embeddings') {
        await handleEmbeddings(req, res);
        return;
      }

      if (req.method === 'GET' && req.url === '/health') {
        if (!config) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'error', error: 'Routing config not loaded' }));
          return;
        }
        const healthPayload = await handleHealth(config);
        const code = healthPayload.status === 'ok' ? 200 : 207;
        res.writeHead(code, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(healthPayload));
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    } catch (err) {
      process.stderr.write(`[model-gateway] ERROR: ${err.message}\n`);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal gateway error', details: err.message }));
    }
  });
}

// ---------------------------------------------------------------------------
// Entrypoint (direct execution)
// ---------------------------------------------------------------------------

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = createGatewayServer();
  server.listen(GATEWAY_PORT, () => {
    process.stderr.write(`[model-gateway] Listening on http://localhost:${GATEWAY_PORT}\n`);
  });
}
