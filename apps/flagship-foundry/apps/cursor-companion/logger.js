/**
 * Logs to the VS Code Output panel: View → Output → select "Flagship Foundry Companion".
 */
let channel = null;

function init(vscode) {
  if (!channel) {
    channel = vscode.window.createOutputChannel('Flagship Foundry Companion');
  }
}

function formatLine(level, message, extra) {
  const ts = new Date().toISOString();
  const suffix =
    extra !== undefined && extra !== null
      ? ` ${typeof extra === 'string' ? extra : JSON.stringify(extra)}`
      : '';
  return `[${ts}] [${level}] ${message}${suffix}`;
}

function append(level, message, extra) {
  const line = formatLine(level, message, extra);
  if (channel) {
    channel.appendLine(line);
  } else if (typeof process !== 'undefined' && process.stderr) {
    process.stderr.write(`${line}\n`);
  }
}

function info(message, extra) {
  append('INFO', message, extra);
}

function warn(message, extra) {
  append('WARN', message, extra);
}

function error(message, extra) {
  append('ERROR', message, extra);
}

function show(preserveFocus = false) {
  channel?.show(preserveFocus);
}

function dispose() {
  channel?.dispose();
  channel = null;
}

module.exports = {
  init,
  info,
  warn,
  error,
  show,
  dispose
};
