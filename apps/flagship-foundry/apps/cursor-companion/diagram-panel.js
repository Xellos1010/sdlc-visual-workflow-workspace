function diagramPanelSection(state) {
  const artifact = state.visualArtifacts?.[0];
  const graph = state.graphSnapshot;
  return `
    <div class="card">
      <h3>Visual Artifacts</h3>
      ${artifact ? `
        <div><strong>${artifact.title}</strong></div>
        <div class="muted">${artifact.kind} | ${artifact.representation}</div>
      ` : '<div class="muted">No visual artifacts saved yet.</div>'}
      <p>
        <button data-action="generate-c4-context">C4 Context</button>
        <button data-action="generate-c4-container">C4 Containers</button>
        <button data-action="generate-pseudocode">Pseudocode</button>
      </p>
      <div class="muted">System overview graph: ${graph?.nodes?.length ?? '—'} nodes / ${graph?.edges?.length ?? '—'} edges</div>
      <p>
        <button data-action="rebuild-graph">Rebuild Graph</button>
        <button data-action="query-graph">Query Graph</button>
        <button data-action="export-graph">Export Packet</button>
        <button data-action="import-graph">Import Packet</button>
      </p>
    </div>
  `;
}

module.exports = {
  diagramPanelSection
};
