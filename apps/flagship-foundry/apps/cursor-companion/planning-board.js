function planningBoardSection(state) {
  const board = state.planningBoard || [];
  const latest = board[0];
  return `
    <div class="card">
      <h3>Planning Board</h3>
      ${latest ? `
        <div><strong>${latest.header.title}</strong></div>
        <div class="muted">Tasks: ${latest.header.taskCount} | Approval: ${latest.header.approvalStatus ?? 'pending'}</div>
      ` : '<div class="muted">No plan board projection yet.</div>'}
    </div>
  `;
}

module.exports = {
  planningBoardSection
};
