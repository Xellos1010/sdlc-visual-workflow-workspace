# Skill Routing Criteria

## orchestrator
- **sdlc-phase-router**: new work starts; user asks to resume; phase is unclear; triage required
- **continuity-writer**: phase transition; branch switch; verification status changes; session handoff
- **handoff-generator**: work interruption; phase completion; delegate to another GPT; context recovery needed
- **scope-chunker**: approved architecture exists; implementation slices are needed; task tree needed
- **model-router**: task class unclear; provider/model choice needed; cost/performance balancing needed

## context-curator
- No dedicated skill bundle; rely on role instructions and shared schemas.

## systems-architect
- **define-intent**: new feature discovery; major change discovery; scope and acceptance criteria are unclear
- **c4-diagram-generator**: system visualization requested; trust boundaries needed; container or component view requested
- **adr-writer**: structural decision needs record; tradeoffs must be documented; architecture approval artifact needed

## builder
- **nx-verification**: typecheck/test/build required; verification commands reference Nx; release gate needs structured verification

## verifier
- **nx-verification**: typecheck/test/build required; verification commands reference Nx; release gate needs structured verification
- **evidence-collector**: verification evidence bundle needed; release gate needs proof; criteria-to-evidence mapping needed

## security-reviewer
- No dedicated skill bundle; rely on role instructions and shared schemas.

## performance-reviewer
- No dedicated skill bundle; rely on role instructions and shared schemas.

## docs-release-agent
- **handoff-generator**: work interruption; phase completion; delegate to another GPT; context recovery needed
- **continuity-writer**: phase transition; branch switch; verification status changes; session handoff

## ci-monitor-subagent
- No dedicated skill bundle; rely on role instructions and shared schemas.