function windowLauncherSection(state = {}) {
  const browserMode = state.bridgeConfig?.mode === 'browser';
  const browserUrl = state.browserPopoutUrl;
  const browserConnectionCount = Number.isFinite(state.browserConnectionCount) ? state.browserConnectionCount : 0;
  const connectionLabel = browserConnectionCount === 1 ? '1 browser client connected' : `${browserConnectionCount} browser clients connected`;
  return `
    <div class="card">
      <h3>Windowing</h3>
      <div class="muted">Pop-out keeps the current workspace binding visible while you iterate on the extension.</div>
      ${browserMode ? `
        <div class="muted" data-bind="windowingStatus">Connected through the local browser relay.</div>
        <div class="muted" data-bind="browserConnectionLabel">${connectionLabel}</div>
        ${browserUrl ? `<div class="muted"><code data-bind="browserPopoutUrl">${browserUrl}</code></div>` : '<div class="muted"><code data-bind="browserPopoutUrl">Not opened yet</code></div>'}
      ` : `
        <div class="muted" data-bind="windowingStatus">Host windowing stays default. The browser relay is opt-in and loopback-only.</div>
        <div class="muted" data-bind="browserConnectionLabel">${connectionLabel}</div>
        ${browserUrl ? `<div class="muted"><code data-bind="browserPopoutUrl">${browserUrl}</code></div>` : '<div class="muted"><code data-bind="browserPopoutUrl">Not opened yet</code></div>'}
        <p>
          <button data-action="pop-out-window">Open In New Window</button>
          <button data-action="open-in-browser">Open In Browser</button>
        </p>
      `}
    </div>
  `;
}

module.exports = {
  windowLauncherSection
};
