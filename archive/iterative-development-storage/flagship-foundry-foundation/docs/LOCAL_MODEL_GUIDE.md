# Local and Remote Model Guide

## Goal

Use low-cost models for bounded microtasks and preserve expensive models for ambiguity-heavy reasoning.

## Supported host patterns

### 1. Local laptop host
- best for personal development
- lowest latency
- ideal for deterministic executors and low-cost code transforms

### 2. Remote workstation or Windows machine on the LAN/VPN
- useful when a stronger GPU is available elsewhere
- good for team-shared executor backends
- requires explicit host, auth, and routing policy

### 3. Dedicated inference server
- best for high-throughput execution or larger local models
- useful for future team and marketplace scenarios

## Backend recommendations

### Ollama
Use Ollama when you want quick local setup and a broad integration ecosystem. Treat it as an OpenAI-compatible endpoint where possible.

### vLLM
Use vLLM when you want a more explicit server deployment model, higher throughput, or larger hosted models with OpenAI-compatible APIs.

## Example provider patterns

### Local Ollama
- base URL: `http://localhost:11434/v1`
- auth key can be a placeholder for OpenAI-compatible clients

### Remote Ollama on a Windows machine
- install Ollama on Windows
- set `OLLAMA_HOST` so the service binds to the network interface you intend to expose
- protect access with network controls, reverse proxy, or VPN/tailnet
- if browser-based tools need access, allow the correct origins with `OLLAMA_ORIGINS`

### Remote vLLM
- start `vllm serve <model>` on the remote host
- expose the OpenAI-compatible endpoint on a controlled network path
- register the host as `provider:openai-compatible-remote`

## Routing guidance

- use local/remote low-cost backends for deterministic transformation, formatting, sync, and repetitive generation;
- use stronger cloud or high-capability backends for architectural reasoning, failure diagnosis, and policy-heavy verification;
- keep provider choice out of runbooks and encode it in routing policy.

## Operational safety

- never expose local model hosts to the open internet without an authenticated gateway;
- prefer VPN/tailnet or internal network routing;
- treat every remote host as production infrastructure once it becomes a shared executor.
