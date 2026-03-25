import { spawn } from 'node:child_process';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { loadRun, completeTask, failTask, transitionRun } from './runs.mjs';
import { ensureDir, stateRoot, writeJson, nowIso } from './io.mjs';
import { appendFixMemoryRecord } from './fix-memory-store.mjs';

const LOCAL_ADAPTER = 'adapter:local-shell';
const SANDBOX_EXECUTABLE = 'sandbox-exec';
const SHELL_EXECUTABLE = '/bin/sh';
const EXIT_CODE_CONTAINMENT_DENIED = 126;
let cachedSandboxSupport = null;

function hasMacSandboxSupport() {
  if (cachedSandboxSupport !== null) {
    return cachedSandboxSupport;
  }
  if (process.platform !== 'darwin') {
    cachedSandboxSupport = false;
    return cachedSandboxSupport;
  }
  const probe = spawnSync(SANDBOX_EXECUTABLE, ['-h'], { stdio: 'ignore' });
  cachedSandboxSupport = !probe.error;
  return cachedSandboxSupport;
}

function toSandboxProfile(runWorkspaceRoot) {
  const escapedWorkspaceRoot = runWorkspaceRoot.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return [
    '(version 1)',
    '(deny default)',
    '(allow process*)',
    '(allow signal (target self))',
    '(allow sysctl-read)',
    '(allow file-read*)',
    '(allow file-write* (subpath "/dev/fd"))',
    '(allow file-write* (subpath "/dev/null"))',
    `(allow file-write* (subpath "${escapedWorkspaceRoot}"))`
  ].join('\n');
}

function shouldEnforceWorkspaceOnlyContainment(run) {
  if (!run || run.adapterId !== LOCAL_ADAPTER) {
    return false;
  }
  const isolation = run.isolation ?? {};
  return isolation.defaultWritePolicy === 'workspace-only' && isolation.allowExternalWritesByDefault !== true;
}

function buildShellCommand(task, runId) {
  const custom = process.env.FOUNDRY_LOCAL_TASK_CMD;
  if (custom) {
    return custom;
  }
  const script = `console.log(JSON.stringify({ok:true,taskId:${JSON.stringify(task.id)},runId:${JSON.stringify(runId)}}))`;
  return `${JSON.stringify(process.execPath)} -e ${JSON.stringify(script)}`;
}

/**
 * Schedules asynchronous execution for a run that uses the local-shell adapter.
 *
 * @param {string} runId
 */
export function scheduleLocalShellExecution(runId) {
  setImmediate(() => {
    executeLocalShellRun(runId).catch((err) => {
      process.stderr.write(`[run-executor] ${runId}: ${err.message}\n`);
    });
  });
}

/**
 * Runs each active task in a bounded local process: workdir under state/run-workspaces/.
 *
 * @param {string} runId
 */
async function executeLocalShellRun(runId) {
  let workDir = path.join(stateRoot, 'run-workspaces', runId.replace(/[:/]+/g, '-'));
  await ensureDir(workDir);

  for (;;) {
    const run = await loadRun(runId);
    if (run.status === 'stopped' || run.status === 'failed' || run.status === 'paused') {
      break;
    }
    if (run?.isolation?.workspaceRoot) {
      workDir = run.isolation.workspaceRoot;
      await ensureDir(workDir);
    }
    let task = run.tasks.find((t) => t.status === 'running');
    if (!task) {
      const queued = run.tasks.some((t) => t.status === 'queued');
      if (!queued) {
        break;
      }
      await transitionRun(runId, 'start');
      continue;
    }

    const evidencePath = path.join(workDir, `evidence-${task.id.replace(/[:/]+/g, '-')}.json`);
    const evidence = {
      runId,
      taskId: task.id,
      adapter: LOCAL_ADAPTER,
      workDir,
      isolationBoundary: run?.isolation ?? {
        mode: 'run-scoped',
        workspaceRoot: workDir,
        defaultWritePolicy: 'workspace-only',
        allowExternalWritesByDefault: false
      },
      rollbackBoundary: run?.rollback ?? { boundary: 'run-instance' },
      startedAt: nowIso(),
      exitCode: null,
      stdout: ''
    };

    const enforceContainment = shouldEnforceWorkspaceOnlyContainment(run);
    const shellCommand = buildShellCommand(task, runId);

    await new Promise((resolve, reject) => {
      const env = {
        ...process.env,
        FOUNDRY_TASK_ID: task.id,
        FOUNDRY_RUN_ID: runId,
        FOUNDRY_RUN_BOUNDARY_DIR: workDir,
        FOUNDRY_RUN_WRITE_POLICY: 'workspace-only'
      };
      let out = '';
      let child;

      if (enforceContainment && !hasMacSandboxSupport()) {
        out += 'Local-shell execution denied: strict workspace-only containment requires macOS sandbox-exec support.\n';
        evidence.exitCode = EXIT_CODE_CONTAINMENT_DENIED;
        evidence.stdout = out;
        evidence.containment = {
          enforced: true,
          mechanism: 'deny-no-sandbox',
          denied: true,
          reason: 'sandbox-exec unavailable'
        };
        evidence.completedAt = nowIso();
        resolve();
        return;
      }

      if (enforceContainment) {
        const profile = toSandboxProfile(workDir);
        child = spawn(
          SANDBOX_EXECUTABLE,
          ['-p', profile, SHELL_EXECUTABLE, '-c', shellCommand],
          { cwd: workDir, env }
        );
        evidence.containment = {
          enforced: true,
          mechanism: 'sandbox-exec',
          denied: false,
          reason: null
        };
      } else {
        child = spawn(SHELL_EXECUTABLE, ['-c', shellCommand], { cwd: workDir, env });
        evidence.containment = {
          enforced: false,
          mechanism: 'none',
          denied: false,
          reason: null
        };
      }

      child.stdout?.on('data', (d) => {
        out += d.toString();
      });
      child.stderr?.on('data', (d) => {
        out += d.toString();
      });
      child.on('error', reject);
      child.on('close', (code) => {
        evidence.exitCode = code ?? 0;
        evidence.stdout = out;
        if (enforceContainment && evidence.exitCode !== 0 && /Operation not permitted|sandbox/i.test(out)) {
          evidence.containment.denied = true;
          evidence.containment.reason = 'blocked external write outside run workspace';
        }
        evidence.completedAt = nowIso();
        resolve();
      });
    });

    await writeJson(evidencePath, evidence);

    await appendFixMemoryRecord({
      problem: `Execute task ${task.title}`,
      environment: 'local-shell',
      solution: `Recorded evidence at ${path.relative(stateRoot, evidencePath)}`,
      designParadigm: 'bounded-adapter',
      evidence: [evidencePath],
      preventiveChecks: ['verify evidence bundle before marking complete']
    });

    if (evidence.exitCode === 0) {
      await completeTask(runId, task.id, {
        verificationResults: [{ check: 'local-shell-exit', passed: true }],
        evidenceArtifacts: [{ type: 'json', path: evidencePath }]
      });
      continue;
    }

    await failTask(runId, task.id, {
      verificationResults: [{ check: 'local-shell-exit', passed: false }],
      evidenceArtifacts: [{ type: 'json', path: evidencePath }]
    });
    break;
  }
}

/**
 * @param {object} run
 * @returns {boolean}
 */
export function shouldExecuteLocally(run) {
  return run.mode === 'execute' && run.adapterId === LOCAL_ADAPTER;
}
