import http from 'node:http';

const port = Number(process.env.MODEL_GATEWAY_PORT ?? 4020);

export function createGatewayServer() {
  return http.createServer(async (req, res) => {
    // Normalization logic mapping incoming /v1/chat/completions to specific providers
    // such as Qwen3-Coder (local), MiniMax M2.5, Kimi K2.5, Seed2.0
    if (req.method === 'POST' && req.url === '/v1/chat/completions') {
      try {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));

        console.log(`[model-gateway] Routing request for model: ${body.model}`);

        // Mock response for the slice. In a real integration, this makes outgoing HTTP requests
        // based on the 'model' parameter mapping to the provider targets.
        const responsePayload = {
          id: `chatcmpl-${Date.now()}`,
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: body.model,
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: `Response from normalized model gateway for ${body.model}.`
              },
              finish_reason: 'stop'
            }
          ],
          usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 }
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(responsePayload));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request format', details: err.message }));
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = createGatewayServer();
  server.listen(port, () => {
    console.log(`[model-gateway] Listening on http://localhost:${port}`);
  });
}
