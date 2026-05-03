const { performance } = require('node:perf_hooks');

const DEFAULT_CAPACITY = 500;

function createActionLog({
  capacity = DEFAULT_CAPACITY,
  logger = null,
  now = () => new Date(),
  highResolutionNow = () => performance.now()
} = {}) {
  const entries = [];
  let sequence = 0;

  function appendEntry(entry) {
    entries.push(entry);
    if (entries.length > capacity) {
      entries.splice(0, entries.length - capacity);
    }

    if (logger?.info) {
      logger.info(formatActionLogLine(entry));
    }

    return entry;
  }

  async function run(action, handler, options = {}) {
    const startedAt = highResolutionNow();
    const entry = {
      id: createEntryId(++sequence),
      action,
      timestamp: now().toISOString()
    };

    try {
      const result = await handler();
      entry.status = 'ok';
      entry.result = summarizeActionResult(result, options.resultSummarizer);
      return result;
    } catch (error) {
      entry.status = 'error';
      entry.error = normalizeError(error);
      throw error;
    } finally {
      entry.durationMs = Math.max(0, Math.round(highResolutionNow() - startedAt));
      appendEntry(entry);
      options.onEntry?.(entry);
    }
  }

  function withActionLog(action, handler, options = {}) {
    return async function wrappedActionHandler(...args) {
      return run(action, () => handler(...args), options);
    };
  }

  return {
    appendEntry,
    clear() {
      entries.length = 0;
    },
    exportEntries(scope = 'all') {
      if (scope === 'last') {
        const last = entries[entries.length - 1];
        return last ? [last] : [];
      }
      return entries.slice();
    },
    getEntries() {
      return entries.slice();
    },
    getLastEntry() {
      return entries[entries.length - 1] ?? null;
    },
    getSize() {
      return entries.length;
    },
    run,
    withActionLog
  };
}

function createEntryId(sequence) {
  return `action-log:${Date.now()}:${String(sequence).padStart(4, '0')}`;
}

function normalizeError(error) {
  if (!error || typeof error !== 'object') {
    return { message: String(error) };
  }

  return {
    name: error.name,
    message: error.message ?? String(error),
    stack: typeof error.stack === 'string' ? error.stack : undefined,
    code: error.code,
    details: error.details
  };
}

function summarizeActionResult(result, resultSummarizer) {
  if (typeof resultSummarizer === 'function') {
    return resultSummarizer(result);
  }

  if (result && typeof result === 'object' && typeof result.summary === 'string') {
    return {
      summary: result.summary,
      details: result.details,
      metadata: result.metadata
    };
  }

  if (typeof result === 'string' && result.trim()) {
    return { summary: result.trim() };
  }

  if (typeof result === 'number' || typeof result === 'boolean') {
    return { summary: String(result) };
  }

  if (Array.isArray(result)) {
    return {
      summary: `Array(${result.length})`,
      metadata: { length: result.length }
    };
  }

  if (result && typeof result === 'object') {
    return {
      summary: summarizeObject(result),
      metadata: buildObjectMetadata(result)
    };
  }

  return { summary: 'Completed with no return value' };
}

function summarizeObject(result) {
  if (typeof result.id === 'string') {
    return `Completed ${result.id}`;
  }
  if (typeof result.pipelineId === 'string') {
    return `Pipeline ${result.pipelineId}`;
  }
  if (typeof result.packetId === 'string') {
    return `Packet ${result.packetId}`;
  }
  if (typeof result.artifactId === 'string') {
    return `Artifact ${result.artifactId}`;
  }
  if (typeof result.sessionId === 'string') {
    return `Session ${result.sessionId}`;
  }
  if (typeof result.cartId === 'string') {
    return `Context cart ${result.cartId}`;
  }
  if (typeof result.targetId === 'string') {
    return `Workspace target ${result.targetId}`;
  }
  if (result.ecosystem?.id) {
    return `Ecosystem ${result.ecosystem.id}`;
  }

  const keys = Object.keys(result);
  return keys.length ? `Object with ${keys.length} field${keys.length === 1 ? '' : 's'}` : 'Completed object result';
}

function buildObjectMetadata(result) {
  const metadata = {};

  for (const key of ['id', 'pipelineId', 'packetId', 'artifactId', 'sessionId', 'cartId', 'targetId']) {
    if (result[key] !== undefined) {
      metadata[key] = result[key];
    }
  }

  if (result.ecosystem?.id) {
    metadata.ecosystemId = result.ecosystem.id;
  }

  return Object.keys(metadata).length ? metadata : undefined;
}

function formatActionLogLine(entry) {
  const suffix = entry.status === 'ok'
    ? entry.result?.summary ?? 'ok'
    : entry.error?.message ?? 'error';
  return `[action] ${entry.action} ${entry.status} (${entry.durationMs}ms) ${suffix}`;
}

module.exports = {
  DEFAULT_CAPACITY,
  createActionLog,
  formatActionLogLine,
  normalizeError,
  summarizeActionResult
};
