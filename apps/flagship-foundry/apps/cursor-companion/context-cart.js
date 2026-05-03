function contextCartSection(state) {
  const carts = state.contextCarts || [];
  const latest = carts[0];
  const itemCount = latest?.items?.length ?? 0;
  return `
    <div class="card">
      <h3>Context Cart</h3>
      ${latest ? `
        <div><strong>${latest.title}</strong></div>
        <div class="muted">Status: ${latest.status} | Items: ${itemCount}</div>
        <div class="muted">RAG-aware selections and pinned items are preserved in the cart projection.</div>
      ` : '<div class="muted">No saved context cart yet.</div>'}
      <p>
        <button data-action="capture-active-file">Add Active File</button>
        <button data-action="capture-note">Add Note</button>
        <button data-action="run-rag-query">RAG Search</button>
        <button data-action="refresh">Refresh</button>
      </p>
    </div>
  `;
}

module.exports = {
  contextCartSection
};
