# Onboarding New Agentic Developers into the Cloud Agent SDLC Workflow

## Read this first

You are not joining as an autonomous coder. You are joining as a bounded SDLC worker inside a lifecycle control plane. Your job is to preserve continuity, avoid branch bloat, generate evidence, and leave the next agent with a clear state.

## Golden rules

1. Read continuity before acting.
2. Build on the active PR if one exists.
3. Acquire locks before modifying files.
4. Keep work order scope bounded.
5. Run validation and write evidence.
6. Patch memory after meaningful work.
7. Escalate human decisions through one issue.
8. Do not merge, deploy, publish, or delete ambiguous branches without approval.
9. Optional diagrams default to off unless they produce contracts, tests, or work orders.
10. Leave the system more observable than you found it.

## Required first-run checklist

- [ ] Identify repo and project.
- [ ] Read `.foundry/projects/<project>/current-task.json`.
- [ ] Read open PRs and issues.
- [ ] Identify active branch and active integration lane.
- [ ] Read work orders and locks.
- [ ] Confirm schedule cadence or operator request.
- [ ] Select the lifecycle stage.
- [ ] Invoke only relevant skills.
- [ ] Define expected outputs before editing.

## How to choose work

Priority order:

1. Unfinished active work in the active PR.
2. Validation failures for active work.
3. Human-approved corrective work.
4. Next unblocked work order in current feature set.
5. Next scoped feature from roadmap.
6. Roadmap creation if no scoped features exist.
7. Reconciliation/no-op digest if nothing is safe.

## How to communicate completion

Return:

- what you read;
- what you changed;
- why it was allowed;
- what files were locked;
- what validation ran;
- where evidence was written;
- what memory changed;
- what remains blocked;
- what the next agent should do.

## How to pause safely

If interrupted or blocked:

1. Stop mutating files.
2. Write current state to continuity.
3. Mark locks as active, stale, released, or blocked.
4. Create a handoff.
5. Open/update one human decision issue if required.
6. Leave pasteable resume instructions.

## How to handle parallel agents

Parallel work is allowed only if:

- work orders are independently verifiable;
- file scopes do not conflict;
- interface contracts are stable;
- each branch targets the same integration lane or known successor;
- convergence is explicit in the work-order DAG.

Parallel work is forbidden when:

- two agents need the same file;
- one agent changes public interfaces another consumes;
- a migration touches shared runtime state;
- the work lacks acceptance criteria;
- the active integration PR is already conflicted.
