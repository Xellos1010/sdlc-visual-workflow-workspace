import path from 'node:path';
import { makeId, nowIso, readJson, stateRoot, writeJson } from './io.mjs';

function refinementDir(ecosystemId) {
  return path.join(stateRoot, 'ecosystems', ecosystemId, 'operator', 'refinement-sessions');
}

function refinementPath(ecosystemId, sessionId) {
  return path.join(refinementDir(ecosystemId), `${sessionId.replace(/[:/]+/g, '-')}.json`);
}

function buildChecklist(cart, input = {}) {
  const items = Array.isArray(cart?.items) ? cart.items : [];
  const acceptanceCriteria = Array.isArray(input.acceptanceCriteria) ? input.acceptanceCriteria : [];
  return [
    {
      id: 'context-cart-populated',
      label: 'Context cart has selected evidence',
      status: items.length >= 1 ? 'met' : 'missing',
      notes: items.length >= 1 ? `${items.length} items selected` : 'Select at least one file, node, or note'
    },
    {
      id: 'objective-defined',
      label: 'Objective is explicit',
      status: input.objective ? 'met' : 'missing',
      notes: input.objective ?? 'Provide a concrete operator objective'
    },
    {
      id: 'acceptance-criteria-present',
      label: 'Acceptance criteria are present',
      status: acceptanceCriteria.length >= 1 ? 'met' : 'partial',
      notes: acceptanceCriteria.length >= 1 ? `${acceptanceCriteria.length} acceptance criteria captured` : 'Capture at least one acceptance criterion'
    }
  ];
}

export function createRefinementSession(input = {}) {
  const timestamp = nowIso();
  const cart = input.contextCart ?? { items: [] };
  const checklist = buildChecklist(cart, input);
  const blockingItems = checklist.filter((entry) => entry.status !== 'met').map((entry) => entry.label);
  const dorStatus = blockingItems.length === 0 ? 'ready' : checklist.some((entry) => entry.status === 'partial') ? 'needs_review' : 'not_ready';
  return {
    sessionId: input.sessionId ?? makeId('refine', input.objective ?? cart.cartId ?? timestamp),
    workspaceTargetId: input.workspaceTargetId,
    contextCartId: cart.cartId,
    objective: input.objective ?? cart.objective ?? 'Refine requirement',
    problemStatement: input.problemStatement ?? null,
    stakeholders: Array.isArray(input.stakeholders) ? input.stakeholders : [],
    assumptions: Array.isArray(input.assumptions) ? input.assumptions : [],
    status: dorStatus === 'ready' ? 'ready' : 'needs-input',
    definitionOfReady: {
      status: dorStatus,
      checklist,
      blockingItems
    },
    knowledgeGaps: Array.isArray(input.knowledgeGaps) ? input.knowledgeGaps : [],
    unresolvedQuestions: Array.isArray(input.unresolvedQuestions) ? input.unresolvedQuestions : [],
    acceptanceCriteria: Array.isArray(input.acceptanceCriteria) ? input.acceptanceCriteria : [],
    risks: Array.isArray(input.risks) ? input.risks : [],
    constraints: Array.isArray(input.constraints) ? input.constraints : [],
    advisoryEvidence: Array.isArray(input.advisoryEvidence) ? input.advisoryEvidence : [],
    ragFindings: Array.isArray(input.ragFindings) ? input.ragFindings : [],
    linkedArtifacts: Array.isArray(input.linkedArtifacts) ? input.linkedArtifacts : [],
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp
  };
}

export function canGeneratePlanFromRefinement(session) {
  return session?.definitionOfReady?.status === 'ready';
}

export async function saveRefinementSession(ecosystemId, session) {
  const payload = {
    ...session,
    updatedAt: nowIso()
  };
  await writeJson(refinementPath(ecosystemId, payload.sessionId), payload);
  return payload;
}

export async function loadRefinementSession(ecosystemId, sessionId) {
  return readJson(refinementPath(ecosystemId, sessionId), null);
}

export async function listRefinementSessions(ecosystemId) {
  const directory = refinementDir(ecosystemId);
  const fs = await import('node:fs/promises');
  try {
    const entries = await fs.readdir(directory);
    const sessions = await Promise.all(entries.filter((entry) => entry.endsWith('.json')).map((entry) => readJson(path.join(directory, entry))));
    return sessions.sort((left, right) => (right.updatedAt ?? '').localeCompare(left.updatedAt ?? ''));
  } catch {
    return [];
  }
}
