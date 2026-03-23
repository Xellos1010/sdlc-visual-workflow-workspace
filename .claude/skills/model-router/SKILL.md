---
name: model-router
description: >
  Routes tasks to the correct model tier based on task class. Supports cloud
  frontier models (Claude Opus/Sonnet, GPT-4), balanced remote models, and
  local Ollama/OpenLlama models on an external network. Invoke when selecting
  a model for a work order or configuring a local LLM endpoint.
---

# Model Router

Route work to the correct model tier. Built from `foundry/flagship-foundry-work/configs/model-routing/default.json` and `foundry/flagship-foundry-work/configs/provider-manifests/`.

## Task Class → Model Tier Routing

| Task Class | Model Tier | Use Local? | Rationale |
|-----------|-----------|-----------|-----------|
| `strategic_reasoning` | frontier_reasoner | NO | High ambiguity, architectural decisions — needs best model |
| `constraint_interpretation` | frontier_reasoner | NO | Nuanced interpretation of rules and requirements |
| `verification` | balanced_reasoner | conditional | Needs good reasoning but not the most expensive |
| `diagnostics` | balanced_reasoner | conditional | Root cause analysis requires good reasoning |
| `learning` | balanced_reasoner | conditional | Pattern extraction from evidence |
| `deterministic_transformation` | low_cost_executor | YES | Bounded code generation with clear spec — local models excel |
| `structured_generation` | low_cost_executor | YES | Schema/config/template generation — predictable structure |

## Provider Registry

### Frontier Reasoner (Cloud — Required for strategic work)
| Provider | Model IDs | Notes |
|----------|-----------|-------|
| Anthropic (Claude Code) | `claude-opus-4-6`, `claude-sonnet-4-6` | Default for orchestrator, systems-architect |
| OpenAI (Codex) | `o3`, `gpt-4o` | Available via Codex provider swap |

### Balanced Reasoner (Remote — Verification and diagnostics)
| Provider | Model IDs | Notes |
|----------|-----------|-------|
| Anthropic | `claude-sonnet-4-6` | Default for verifier, docs-release-agent |
| OpenAI compatible remote | Any hosted instruct model | Via `provider:openai-compatible-remote` |

### Low Cost Executor (Local — Bounded implementation)
| Provider | Model IDs | Notes |
|----------|-----------|-------|
| Ollama local | `llama3.2`, `qwen2.5-coder`, `codellama` | See local setup below |
| Ollama remote | Any OpenLlama-compatible model | External network host |
| vLLM remote | Any vLLM hosted model | See `foundry/flagship-foundry-work/configs/provider-manifests/vllm-remote.json` |

---

## Local LLM Setup — Ollama on External Network

The user has locally-hosted OpenLlama models on an external network. To configure:

### 1. Verify Ollama endpoint is reachable
```bash
curl http://<REMOTE_HOST>:11434/v1/models
# Should return a list of available models
```

### 2. Configure Claude Code to use local models

In Claude Code, you can configure custom API endpoints via environment variables or Bedrock/Vertex. For Ollama (OpenAI-compatible), set in your shell profile or `.claude/settings.local.json`:

```bash
# Set the base URL for the local Ollama endpoint
export ANTHROPIC_BASE_URL=http://<REMOTE_HOST>:11434/v1
# Or use Bedrock/Vertex if your local model is wrapped there
```

Alternatively, Claude Code supports custom providers via `.mcp.json`. Add the Ollama provider as an MCP tool server that wraps the local endpoint.

### 3. Configure Cursor to use local models

In Cursor Settings → Models → Add Custom Model:
- **Model Name**: `ollama/<model-name>` (e.g., `ollama/qwen2.5-coder:7b`)
- **Base URL**: `http://<REMOTE_HOST>:11434/v1`
- **API Key**: `ollama` (placeholder — Ollama doesn't require auth by default)

Or via `.cursor/mcp.json` pointing at the Ollama MCP server.

### 4. Configure Codex to use local models

Codex supports provider swap. In `~/.codex/config.toml`:
```toml
[provider]
name = "openai-compatible"
base_url = "http://<REMOTE_HOST>:11434/v1"
api_key = "ollama"
model = "qwen2.5-coder:7b"
```

Or at runtime: `codex --provider ollama --model qwen2.5-coder`

### 5. Recommended Models by Task

| Task | Recommended Local Model |
|------|------------------------|
| Code generation (TS/JS) | `qwen2.5-coder:7b` or `deepseek-coder-v2` |
| Config/schema generation | `llama3.2:3b` (fast, structured output) |
| Documentation generation | `llama3.1:8b` |
| General small tasks | `llama3.2:1b` (fastest) |

### 6. Routing Rule for Agents

When a work order has `taskClass: deterministic_transformation` or `taskClass: structured_generation` AND the work is clearly bounded with explicit file scope and contracts:
- Prefer local model tier
- Use `provider:ollama-local` or `provider:openai-compatible-remote`
- If local model fails or produces invalid output, escalate to `balanced_reasoner`

When a work order has `taskClass: strategic_reasoning` or `taskClass: constraint_interpretation`:
- **Always use frontier_reasoner** (Claude Opus / GPT-4o)
- Local models are not suitable for ambiguous architectural decisions

---

## Provider Config Reference Files
- `foundry/flagship-foundry-work/configs/provider-manifests/` — all registered providers
- `foundry/flagship-foundry-work/configs/model-routing/default.json` — task class routing rules
- `foundry/flagship-foundry-work/configs/provider-manifests/local-ollama.json` — Ollama local config
- `foundry/flagship-foundry-work/configs/provider-manifests/vllm-remote.json` — vLLM remote config
