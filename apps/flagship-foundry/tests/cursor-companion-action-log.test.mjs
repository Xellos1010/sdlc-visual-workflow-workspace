import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const {
  DEFAULT_CAPACITY,
  createActionLog,
  normalizeError
} = require('../apps/cursor-companion/action-log.js');

test('action log records successful actions with summaries', async () => {
  const lines = [];
  const actionLog = createActionLog({
    logger: {
      info(line) {
        lines.push(line);
      }
    },
    now: () => new Date('2026-04-10T12:00:00.000Z'),
    highResolutionNow: (() => {
      let tick = 0;
      return () => {
        tick += 12;
        return tick;
      };
    })()
  });

  const result = await actionLog.run('export-action-log', async () => ({
    summary: 'Exported 3 action entries',
    details: { entryCount: 3 }
  }));

  assert.equal(result.summary, 'Exported 3 action entries');
  assert.equal(actionLog.getSize(), 1);
  assert.equal(actionLog.getLastEntry().status, 'ok');
  assert.equal(actionLog.getLastEntry().result.summary, 'Exported 3 action entries');
  assert.match(lines[0], /export-action-log ok/);
});

test('action log records errors and rethrows them', async () => {
  const actionLog = createActionLog({
    now: () => new Date('2026-04-10T12:00:00.000Z'),
    highResolutionNow: (() => {
      let tick = 0;
      return () => {
        tick += 5;
        return tick;
      };
    })()
  });

  await assert.rejects(
    () =>
      actionLog.run('open-in-browser', async () => {
        throw Object.assign(new Error('Browser relay failed'), { code: 'EADDRINUSE' });
      }),
    /Browser relay failed/
  );

  const entry = actionLog.getLastEntry();
  assert.equal(entry.status, 'error');
  assert.equal(entry.error.message, 'Browser relay failed');
  assert.equal(entry.error.code, 'EADDRINUSE');
  assert.equal(entry.durationMs, 5);
});

test('action log keeps a bounded ring buffer', async () => {
  const actionLog = createActionLog({ capacity: 3 });

  for (let index = 0; index < 5; index += 1) {
    await actionLog.run(`action-${index}`, async () => ({ summary: `done-${index}` }));
  }

  const entries = actionLog.getEntries();
  assert.equal(entries.length, 3);
  assert.equal(entries[0].action, 'action-2');
  assert.equal(entries[2].action, 'action-4');
  assert.equal(DEFAULT_CAPACITY, 500);
});

test('normalizeError maps primitive and object errors', () => {
  assert.deepEqual(normalizeError('plain error'), { message: 'plain error' });

  const error = Object.assign(new Error('Boom'), { code: 'ERR_TEST', details: { scope: 'all' } });
  const normalized = normalizeError(error);
  assert.equal(normalized.message, 'Boom');
  assert.equal(normalized.code, 'ERR_TEST');
  assert.deepEqual(normalized.details, { scope: 'all' });
});
