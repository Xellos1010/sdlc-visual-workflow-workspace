function providerDashboardSection(state) {
  const snapshot = state.budgetSnapshot;
  const providers = snapshot?.providers ?? [];
  const adapters = snapshot?.adapters ?? [];
  return `
    <div class="card">
      <h3>Provider Posture</h3>
      <div class="muted">Providers: ${providers.length} | Adapters: ${adapters.length}</div>
      ${providers.slice(0, 4).map((provider) => `<div class="muted">${provider.displayName}: ${provider.health} / configured=${provider.configured}</div>`).join('')}
    </div>
  `;
}

module.exports = {
  providerDashboardSection
};
