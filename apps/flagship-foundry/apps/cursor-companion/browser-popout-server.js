const http = require('node:http');
const crypto = require('node:crypto');
const path = require('node:path');
const { readFile } = require('node:fs/promises');

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PAGE_PATH = '/';
const DEFAULT_WEB_SOCKET_PATH = '/browser-popout';
const DEFAULT_THEME_PATH = '/theme.css';
const DEFAULT_PROTOCOL_VERSION = '1';
const MAX_MESSAGE_SIZE_BYTES = 64 * 1024;
const THEME_FILE_PATH = path.join(__dirname, 'browser-theme.css');

function generateBrowserPopoutToken(bytes = 16) {
  return crypto.randomBytes(bytes).toString('hex');
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isDateTime(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function isAllowedPrimitive(value) {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

function validateErrorObject(value) {
  if (!isPlainObject(value)) {
    return ['error must be an object'];
  }

  const allowed = new Set(['name', 'message', 'stack', 'code', 'details']);
  const errors = [];

  if (typeof value.message !== 'string' || value.message.length === 0) {
    errors.push('error.message must be a non-empty string');
  }

  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      errors.push(`error.${key} is not allowed`);
    }
  }

  return errors;
}

function validateBrowserPopoutMessage(message) {
  if (!isPlainObject(message)) {
    return { valid: false, errors: ['message must be an object'] };
  }

  const errors = [];
  const keys = new Set(Object.keys(message));

  switch (message.type) {
    case 'handshake': {
      for (const key of ['type', 'protocolVersion', 'token', 'clientId', 'timestamp']) {
        if (!keys.has(key)) {
          errors.push(`missing handshake field ${key}`);
        }
      }

      for (const key of keys) {
        if (!['type', 'protocolVersion', 'token', 'clientId', 'timestamp'].includes(key)) {
          errors.push(`handshake.${key} is not allowed`);
        }
      }

      if (message.protocolVersion !== undefined && typeof message.protocolVersion !== 'string') {
        errors.push('handshake.protocolVersion must be a string');
      }
      if (message.token !== undefined && typeof message.token !== 'string') {
        errors.push('handshake.token must be a string');
      }
      if (message.clientId !== undefined && typeof message.clientId !== 'string') {
        errors.push('handshake.clientId must be a string');
      }
      if (message.timestamp !== undefined && !isDateTime(message.timestamp)) {
        errors.push('handshake.timestamp must be an ISO date-time string');
      }

      break;
    }
    case 'command': {
      for (const key of ['type', 'requestId', 'action', 'timestamp']) {
        if (!keys.has(key)) {
          errors.push(`missing command field ${key}`);
        }
      }

      for (const key of keys) {
        if (!['type', 'requestId', 'action', 'timestamp', 'payload'].includes(key)) {
          errors.push(`command.${key} is not allowed`);
        }
      }

      if (message.requestId !== undefined && typeof message.requestId !== 'string') {
        errors.push('command.requestId must be a string');
      }
      if (message.action !== undefined && typeof message.action !== 'string') {
        errors.push('command.action must be a string');
      }
      if (message.timestamp !== undefined && !isDateTime(message.timestamp)) {
        errors.push('command.timestamp must be an ISO date-time string');
      }
      if (message.payload !== undefined && !(isPlainObject(message.payload) || Array.isArray(message.payload) || isAllowedPrimitive(message.payload))) {
        errors.push('command.payload must be a JSON value');
      }

      break;
    }
    case 'response': {
      for (const key of ['type', 'requestId', 'status', 'timestamp']) {
        if (!keys.has(key)) {
          errors.push(`missing response field ${key}`);
        }
      }

      for (const key of keys) {
        if (!['type', 'requestId', 'status', 'timestamp', 'result', 'error'].includes(key)) {
          errors.push(`response.${key} is not allowed`);
        }
      }

      if (message.requestId !== undefined && typeof message.requestId !== 'string') {
        errors.push('response.requestId must be a string');
      }
      if (!['ok', 'error'].includes(message.status)) {
        errors.push('response.status must be ok or error');
      }
      if (message.timestamp !== undefined && !isDateTime(message.timestamp)) {
        errors.push('response.timestamp must be an ISO date-time string');
      }

      if (message.status === 'ok') {
        if (!isPlainObject(message.result)) {
          errors.push('response.result must be an object when status is ok');
        } else {
          const resultKeys = new Set(Object.keys(message.result));
          if (typeof message.result.summary !== 'string' || message.result.summary.length === 0) {
            errors.push('response.result.summary must be a non-empty string');
          }
          for (const key of resultKeys) {
            if (!['summary', 'details', 'metadata'].includes(key)) {
              errors.push(`response.result.${key} is not allowed`);
            }
          }
        }
        if (Object.prototype.hasOwnProperty.call(message, 'error')) {
          errors.push('response.error must be absent when status is ok');
        }
      }

      if (message.status === 'error') {
        errors.push(...validateErrorObject(message.error).map((error) => `response.${error}`));
        if (Object.prototype.hasOwnProperty.call(message, 'result')) {
          errors.push('response.result must be absent when status is error');
        }
      }

      break;
    }
    case 'state-update': {
      for (const key of ['type', 'timestamp', 'state']) {
        if (!keys.has(key)) {
          errors.push(`missing state-update field ${key}`);
        }
      }

      for (const key of keys) {
        if (!['type', 'timestamp', 'state'].includes(key)) {
          errors.push(`state-update.${key} is not allowed`);
        }
      }

      if (message.timestamp !== undefined && !isDateTime(message.timestamp)) {
        errors.push('state-update.timestamp must be an ISO date-time string');
      }
      if (message.state !== undefined && !isPlainObject(message.state)) {
        errors.push('state-update.state must be an object');
      }

      break;
    }
    default:
      errors.push('message.type must be handshake, command, response, or state-update');
  }

  return { valid: errors.length === 0, errors };
}

function createBrowserPopoutHandshake({ token, clientId, protocolVersion = DEFAULT_PROTOCOL_VERSION, timestamp = new Date().toISOString() }) {
  return {
    type: 'handshake',
    protocolVersion: String(protocolVersion),
    token: String(token),
    clientId: String(clientId),
    timestamp
  };
}

function createBrowserPopoutCommand({ requestId, action, payload, timestamp = new Date().toISOString() }) {
  const message = {
    type: 'command',
    requestId: String(requestId),
    action: String(action),
    timestamp
  };

  if (payload !== undefined) {
    message.payload = payload;
  }

  return message;
}

function createBrowserPopoutResponse({ requestId, result, error, timestamp = new Date().toISOString() }) {
  const status = error ? 'error' : 'ok';
  const message = {
    type: 'response',
    requestId: String(requestId),
    status,
    timestamp
  };

  if (status === 'ok') {
    message.result = result ?? { summary: 'Command completed' };
  } else {
    message.error = error;
  }

  return message;
}

function createBrowserPopoutStateUpdate({ state, timestamp = new Date().toISOString() }) {
  return {
    type: 'state-update',
    timestamp,
    state
  };
}

function normalizeCommandResult(requestId, outcome) {
  if (isPlainObject(outcome) && outcome.type === 'response') {
    return outcome;
  }

  if (typeof outcome === 'string') {
    return createBrowserPopoutResponse({
      requestId,
      result: { summary: outcome }
    });
  }

  if (isPlainObject(outcome)) {
    const result = {
      summary: typeof outcome.summary === 'string' && outcome.summary.length > 0 ? outcome.summary : 'Command completed'
    };

    if (Object.prototype.hasOwnProperty.call(outcome, 'details')) {
      result.details = outcome.details;
    }

    if (Object.prototype.hasOwnProperty.call(outcome, 'metadata')) {
      result.metadata = outcome.metadata;
    }

    return createBrowserPopoutResponse({ requestId, result });
  }

  return createBrowserPopoutResponse({
    requestId,
    result: { summary: 'Command completed' }
  });
}

function normalizeCommandError(requestId, error) {
  return createBrowserPopoutResponse({
    requestId,
    error: {
      name: error?.name ?? 'Error',
      message: error?.message ?? String(error),
      stack: typeof error?.stack === 'string' ? error.stack : undefined,
      code: error?.code,
      details: error?.details
    }
  });
}

function encodeBrowserPopoutTextFrame(text) {
  const payload = Buffer.from(String(text), 'utf8');
  const header = [];
  header.push(0x81);

  if (payload.length < 126) {
    header.push(payload.length);
  } else if (payload.length < 65536) {
    header.push(126, (payload.length >> 8) & 0xff, payload.length & 0xff);
  } else {
    const length = BigInt(payload.length);
    header.push(127);
    const lengthBuffer = Buffer.alloc(8);
    lengthBuffer.writeBigUInt64BE(length);
    return Buffer.concat([Buffer.from(header), lengthBuffer, payload]);
  }

  return Buffer.concat([Buffer.from(header), payload]);
}

function encodeBrowserPopoutClientTextFrame(text, maskingKey = crypto.randomBytes(4)) {
  const payload = Buffer.from(String(text), 'utf8');
  const header = [];
  header.push(0x81);

  if (payload.length < 126) {
    header.push(0x80 | payload.length);
  } else if (payload.length < 65536) {
    header.push(0x80 | 126, (payload.length >> 8) & 0xff, payload.length & 0xff);
  } else {
    const length = BigInt(payload.length);
    header.push(0x80 | 127);
    const lengthBuffer = Buffer.alloc(8);
    lengthBuffer.writeBigUInt64BE(length);
    const maskedPayload = Buffer.alloc(payload.length);
    for (let index = 0; index < payload.length; index += 1) {
      maskedPayload[index] = payload[index] ^ maskingKey[index % 4];
    }
    return Buffer.concat([Buffer.from(header), lengthBuffer, maskingKey, maskedPayload]);
  }

  const maskedPayload = Buffer.alloc(payload.length);
  for (let index = 0; index < payload.length; index += 1) {
    maskedPayload[index] = payload[index] ^ maskingKey[index % 4];
  }

  return Buffer.concat([Buffer.from(header), maskingKey, maskedPayload]);
}

function decodeBrowserPopoutFrames(buffer, state = { buffer: Buffer.alloc(0) }) {
  state.buffer = Buffer.concat([state.buffer, buffer]);
  const frames = [];

  while (state.buffer.length >= 2) {
    const first = state.buffer[0];
    const second = state.buffer[1];
    const opcode = first & 0x0f;
    const masked = (second & 0x80) !== 0;
    let length = second & 0x7f;
    let offset = 2;

    if (length === 126) {
      if (state.buffer.length < 4) {
        break;
      }
      length = state.buffer.readUInt16BE(2);
      offset = 4;
    } else if (length === 127) {
      if (state.buffer.length < 10) {
        break;
      }
      const lengthBigInt = state.buffer.readBigUInt64BE(2);
      if (lengthBigInt > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw new Error('Browser pop-out frame is too large');
      }
      length = Number(lengthBigInt);
      offset = 10;
    }

    const maskBytes = masked ? 4 : 0;
    const frameSize = offset + maskBytes + length;
    if (state.buffer.length < frameSize) {
      break;
    }

    let payload = state.buffer.subarray(offset + maskBytes, frameSize);
    if (masked) {
      const mask = state.buffer.subarray(offset, offset + 4);
      const unmasked = Buffer.alloc(length);
      for (let index = 0; index < length; index += 1) {
        unmasked[index] = payload[index] ^ mask[index % 4];
      }
      payload = unmasked;
    }

    frames.push({
      opcode,
      payload
    });

    state.buffer = state.buffer.subarray(frameSize);
  }

  return frames;
}

function makeBrowserPopoutPage({ pageUrl, webSocketPath, token, protocolVersion }) {
  const escapedPageUrl = JSON.stringify(pageUrl);
  const escapedWebSocketPath = JSON.stringify(webSocketPath);
  const escapedToken = JSON.stringify(token);
  const escapedProtocolVersion = JSON.stringify(protocolVersion);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Flagship Foundry Browser Pop-out</title>
    <style>
      :root { color-scheme: light; font-family: system-ui, sans-serif; }
      body { margin: 0; padding: 24px; background: #111827; color: #e5e7eb; }
      main { max-width: 720px; margin: 0 auto; }
      code, pre { background: rgba(255,255,255,0.08); padding: 0.25rem 0.4rem; border-radius: 6px; }
      #status { margin-top: 12px; }
    </style>
  </head>
  <body>
    <main>
      <h1>Flagship Foundry Browser Pop-out</h1>
      <p>Connecting to the local extension bridge.</p>
      <div id="status">booting…</div>
      <pre id="log" aria-live="polite"></pre>
    </main>
    <script>
      const pageUrl = ${escapedPageUrl};
      const webSocketPath = ${escapedWebSocketPath};
      const token = ${escapedToken};
      const protocolVersion = ${escapedProtocolVersion};
      const status = document.getElementById('status');
      const log = document.getElementById('log');
      const clientId = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
      const socket = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + webSocketPath + '?token=' + encodeURIComponent(token));

      function write(message) {
        log.textContent += message + '\\n';
      }

      socket.addEventListener('open', () => {
        status.textContent = 'connected';
        socket.send(JSON.stringify({
          type: 'handshake',
          protocolVersion,
          token,
          clientId,
          timestamp: new Date().toISOString()
        }));
        write('opened ' + pageUrl);
      });

      socket.addEventListener('message', (event) => {
        write(String(event.data));
      });

      socket.addEventListener('close', () => {
        status.textContent = 'closed';
      });

      socket.addEventListener('error', () => {
        status.textContent = 'error';
      });
    </script>
  </body>
</html>`;
}

function writeRejectedUpgrade(socket, statusCode, message) {
  const body = `${message}\n`;
  socket.write(
    `HTTP/1.1 ${statusCode} ${statusCode === 401 ? 'Unauthorized' : statusCode === 404 ? 'Not Found' : 'Bad Request'}\r\n` +
      'Content-Type: text/plain; charset=utf-8\r\n' +
      `Content-Length: ${Buffer.byteLength(body)}\r\n` +
      'Connection: close\r\n' +
      '\r\n' +
      body
  );
  socket.destroy();
}

function getRequestUrl(req, host, port) {
  return new URL(req.url, `http://${req.headers.host ?? `${host}:${port}`}`);
}

function getServerPort(server, fallback = 0) {
  const address = server.address();
  return typeof address === 'object' && address ? address.port : fallback;
}

function isLocalhostHost(hostname) {
  return hostname === '127.0.0.1' || hostname === '::1' || hostname === 'localhost';
}

async function startBrowserPopoutServer(options = {}) {
  const host = options.host ?? DEFAULT_HOST;
  const pagePath = options.pagePath ?? DEFAULT_PAGE_PATH;
  const webSocketPath = options.webSocketPath ?? DEFAULT_WEB_SOCKET_PATH;
  const themePath = options.themePath ?? DEFAULT_THEME_PATH;
  const protocolVersion = String(options.protocolVersion ?? DEFAULT_PROTOCOL_VERSION);
  const token = String(options.token ?? generateBrowserPopoutToken());
  const onCommand = typeof options.onCommand === 'function' ? options.onCommand : null;
  const onHandshake = typeof options.onHandshake === 'function' ? options.onHandshake : null;
  const renderPage = typeof options.renderPage === 'function' ? options.renderPage : null;
  const connections = new Set();

  const server = http.createServer(async (req, res) => {
    const url = getRequestUrl(req, host, getServerPort(server));
    const requestToken = url.searchParams.get('token');

    if (requestToken !== token) {
      res.writeHead(401, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Invalid browser pop-out token');
      return;
    }

    if (req.method !== 'GET') {
      res.writeHead(405, { Allow: 'GET' });
      res.end();
      return;
    }

    if (url.pathname === themePath) {
      const css = await readFile(THEME_FILE_PATH, 'utf8');
      res.writeHead(200, {
        'Content-Type': 'text/css; charset=utf-8',
        'Cache-Control': 'no-store'
      });
      res.end(css);
      return;
    }

    if (url.pathname !== pagePath && url.pathname !== '/index.html') {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const pageContext = {
      pageUrl: `http://${host}:${getServerPort(server)}${pagePath}?token=${encodeURIComponent(token)}`,
      themeUrl: `http://${host}:${getServerPort(server)}${themePath}?token=${encodeURIComponent(token)}`,
      webSocketPath,
      webSocketUrl: `ws://${host}:${getServerPort(server)}${webSocketPath}?token=${encodeURIComponent(token)}`,
      token,
      protocolVersion
    };
    const page = renderPage ? await renderPage(pageContext) : makeBrowserPopoutPage(pageContext);

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    });
    res.end(page);
  });

  server.on('upgrade', (req, socket) => {
    const url = getRequestUrl(req, host, getServerPort(server));

    if (!isLocalhostHost(url.hostname)) {
      return writeRejectedUpgrade(socket, 401, 'Browser pop-out server only accepts loopback requests');
    }

    if (url.pathname !== webSocketPath) {
      return writeRejectedUpgrade(socket, 404, 'Unknown browser pop-out endpoint');
    }

    if (url.searchParams.get('token') !== token) {
      return writeRejectedUpgrade(socket, 401, 'Invalid browser pop-out token');
    }

    if (String(req.headers.upgrade || '').toLowerCase() !== 'websocket') {
      return writeRejectedUpgrade(socket, 400, 'Expected WebSocket upgrade');
    }

    const secWebSocketKey = req.headers['sec-websocket-key'];
    if (typeof secWebSocketKey !== 'string' || secWebSocketKey.length === 0) {
      return writeRejectedUpgrade(socket, 400, 'Missing Sec-WebSocket-Key header');
    }

    const accept = crypto
      .createHash('sha1')
      .update(`${secWebSocketKey}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
      .digest('base64');

    socket.write(
      'HTTP/1.1 101 Switching Protocols\r\n' +
        'Upgrade: websocket\r\n' +
        'Connection: Upgrade\r\n' +
        `Sec-WebSocket-Accept: ${accept}\r\n` +
        '\r\n'
    );

    const connection = {
      socket,
      buffer: Buffer.alloc(0),
      clientId: null
    };

    connections.add(connection);

    socket.on('data', (chunk) => {
      const frames = decodeBrowserPopoutFrames(chunk, connection);

      for (const frame of frames) {
        if (frame.opcode === 0x8) {
          socket.end();
          return;
        }

        if (frame.opcode !== 0x1) {
          continue;
        }

        if (frame.payload.length > MAX_MESSAGE_SIZE_BYTES) {
          socket.end();
          return;
        }

        let message;
        try {
          message = JSON.parse(frame.payload.toString('utf8'));
        } catch (error) {
          const response = normalizeCommandError('invalid-command', error);
          socket.write(encodeBrowserPopoutTextFrame(JSON.stringify(response)));
          continue;
        }

        const validation = validateBrowserPopoutMessage(message);
        if (!validation.valid) {
          const response = normalizeCommandError(
            typeof message?.requestId === 'string' ? message.requestId : 'invalid-command',
            new Error(validation.errors.join('; '))
          );
          socket.write(encodeBrowserPopoutTextFrame(JSON.stringify(response)));
          continue;
        }

        if (message.type === 'handshake') {
          connection.clientId = message.clientId;
          if (onHandshake) {
            Promise.resolve(onHandshake({ message, connection, server: api })).catch(() => {
              socket.destroy();
            });
          }
          continue;
        }

        if (message.type === 'command') {
          Promise.resolve(onCommand ? onCommand({ message, connection, server: api }) : undefined)
            .then((outcome) => {
              const response = normalizeCommandResult(message.requestId, outcome);
              const responseValidation = validateBrowserPopoutMessage(response);
              if (!responseValidation.valid) {
                throw new Error(responseValidation.errors.join('; '));
              }
              socket.write(encodeBrowserPopoutTextFrame(JSON.stringify(response)));
            })
            .catch((error) => {
              const response = normalizeCommandError(message.requestId, error);
              socket.write(encodeBrowserPopoutTextFrame(JSON.stringify(response)));
            });
        }
      }
    });

    socket.on('close', () => {
      connections.delete(connection);
    });

    socket.on('error', () => {
      connections.delete(connection);
    });
  });

  const api = {
    host,
    port: null,
    token,
    pagePath,
    themePath,
    webSocketPath,
    protocolVersion,
    httpServer: server,
    connections,
    get pageUrl() {
      return `http://${host}:${api.port}${pagePath}?token=${encodeURIComponent(token)}`;
    },
    get webSocketUrl() {
      return `ws://${host}:${api.port}${webSocketPath}?token=${encodeURIComponent(token)}`;
    },
    get themeUrl() {
      return `http://${host}:${api.port}${themePath}?token=${encodeURIComponent(token)}`;
    },
    broadcastState(stateJson) {
      const message = createBrowserPopoutStateUpdate({ state: stateJson });
      const validation = validateBrowserPopoutMessage(message);

      if (!validation.valid) {
        throw new Error(validation.errors.join('; '));
      }

      const payload = encodeBrowserPopoutTextFrame(JSON.stringify(message));
      let delivered = 0;

      for (const connection of connections) {
        if (!connection?.clientId || !connection?.socket || connection.socket.destroyed) {
          continue;
        }

        try {
          connection.socket.write(payload);
          delivered += 1;
        } catch {
          // Ignore broken sockets. Socket lifecycle handlers remove stale connections.
        }
      }

      return delivered;
    },
    close() {
      return stopBrowserPopoutServer(api);
    }
  };

  await new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off('listening', onListening);
      reject(error);
    };

    const onListening = () => {
      server.off('error', onError);
      const address = server.address();
      api.port = typeof address === 'object' && address ? address.port : null;
      resolve();
    };

    server.once('error', onError);
    server.once('listening', onListening);
    server.listen({ host, port: options.port ?? 0 });
  });

  return api;
}

function stopBrowserPopoutServer(serverLike) {
  if (!serverLike) {
    return Promise.resolve();
  }

  const server = serverLike.httpServer ?? serverLike;
  const connections = serverLike.connections ?? new Set();

  for (const connection of connections) {
    try {
      connection.socket.destroy();
    } catch {
      // Ignore shutdown errors.
    }
  }

  return new Promise((resolve) => {
    if (!server.listening) {
      resolve();
      return;
    }

    server.close(() => resolve());
  });
}

module.exports = {
  createBrowserPopoutCommand,
  createBrowserPopoutHandshake,
  createBrowserPopoutResponse,
  createBrowserPopoutStateUpdate,
  decodeBrowserPopoutFrames,
  encodeBrowserPopoutClientTextFrame,
  encodeBrowserPopoutTextFrame,
  generateBrowserPopoutToken,
  normalizeCommandError,
  normalizeCommandResult,
  startBrowserPopoutServer,
  stopBrowserPopoutServer,
  validateBrowserPopoutMessage
};
