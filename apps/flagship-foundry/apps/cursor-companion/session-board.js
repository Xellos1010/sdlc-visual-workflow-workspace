function sessionBoardSection(state) {
  const board = state.sessionBoard;
  const pipelineState = state.pipelines?.[0] ?? null;
  return `
    <div class="card">
      <h3>Execution Sessions</h3>
      ${board ? `
        <div class="muted">Plans: ${board.counts?.plans ?? 0} | Runs: ${board.counts?.runs ?? 0}</div>
        <div class="muted">Launch allowed: ${board.approvals?.runLaunchAllowed ? 'yes' : 'no'}</div>
        <div class="muted">Pipelines: ${board.counts?.pipelines ?? 0} | Pipeline launch allowed: ${board.approvals?.pipelineLaunchAllowed ? 'yes' : 'no'}</div>
      ` : '<div class="muted">No execution session projection yet.</div>'}
      ${pipelineState ? `
        <div class="muted">Latest pipeline: ${pipelineState.pipelineId} | Status: ${pipelineState.status}</div>
      ` : ''}
      <p>
        <button data-action="create-pipeline">Create Pipeline</button>
        <button data-action="launch-pipeline">Launch Pipeline</button>
        <button data-action="pause-pipeline">Pause Pipeline</button>
        <button data-action="resume-pipeline">Resume Pipeline</button>
        <button data-action="refresh">Refresh</button>
      </p>
    </div>
  `;
}

module.exports = {
  sessionBoardSection
};
