function requirementPanelSection(state) {
  const session = state.refinementSessions?.[0];
  const readiness = session?.definitionOfReady?.status ?? 'not_ready';
  const blockers = session?.definitionOfReady?.blockingItems ?? [];
  const advisoryEvidenceCount = session?.advisoryEvidence?.length ?? 0;
  return `
    <div class="card">
      <h3>Requirement Refinement</h3>
      ${session ? `
        <div><strong>${session.objective}</strong></div>
        <div class="muted">DoR: ${readiness}</div>
        <div class="muted">${blockers.length ? `Blocking: ${blockers.join(', ')}` : 'No blocking items'}</div>
        <div class="muted">Advisory evidence: ${advisoryEvidenceCount}</div>
      ` : '<div class="muted">No refinement session yet.</div>'}
      <p>
        <button data-action="refine-requirements">Refine</button>
        <button data-action="create-plan-from-refinement">Plan From Ready Session</button>
        <button data-action="run-rag-query">Add RAG Evidence</button>
      </p>
    </div>
  `;
}

module.exports = {
  requirementPanelSection
};
