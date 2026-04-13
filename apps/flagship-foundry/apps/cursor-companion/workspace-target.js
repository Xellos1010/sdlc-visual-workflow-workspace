function workspaceTargetSection(state) {
  const target = state.workspaceTarget;
  const candidates = state.workspaceCandidates || [];
  const candidateOptions = candidates.map((candidate) => `
    <button data-action="bind-workspace-target" data-target-id="${candidate.targetId}">
      Bind ${candidate.displayName}
    </button>
  `).join('');

  return `
    <div class="card">
      <h3>Workspace Target</h3>
      ${target ? `
        <div><strong>${target.displayName}</strong></div>
        <div class="muted">Root: <code>${target.workspaceRoot}</code></div>
        <div class="muted">Binding: ${target.bindingMode}</div>
      ` : '<div class="muted">No workspace target bound yet.</div>'}
      ${candidates.length > 1 ? `<div class="muted">Multiple roots detected. Pick one explicitly.</div><p>${candidateOptions}</p>` : ''}
      <p><button data-action="retarget-workspace">Resolve Target</button></p>
    </div>
  `;
}

module.exports = {
  workspaceTargetSection
};
