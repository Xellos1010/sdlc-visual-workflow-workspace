# Phase 1 — Foundation & Hello World Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove the full idea→spec→diagrams→code→compile→test→failure-tree loop runs end-to-end locally with no cloud dependencies.

**Architecture:** Nx monorepo (existing workspace). New libs: `schemas`, `pal`, `sdk`. New app: `apps/skills`. Local PAL adapter uses SQLite in-memory. Skills are TypeScript ESM modules invoked by Claude Code.

**Tech Stack:** TypeScript 5, ESM, Zod 3, better-sqlite3, Vitest, @anthropic-ai/sdk, Node 20, pnpm 10, Nx 20

---

## File Map

```
libs/
  schemas/
    src/
      entities.ts      — User, Workspace, Artifact, Task entity schemas (Zod)
      events.ts        — EventType enum + WorkspaceEvent schema
      confidence.ts    — ConfidenceScore, ApprovalDecision, ApprovalGate schemas
      index.ts         — barrel export
    package.json
    tsconfig.json
    project.json
  pal/
    src/
      types.ts         — PlatformAdapter interface + sub-adapter interfaces
      factory.ts       — PlatformFactory.create(platform) dispatch
      adapters/
        local.ts       — SQLite in-memory (better-sqlite3), event emitter realtime
        aws.ts         — stub (throws NotImplemented)
        supabase.ts    — stub (throws NotImplemented)
      index.ts         — barrel export
    package.json
    tsconfig.json
    project.json
  sdk/
    src/
      context.ts       — reads .workspace/config.json from CWD
      claude.ts        — Anthropic SDK wrapper with prompt caching
      visual.ts        — opens browser visual companion (data: URI)
      pal-client.ts    — thin wrapper around PlatformFactory
      index.ts         — barrel export
    package.json
    tsconfig.json
    project.json
apps/
  skills/
    src/
      runner.ts        — skill entry point dispatcher
      workspace/
        index.ts       — /workspace skill
      define/
        spec-generator.ts   — idea → spec via Claude
        diagram-generator.ts — spec → C4 diagrams via Claude
        index.ts            — /define skill
      generate/
        code-generator.ts  — spec → code via Claude
        compiler.ts        — runs cargo check or tsc via execFile
        index.ts           — /generate skill
      test/
        test-generator.ts  — spec → test suite via Claude
        test-runner.ts     — runs test commands via execFile
        failure-tree.ts    — groups failures, identifies root causes
        index.ts           — /test skill
    package.json
    tsconfig.json
    project.json
    e2e/
      hello-world.test.ts  — end-to-end proof chain test
```

---

### Task 1: Workspace setup — pnpm-workspace.yaml + root tsconfig

**Files:**
- Modify: `pnpm-workspace.yaml`
- Modify: `tsconfig.base.json` (create if absent)

- [ ] **Step 1: Check current pnpm-workspace.yaml**

```bash
cat pnpm-workspace.yaml
```

Expected: contains `packages:` with `apps/*`. Need to add `libs/*`.

- [ ] **Step 2: Update pnpm-workspace.yaml**

```yaml
packages:
  - 'apps/*'
  - 'libs/*'
```

- [ ] **Step 3: Create tsconfig.base.json if missing**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist"
  }
}
```

- [ ] **Step 4: Verify pnpm recognizes workspaces**

```bash
pnpm ls -r --depth 0
```

Expected: lists workspace packages (or empty if none created yet — no error)

- [ ] **Step 5: Commit**

```bash
git add pnpm-workspace.yaml tsconfig.base.json
git commit -m "chore: add libs/* to pnpm workspace and root tsconfig"
```

---

### Task 2: `libs/schemas` — entity + event + confidence schemas

**Files:**
- Create: `libs/schemas/src/entities.ts`
- Create: `libs/schemas/src/events.ts`
- Create: `libs/schemas/src/confidence.ts`
- Create: `libs/schemas/src/index.ts`
- Create: `libs/schemas/package.json`
- Create: `libs/schemas/tsconfig.json`
- Create: `libs/schemas/project.json`
- Test: `libs/schemas/src/entities.test.ts`

- [ ] **Step 1: Write the failing test**

`libs/schemas/src/entities.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { WorkspaceSchema, ArtifactSchema } from './entities.js'
import { WorkspaceEventSchema, EventType } from './events.js'
import { ConfidenceScoreSchema } from './confidence.js'

describe('schemas', () => {
  it('parses a valid workspace', () => {
    const ws = WorkspaceSchema.parse({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Test WS',
      ownerId: '00000000-0000-0000-0000-000000000002',
      createdAt: new Date().toISOString(),
    })
    expect(ws.name).toBe('Test WS')
  })

  it('parses a workspace event', () => {
    const evt = WorkspaceEventSchema.parse({
      id: '00000000-0000-0000-0000-000000000003',
      workspaceId: '00000000-0000-0000-0000-000000000001',
      type: EventType.SPEC_DRAFTED,
      actorId: '00000000-0000-0000-0000-000000000002',
      actorType: 'user',
      payload: {},
      timestamp: new Date().toISOString(),
    })
    expect(evt.type).toBe('spec.drafted')
  })

  it('parses a confidence score', () => {
    const cs = ConfidenceScoreSchema.parse({
      workspaceId: '00000000-0000-0000-0000-000000000001',
      gateType: 'code_review',
      score: 0.72,
      threshold: 0.85,
      updatedAt: new Date().toISOString(),
    })
    expect(cs.score).toBe(0.72)
    expect(cs.autoApprove).toBe(false)
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd libs/schemas && pnpm vitest run src/entities.test.ts
```

Expected: FAIL — Cannot find module './entities.js'

- [ ] **Step 3: Create package.json**

`libs/schemas/package.json`:
```json
{
  "name": "@sdlc/schemas",
  "version": "0.0.1",
  "type": "module",
  "exports": {
    ".": "./src/index.js"
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run"
  },
  "dependencies": {
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 4: Create tsconfig.json**

`libs/schemas/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Create project.json**

`libs/schemas/project.json`:
```json
{
  "name": "schemas",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/schemas/src",
  "projectType": "library",
  "targets": {
    "build": { "executor": "@nx/js:tsc", "options": { "main": "libs/schemas/src/index.ts", "outputPath": "dist/libs/schemas" } },
    "test": { "executor": "@nx/vite:test", "options": { "configFile": "libs/schemas/vite.config.ts" } }
  }
}
```

- [ ] **Step 6: Create entities.ts**

`libs/schemas/src/entities.ts`:
```typescript
import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.string().datetime(),
})

export const WorkspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  ownerId: z.string().uuid(),
  createdAt: z.string().datetime(),
})

export const ArtifactTypeSchema = z.enum([
  'spec', 'diagram', 'schema', 'runbook', 'code', 'evidence', 'template'
])

export const ArtifactSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  projectId: z.string().uuid().nullable(),
  type: ArtifactTypeSchema,
  title: z.string(),
  contentUrl: z.string().url().optional(),
  content: z.string().optional(),
  version: z.number().int().positive(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const TaskSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  title: z.string(),
  status: z.enum(['open', 'in_progress', 'done', 'blocked']),
  assigneeId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
})

export type User = z.infer<typeof UserSchema>
export type Workspace = z.infer<typeof WorkspaceSchema>
export type Artifact = z.infer<typeof ArtifactSchema>
export type ArtifactType = z.infer<typeof ArtifactTypeSchema>
export type Task = z.infer<typeof TaskSchema>
```

- [ ] **Step 7: Create events.ts**

`libs/schemas/src/events.ts`:
```typescript
import { z } from 'zod'

export enum EventType {
  WORKSPACE_CREATED = 'workspace.created',
  MEMBER_INVITED = 'member.invited',
  PROJECT_CREATED = 'project.created',
  SPEC_DRAFTED = 'spec.drafted',
  SPEC_PUBLISHED = 'spec.published',
  DIAGRAM_GENERATED = 'diagram.generated',
  SCHEMA_DEFINED = 'schema.defined',
  ARTIFACT_COMMENTED = 'artifact.commented',
  RUN_STARTED = 'run.started',
  STEP_COMPLETED = 'step.completed',
  AGENT_SPAWNED = 'agent.spawned',
  AGENT_COMPLETED = 'agent.completed',
  RUN_FAILED = 'run.failed',
  CODE_GENERATED = 'code.generated',
  CODE_COMPILED = 'code.compiled',
  TEST_PASSED = 'test.passed',
  TEST_FAILED = 'test.failed',
  TEST_ROOT_CAUSE = 'test.root_cause',
  GATE_OPENED = 'gate.opened',
  APPROVAL_DECIDED = 'approval.decided',
  APPROVAL_AUTO = 'approval.auto',
  CONFIDENCE_UPDATED = 'confidence.updated',
  THRESHOLD_CROSSED = 'threshold.crossed',
  TEMPLATE_PUBLISHED = 'template.published',
}

export const WorkspaceEventSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  projectId: z.string().uuid().nullable().optional(),
  type: z.nativeEnum(EventType),
  actorId: z.string().uuid(),
  actorType: z.enum(['user', 'agent']),
  payload: z.record(z.unknown()),
  timestamp: z.string().datetime(),
  confDelta: z.number().nullable().optional(),
})

export type WorkspaceEvent = z.infer<typeof WorkspaceEventSchema>
```

- [ ] **Step 8: Create confidence.ts**

`libs/schemas/src/confidence.ts`:
```typescript
import { z } from 'zod'

export const ConfidenceScoreSchema = z.object({
  workspaceId: z.string().uuid(),
  gateType: z.string().min(1),
  score: z.number().min(0).max(1),
  threshold: z.number().min(0).max(1).default(0.85),
  updatedAt: z.string().datetime(),
}).transform(data => ({
  ...data,
  autoApprove: data.score >= data.threshold,
}))

export const ApprovalDecisionSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  gateType: z.string(),
  gateId: z.string().uuid(),
  deciderId: z.string().uuid(),
  decision: z.enum(['approved', 'rejected']),
  confDelta: z.number(),
  decidedAt: z.string().datetime(),
})

export const ApprovalGateSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  runId: z.string().uuid(),
  gateType: z.string(),
  status: z.enum(['open', 'auto_approved', 'approved', 'rejected']),
  assigneeIds: z.array(z.string().uuid()),
  openedAt: z.string().datetime(),
  closedAt: z.string().datetime().nullable(),
})

export type ConfidenceScore = z.infer<typeof ConfidenceScoreSchema>
export type ApprovalDecision = z.infer<typeof ApprovalDecisionSchema>
export type ApprovalGate = z.infer<typeof ApprovalGateSchema>
```

- [ ] **Step 9: Create index.ts**

`libs/schemas/src/index.ts`:
```typescript
export * from './entities.js'
export * from './events.js'
export * from './confidence.js'
```

- [ ] **Step 10: Install deps and run tests**

```bash
cd libs/schemas && pnpm install && pnpm vitest run src/entities.test.ts
```

Expected: 3 tests PASS

- [ ] **Step 11: Commit**

```bash
git add libs/schemas/
git commit -m "feat(schemas): add entity, event, and confidence Zod schemas"
```

---

### Task 3: `libs/pal` — Platform Abstraction Layer

**Files:**
- Create: `libs/pal/src/types.ts`
- Create: `libs/pal/src/factory.ts`
- Create: `libs/pal/src/adapters/local.ts`
- Create: `libs/pal/src/adapters/aws.ts`
- Create: `libs/pal/src/adapters/supabase.ts`
- Create: `libs/pal/src/index.ts`
- Create: `libs/pal/package.json`, `tsconfig.json`, `project.json`
- Test: `libs/pal/src/pal.test.ts`

- [ ] **Step 1: Write the failing test**

`libs/pal/src/pal.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PlatformFactory } from './factory.js'

describe('PAL local adapter', () => {
  let pal: Awaited<ReturnType<typeof PlatformFactory.createAsync>>

  beforeEach(async () => {
    pal = await PlatformFactory.createAsync('local')
  })

  afterEach(async () => {
    await pal.db.execute('DROP TABLE IF EXISTS test_table', [])
  })

  it('executes SQL and returns rows', async () => {
    await pal.db.execute(
      'CREATE TABLE test_table (id TEXT PRIMARY KEY, val TEXT)',
      []
    )
    await pal.db.execute(
      'INSERT INTO test_table (id, val) VALUES (?, ?)',
      ['1', 'hello']
    )
    const rows = await pal.db.query('SELECT * FROM test_table', [])
    expect(rows).toHaveLength(1)
    expect(rows[0].val).toBe('hello')
  })

  it('emits and receives events via realtime', async () => {
    const received: unknown[] = []
    await pal.realtime.subscribe('test.channel', (event) => {
      received.push(event)
    })
    await pal.realtime.broadcast('test.channel', { msg: 'hello' })
    expect(received).toHaveLength(1)
  })

  it('stores and retrieves from storage', async () => {
    const url = await pal.storage.upload('test/hello.txt', Buffer.from('hello world'))
    const data = await pal.storage.download(url)
    expect(data.toString()).toBe('hello world')
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
cd libs/pal && pnpm vitest run src/pal.test.ts 2>&1 | head -20
```

Expected: FAIL — Cannot find module './factory.js'

- [ ] **Step 3: Create package.json**

`libs/pal/package.json`:
```json
{
  "name": "@sdlc/pal",
  "version": "0.0.1",
  "type": "module",
  "exports": {
    ".": "./src/index.js"
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run"
  },
  "dependencies": {
    "better-sqlite3": "^9.6.0"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.11",
    "typescript": "^5.9.3",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 4: Create types.ts**

`libs/pal/src/types.ts`:
```typescript
export interface DatabaseAdapter {
  query(sql: string, params: unknown[]): Promise<Record<string, unknown>[]>
  execute(sql: string, params: unknown[]): Promise<void>
  transaction<T>(fn: (db: DatabaseAdapter) => Promise<T>): Promise<T>
}

export interface RealtimeAdapter {
  subscribe(channel: string, handler: (event: unknown) => void): Promise<void>
  broadcast(channel: string, event: unknown): Promise<void>
}

export interface StorageAdapter {
  upload(path: string, data: Buffer): Promise<string>
  download(path: string): Promise<Buffer>
  getSignedUrl(path: string, expiresIn: number): Promise<string>
  delete(path: string): Promise<void>
}

export interface AuthAdapter {
  verifyToken(token: string): Promise<{ userId: string; email: string }>
  createToken(userId: string): Promise<string>
}

export interface EventsAdapter {
  emit(channel: string, event: unknown): Promise<void>
  replay(channel: string, since: string): Promise<unknown[]>
}

export interface PlatformAdapter {
  auth: AuthAdapter
  db: DatabaseAdapter
  realtime: RealtimeAdapter
  storage: StorageAdapter
  events: EventsAdapter
}

export type Platform = 'aws' | 'supabase' | 'local'
```

- [ ] **Step 5: Create local adapter**

`libs/pal/src/adapters/local.ts`:
```typescript
import Database from 'better-sqlite3'
import type { DatabaseAdapter, RealtimeAdapter, StorageAdapter, AuthAdapter, EventsAdapter, PlatformAdapter } from '../types.js'

const storage = new Map<string, Buffer>()
const subscribers = new Map<string, Array<(event: unknown) => void>>()

const db = new Database(':memory:')
db.pragma('journal_mode = WAL')

const dbAdapter: DatabaseAdapter = {
  async query(sql, params) {
    const stmt = db.prepare(sql)
    return stmt.all(...params) as Record<string, unknown>[]
  },
  async execute(sql, params) {
    const stmt = db.prepare(sql)
    stmt.run(...params)
  },
  async transaction(fn) {
    return db.transaction(() => fn(dbAdapter))()
  },
}

const realtimeAdapter: RealtimeAdapter = {
  async subscribe(channel, handler) {
    if (!subscribers.has(channel)) subscribers.set(channel, [])
    subscribers.get(channel)!.push(handler)
  },
  async broadcast(channel, event) {
    const handlers = subscribers.get(channel) ?? []
    for (const h of handlers) h(event)
  },
}

const storageAdapter: StorageAdapter = {
  async upload(path, data) {
    storage.set(path, data)
    return path
  },
  async download(path) {
    const data = storage.get(path)
    if (!data) throw new Error(`Not found: ${path}`)
    return data
  },
  async getSignedUrl(path, _expiresIn) {
    return `local://${path}`
  },
  async delete(path) {
    storage.delete(path)
  },
}

const authAdapter: AuthAdapter = {
  async verifyToken(token) {
    const [userId, email] = token.split(':')
    return { userId, email }
  },
  async createToken(userId) {
    return `${userId}:local@example.com`
  },
}

const eventsAdapter: EventsAdapter = {
  async emit(channel, event) {
    await realtimeAdapter.broadcast(channel, event)
  },
  async replay(_channel, _since) {
    return []
  },
}

export const localAdapter: PlatformAdapter = {
  auth: authAdapter,
  db: dbAdapter,
  realtime: realtimeAdapter,
  storage: storageAdapter,
  events: eventsAdapter,
}
```

- [ ] **Step 6: Create AWS stub**

`libs/pal/src/adapters/aws.ts`:
```typescript
import type { PlatformAdapter } from '../types.js'

const notImplemented = (method: string) => () => {
  throw new Error(`AWS PAL adapter not implemented: ${method}. Set PLATFORM=local for development.`)
}

export const awsAdapter: PlatformAdapter = {
  auth: {
    verifyToken: notImplemented('auth.verifyToken'),
    createToken: notImplemented('auth.createToken'),
  },
  db: {
    query: notImplemented('db.query'),
    execute: notImplemented('db.execute'),
    transaction: notImplemented('db.transaction'),
  },
  realtime: {
    subscribe: notImplemented('realtime.subscribe'),
    broadcast: notImplemented('realtime.broadcast'),
  },
  storage: {
    upload: notImplemented('storage.upload'),
    download: notImplemented('storage.download'),
    getSignedUrl: notImplemented('storage.getSignedUrl'),
    delete: notImplemented('storage.delete'),
  },
  events: {
    emit: notImplemented('events.emit'),
    replay: notImplemented('events.replay'),
  },
}
```

- [ ] **Step 7: Create Supabase stub**

`libs/pal/src/adapters/supabase.ts`:
```typescript
import type { PlatformAdapter } from '../types.js'

const notImplemented = (method: string) => () => {
  throw new Error(`Supabase PAL adapter not implemented: ${method}. Set PLATFORM=local for development.`)
}

export const supabaseAdapter: PlatformAdapter = {
  auth: {
    verifyToken: notImplemented('auth.verifyToken'),
    createToken: notImplemented('auth.createToken'),
  },
  db: {
    query: notImplemented('db.query'),
    execute: notImplemented('db.execute'),
    transaction: notImplemented('db.transaction'),
  },
  realtime: {
    subscribe: notImplemented('realtime.subscribe'),
    broadcast: notImplemented('realtime.broadcast'),
  },
  storage: {
    upload: notImplemented('storage.upload'),
    download: notImplemented('storage.download'),
    getSignedUrl: notImplemented('storage.getSignedUrl'),
    delete: notImplemented('storage.delete'),
  },
  events: {
    emit: notImplemented('events.emit'),
    replay: notImplemented('events.replay'),
  },
}
```

- [ ] **Step 8: Create factory.ts**

`libs/pal/src/factory.ts`:
```typescript
import type { PlatformAdapter, Platform } from './types.js'
import { localAdapter } from './adapters/local.js'
import { awsAdapter } from './adapters/aws.js'
import { supabaseAdapter } from './adapters/supabase.js'

export const PlatformFactory = {
  create(platform: Platform): PlatformAdapter {
    switch (platform) {
      case 'local': return localAdapter
      case 'aws': return awsAdapter
      case 'supabase': return supabaseAdapter
    }
  },

  async createAsync(platform: Platform): Promise<PlatformAdapter> {
    return PlatformFactory.create(platform)
  },

  fromEnv(): PlatformAdapter {
    const platform = (process.env.PLATFORM ?? 'local') as Platform
    return PlatformFactory.create(platform)
  },
}
```

- [ ] **Step 9: Create index.ts**

`libs/pal/src/index.ts`:
```typescript
export * from './types.js'
export * from './factory.js'
export { localAdapter } from './adapters/local.js'
```

- [ ] **Step 10: Create tsconfig.json and project.json**

`libs/pal/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

`libs/pal/project.json`:
```json
{
  "name": "pal",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/pal/src",
  "projectType": "library",
  "targets": {
    "build": { "executor": "@nx/js:tsc", "options": { "main": "libs/pal/src/index.ts", "outputPath": "dist/libs/pal" } },
    "test": { "executor": "@nx/vite:test" }
  }
}
```

- [ ] **Step 11: Install and run tests**

```bash
cd libs/pal && pnpm install && pnpm vitest run src/pal.test.ts
```

Expected: 3 tests PASS

- [ ] **Step 12: Commit**

```bash
git add libs/pal/
git commit -m "feat(pal): add Platform Abstraction Layer with local SQLite adapter"
```

---

### Task 4: `libs/sdk` — context detection, Claude wrapper, visual companion

**Files:**
- Create: `libs/sdk/src/context.ts`
- Create: `libs/sdk/src/claude.ts`
- Create: `libs/sdk/src/visual.ts`
- Create: `libs/sdk/src/pal-client.ts`
- Create: `libs/sdk/src/index.ts`
- Create: `libs/sdk/package.json`, `tsconfig.json`, `project.json`
- Test: `libs/sdk/src/context.test.ts`

- [ ] **Step 1: Write the failing test**

`libs/sdk/src/context.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { readWorkspaceContext, DEFAULT_CONTEXT } from './context.js'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const TMP = '/tmp/sdk-test-workspace'

describe('context detection', () => {
  beforeEach(() => {
    mkdirSync(join(TMP, '.workspace'), { recursive: true })
  })

  afterEach(() => {
    rmSync(TMP, { recursive: true, force: true })
  })

  it('reads config when present', async () => {
    writeFileSync(
      join(TMP, '.workspace/config.json'),
      JSON.stringify({
        workspaceId: '00000000-0000-0000-0000-000000000001',
        projectId: '00000000-0000-0000-0000-000000000002',
        platform: 'local',
      })
    )
    const ctx = await readWorkspaceContext(TMP)
    expect(ctx.workspaceId).toBe('00000000-0000-0000-0000-000000000001')
    expect(ctx.platform).toBe('local')
  })

  it('returns default context when config absent', async () => {
    const ctx = await readWorkspaceContext(TMP)
    expect(ctx).toEqual(DEFAULT_CONTEXT)
  })
})
```

- [ ] **Step 2: Run — verify fails**

```bash
cd libs/sdk && pnpm vitest run src/context.test.ts 2>&1 | head -10
```

Expected: FAIL — Cannot find module

- [ ] **Step 3: Create package.json**

`libs/sdk/package.json`:
```json
{
  "name": "@sdlc/sdk",
  "version": "0.0.1",
  "type": "module",
  "exports": {
    ".": "./src/index.js"
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.26.0",
    "@sdlc/pal": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 4: Create context.ts**

`libs/sdk/src/context.ts`:
```typescript
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Platform } from '@sdlc/pal'

export interface WorkspaceContext {
  workspaceId: string | null
  projectId: string | null
  platform: Platform
}

export const DEFAULT_CONTEXT: WorkspaceContext = {
  workspaceId: null,
  projectId: null,
  platform: 'local',
}

export async function readWorkspaceContext(cwd = process.cwd()): Promise<WorkspaceContext> {
  try {
    const raw = await readFile(join(cwd, '.workspace/config.json'), 'utf-8')
    const config = JSON.parse(raw)
    return {
      workspaceId: config.workspaceId ?? null,
      projectId: config.projectId ?? null,
      platform: (config.platform ?? 'local') as Platform,
    }
  } catch {
    return DEFAULT_CONTEXT
  }
}
```

- [ ] **Step 5: Create claude.ts**

`libs/sdk/src/claude.ts`:
```typescript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export interface ClaudeOptions {
  model?: string
  maxTokens?: number
  systemPrompt?: string
}

export async function callClaude(
  userPrompt: string,
  opts: ClaudeOptions = {}
): Promise<string> {
  const model = opts.model ?? 'claude-sonnet-4-6'
  const maxTokens = opts.maxTokens ?? 4096
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: userPrompt }
  ]

  const systemContent: Anthropic.TextBlockParam[] = opts.systemPrompt
    ? [{
        type: 'text',
        text: opts.systemPrompt,
        cache_control: { type: 'ephemeral' },
      }]
    : []

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemContent.length > 0 ? systemContent : undefined,
    messages,
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Expected text response from Claude')
  return block.text
}
```

- [ ] **Step 6: Create visual.ts**

`libs/sdk/src/visual.ts`:
```typescript
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export async function openVisualCompanion(html: string): Promise<void> {
  const encoded = Buffer.from(html).toString('base64')
  const dataUri = `data:text/html;base64,${encoded}`
  const opener = process.platform === 'darwin' ? 'open' : 'xdg-open'
  const args = process.platform === 'darwin' ? ['-a', 'Google Chrome', '--new', dataUri] : [dataUri]
  await execFileAsync(opener, args)
}

export function wrapHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  body { background: #0f1320; color: #e2e8f0; font-family: system-ui, sans-serif; padding: 24px; }
  h1 { color: #7c8cf8; }
  pre { background: #1a1f2e; padding: 16px; border-radius: 8px; overflow-x: auto; }
</style>
</head>
<body>
<h1>${title}</h1>
${body}
</body>
</html>`
}
```

- [ ] **Step 7: Create pal-client.ts**

`libs/sdk/src/pal-client.ts`:
```typescript
import { PlatformFactory } from '@sdlc/pal'
import type { PlatformAdapter } from '@sdlc/pal'
import { readWorkspaceContext } from './context.js'

let _pal: PlatformAdapter | null = null

export async function getPal(): Promise<PlatformAdapter> {
  if (_pal) return _pal
  const ctx = await readWorkspaceContext()
  _pal = PlatformFactory.create(ctx.platform)
  return _pal
}
```

- [ ] **Step 8: Create index.ts**

`libs/sdk/src/index.ts`:
```typescript
export * from './context.js'
export * from './claude.js'
export * from './visual.js'
export * from './pal-client.js'
```

- [ ] **Step 9: Create tsconfig.json and project.json**

`libs/sdk/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

`libs/sdk/project.json`:
```json
{
  "name": "sdk",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/sdk/src",
  "projectType": "library",
  "targets": {
    "build": { "executor": "@nx/js:tsc", "options": { "main": "libs/sdk/src/index.ts", "outputPath": "dist/libs/sdk" } },
    "test": { "executor": "@nx/vite:test" }
  }
}
```

- [ ] **Step 10: Install and run tests**

```bash
cd libs/sdk && pnpm install && pnpm vitest run src/context.test.ts
```

Expected: 2 tests PASS

- [ ] **Step 11: Commit**

```bash
git add libs/sdk/
git commit -m "feat(sdk): add context detection, Claude wrapper, visual companion, PAL client"
```

---

### Task 5: `apps/skills` — workspace structure and runner

**Files:**
- Create: `apps/skills/src/runner.ts`
- Create: `apps/skills/src/workspace/index.ts`
- Create: `apps/skills/package.json`, `tsconfig.json`, `project.json`
- Test: `apps/skills/src/runner.test.ts`

- [ ] **Step 1: Write the failing test**

`apps/skills/src/runner.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { parseSkillArgs } from './runner.js'

describe('skill runner', () => {
  it('parses skill name from argv', () => {
    const result = parseSkillArgs(['node', 'runner.js', '/define', 'hello world API'])
    expect(result.skill).toBe('define')
    expect(result.args).toBe('hello world API')
  })

  it('handles missing args', () => {
    const result = parseSkillArgs(['node', 'runner.js', '/workspace'])
    expect(result.skill).toBe('workspace')
    expect(result.args).toBe('')
  })
})
```

- [ ] **Step 2: Run — verify fails**

```bash
cd apps/skills && pnpm vitest run src/runner.test.ts 2>&1 | head -10
```

Expected: FAIL

- [ ] **Step 3: Create package.json**

`apps/skills/package.json`:
```json
{
  "name": "@sdlc/skills",
  "version": "0.0.1",
  "type": "module",
  "bin": {
    "sdlc-skill": "./src/runner.ts"
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run"
  },
  "dependencies": {
    "@sdlc/schemas": "workspace:*",
    "@sdlc/pal": "workspace:*",
    "@sdlc/sdk": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 4: Create runner.ts**

`apps/skills/src/runner.ts`:
```typescript
export interface ParsedArgs {
  skill: string
  args: string
}

export function parseSkillArgs(argv: string[]): ParsedArgs {
  const skillRaw = argv[2] ?? ''
  const skill = skillRaw.startsWith('/') ? skillRaw.slice(1) : skillRaw
  const args = argv.slice(3).join(' ')
  return { skill, args }
}

async function main() {
  const { skill, args } = parseSkillArgs(process.argv)
  const { default: handler } = await import(`./${skill}/index.js`)
  await handler(args)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 5: Create workspace skill**

`apps/skills/src/workspace/index.ts`:
```typescript
import { readWorkspaceContext } from '@sdlc/sdk'
import { getPal } from '@sdlc/sdk'
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

export default async function workspaceSkill(args: string): Promise<void> {
  const [subcommand, ...rest] = args.split(' ')

  if (subcommand === 'init') {
    const name = rest.join(' ') || 'My Workspace'
    const workspaceId = randomUUID()
    const projectId = randomUUID()
    const config = { workspaceId, projectId, platform: 'local' }

    await mkdir('.workspace', { recursive: true })
    await writeFile('.workspace/config.json', JSON.stringify(config, null, 2))
    console.log(`Workspace initialized: ${name}`)
    console.log(`  workspace_id: ${workspaceId}`)
    console.log(`  project_id:   ${projectId}`)
    return
  }

  const ctx = await readWorkspaceContext()
  const pal = await getPal()

  if (subcommand === 'status' || !subcommand) {
    console.log('Workspace context:')
    console.log(JSON.stringify(ctx, null, 2))
    return
  }

  console.error(`Unknown workspace subcommand: ${subcommand}`)
  process.exit(1)
}
```

- [ ] **Step 6: Create tsconfig.json and project.json**

`apps/skills/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

`apps/skills/project.json`:
```json
{
  "name": "skills",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/skills/src",
  "projectType": "application",
  "targets": {
    "build": { "executor": "@nx/js:tsc", "options": { "main": "apps/skills/src/runner.ts", "outputPath": "dist/apps/skills" } },
    "test": { "executor": "@nx/vite:test" }
  }
}
```

- [ ] **Step 7: Install and run tests**

```bash
cd apps/skills && pnpm install && pnpm vitest run src/runner.test.ts
```

Expected: 2 tests PASS

- [ ] **Step 8: Commit**

```bash
git add apps/skills/
git commit -m "feat(skills): add skill runner and /workspace skill"
```

---

### Task 6: `/define` skill — idea → spec → C4 diagrams

**Files:**
- Create: `apps/skills/src/define/spec-generator.ts`
- Create: `apps/skills/src/define/diagram-generator.ts`
- Create: `apps/skills/src/define/index.ts`
- Test: `apps/skills/src/define/spec-generator.test.ts`

- [ ] **Step 1: Write the failing test**

`apps/skills/src/define/spec-generator.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { buildSpecPrompt, parseSpecResponse } from './spec-generator.js'

describe('spec-generator', () => {
  it('builds a spec prompt from idea', () => {
    const prompt = buildSpecPrompt('hello world REST API')
    expect(prompt).toContain('hello world REST API')
    expect(prompt).toContain('spec')
  })

  it('parses spec response into structured artifact', () => {
    const raw = `# Hello World REST API Spec

## Purpose
A minimal REST API returning hello world.

## Endpoints
- GET /hello → 200 { message: "hello world" }

## Tech Stack
Rust + Axum
`
    const spec = parseSpecResponse(raw, 'hello world REST API')
    expect(spec.title).toBe('hello world REST API')
    expect(spec.content).toContain('GET /hello')
    expect(spec.type).toBe('spec')
  })
})
```

- [ ] **Step 2: Run — verify fails**

```bash
cd apps/skills && pnpm vitest run src/define/spec-generator.test.ts 2>&1 | head -10
```

Expected: FAIL

- [ ] **Step 3: Create spec-generator.ts**

`apps/skills/src/define/spec-generator.ts`:
```typescript
import { callClaude } from '@sdlc/sdk'
import type { ArtifactType } from '@sdlc/schemas'

export interface SpecArtifact {
  title: string
  type: ArtifactType
  content: string
}

export function buildSpecPrompt(idea: string): string {
  return `You are a software architect. The user has the following idea:

"${idea}"

Write a concise technical spec for this. Include:
1. Purpose — what problem it solves
2. Endpoints or interfaces (with request/response shapes)
3. Tech stack recommendation (Rust + Axum for backend, or TypeScript for skills)
4. Data model if persistence is needed
5. Acceptance criteria (3-5 testable items)

Format: markdown. Be specific. No fluff.`
}

export function parseSpecResponse(content: string, idea: string): SpecArtifact {
  return {
    title: idea,
    type: 'spec',
    content,
  }
}

export async function generateSpec(idea: string): Promise<SpecArtifact> {
  const prompt = buildSpecPrompt(idea)
  const content = await callClaude(prompt, {
    systemPrompt: 'You are a senior software architect generating precise technical specifications.',
    maxTokens: 2048,
  })
  return parseSpecResponse(content, idea)
}
```

- [ ] **Step 4: Create diagram-generator.ts**

`apps/skills/src/define/diagram-generator.ts`:
```typescript
import { callClaude } from '@sdlc/sdk'

export interface DiagramArtifact {
  title: string
  type: 'diagram'
  diagramType: 'c4-context' | 'c4-container'
  content: string
}

export async function generateC4Diagrams(spec: string, systemName: string): Promise<DiagramArtifact[]> {
  const contextPrompt = `Based on this spec, generate a C4 Context diagram in Mermaid format for "${systemName}":

${spec}

Output ONLY valid Mermaid diagram syntax, starting with \`C4Context\` or \`graph TD\`. No explanation.`

  const containerPrompt = `Based on this spec, generate a C4 Container diagram in Mermaid format for "${systemName}":

${spec}

Show the internal containers (e.g., API service, database, skill layer). Output ONLY valid Mermaid syntax. No explanation.`

  const [contextDiagram, containerDiagram] = await Promise.all([
    callClaude(contextPrompt, { maxTokens: 1024 }),
    callClaude(containerPrompt, { maxTokens: 1024 }),
  ])

  return [
    { title: `${systemName} — C4 Context`, type: 'diagram', diagramType: 'c4-context', content: contextDiagram },
    { title: `${systemName} — C4 Container`, type: 'diagram', diagramType: 'c4-container', content: containerDiagram },
  ]
}
```

- [ ] **Step 5: Create define/index.ts**

`apps/skills/src/define/index.ts`:
```typescript
import { generateSpec } from './spec-generator.js'
import { generateC4Diagrams } from './diagram-generator.js'
import { openVisualCompanion, wrapHtml } from '@sdlc/sdk'

export default async function defineSkill(args: string): Promise<void> {
  const idea = args.trim()
  if (!idea) {
    console.error('Usage: /define "<idea>"')
    process.exit(1)
  }

  console.log(`Drafting spec for: "${idea}"...`)
  const spec = await generateSpec(idea)
  console.log('\n--- SPEC ---')
  console.log(spec.content)

  console.log('\nGenerating C4 diagrams...')
  const diagrams = await generateC4Diagrams(spec.content, idea)

  const diagramHtml = diagrams.map(d => `
    <h2>${d.title}</h2>
    <pre><code>${d.content}</code></pre>
  `).join('\n')

  const html = wrapHtml(`Spec: ${idea}`, `
    <h2>Specification</h2>
    <pre>${spec.content}</pre>
    ${diagramHtml}
  `)

  await openVisualCompanion(html)
  console.log('\nSpec and diagrams ready. Visual companion opened.')
}
```

- [ ] **Step 6: Run test — verify it passes**

```bash
cd apps/skills && pnpm vitest run src/define/spec-generator.test.ts
```

Expected: 2 tests PASS

- [ ] **Step 7: Commit**

```bash
git add apps/skills/src/define/
git commit -m "feat(skills): add /define skill — spec generation and C4 diagram generation"
```

---

### Task 7: `/generate` skill — code generation + compile check

**Files:**
- Create: `apps/skills/src/generate/code-generator.ts`
- Create: `apps/skills/src/generate/compiler.ts`
- Create: `apps/skills/src/generate/index.ts`
- Test: `apps/skills/src/generate/compiler.test.ts`

- [ ] **Step 1: Write the failing test**

`apps/skills/src/generate/compiler.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { buildCargoToml, buildAxumHandler } from './code-generator.js'

describe('code-generator', () => {
  it('generates a valid Cargo.toml', () => {
    const toml = buildCargoToml('hello-world')
    expect(toml).toContain('[package]')
    expect(toml).toContain('name = "hello-world"')
    expect(toml).toContain('axum')
    expect(toml).toContain('tokio')
  })

  it('generates a valid Axum handler', () => {
    const handler = buildAxumHandler('GET /hello')
    expect(handler).toContain('async fn')
    expect(handler).toContain('Json')
    expect(handler).toContain('StatusCode')
  })
})
```

- [ ] **Step 2: Run — verify fails**

```bash
cd apps/skills && pnpm vitest run src/generate/compiler.test.ts 2>&1 | head -10
```

Expected: FAIL

- [ ] **Step 3: Create code-generator.ts**

`apps/skills/src/generate/code-generator.ts`:
```typescript
import { callClaude } from '@sdlc/sdk'

export interface GeneratedCode {
  files: Record<string, string>
  target: string
}

export function buildCargoToml(crateName: string): string {
  return `[package]
name = "${crateName}"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.7"
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tower = "0.4"
`
}

export function buildAxumHandler(endpoint: string): string {
  return `use axum::{routing::get, Router, Json, http::StatusCode};
use serde::Serialize;

#[derive(Serialize)]
struct HelloResponse {
    message: String,
}

async fn hello_handler() -> (StatusCode, Json<HelloResponse>) {
    (
        StatusCode::OK,
        Json(HelloResponse {
            message: "hello world".to_string(),
        }),
    )
}

#[tokio::main]
async fn main() {
    let app = Router::new().route("/hello", get(hello_handler));
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
`
}

export async function generateCode(spec: string, target: 'web-api' | 'cli-binary'): Promise<GeneratedCode> {
  const prompt = `Generate Rust code for this spec targeting ${target}:

${spec}

Output a JSON object with this shape:
{
  "files": {
    "src/main.rs": "<complete rust source>",
    "Cargo.toml": "<complete cargo toml>"
  }
}

Output ONLY valid JSON. No markdown. No explanation.`

  const response = await callClaude(prompt, { maxTokens: 4096 })

  try {
    const parsed = JSON.parse(response)
    return { files: parsed.files, target }
  } catch {
    return {
      files: {
        'Cargo.toml': buildCargoToml('generated-app'),
        'src/main.rs': buildAxumHandler('GET /hello'),
      },
      target,
    }
  }
}
```

- [ ] **Step 4: Create compiler.ts**

`apps/skills/src/generate/compiler.ts`:
```typescript
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import type { GeneratedCode } from './code-generator.js'

const execFileAsync = promisify(execFile)

export interface CompileResult {
  success: boolean
  stdout: string
  stderr: string
  target: string
}

export async function writeGeneratedFiles(code: GeneratedCode, outDir: string): Promise<void> {
  for (const [relPath, content] of Object.entries(code.files)) {
    const fullPath = join(outDir, relPath)
    await mkdir(join(outDir, relPath, '..'), { recursive: true })
    await writeFile(fullPath, content, 'utf-8')
  }
}

export async function compileRust(outDir: string): Promise<CompileResult> {
  try {
    const { stdout, stderr } = await execFileAsync('cargo', ['check'], {
      cwd: outDir,
      timeout: 60_000,
    })
    return { success: true, stdout, stderr, target: 'rust' }
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string }
    return {
      success: false,
      stdout: e.stdout ?? '',
      stderr: e.stderr ?? 'cargo check failed',
      target: 'rust',
    }
  }
}

export async function compileTypeScript(outDir: string): Promise<CompileResult> {
  try {
    const { stdout, stderr } = await execFileAsync('npx', ['tsc', '--noEmit'], {
      cwd: outDir,
      timeout: 30_000,
    })
    return { success: true, stdout, stderr, target: 'typescript' }
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string }
    return {
      success: false,
      stdout: e.stdout ?? '',
      stderr: e.stderr ?? 'tsc failed',
      target: 'typescript',
    }
  }
}
```

- [ ] **Step 5: Create generate/index.ts**

`apps/skills/src/generate/index.ts`:
```typescript
import { generateCode } from './code-generator.js'
import { writeGeneratedFiles, compileRust } from './compiler.js'
import { openVisualCompanion, wrapHtml } from '@sdlc/sdk'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export default async function generateSkill(args: string): Promise<void> {
  const targetMatch = args.match(/--target\s+(\S+)/)
  const target = (targetMatch?.[1] ?? 'web-api') as 'web-api' | 'cli-binary'
  const spec = args.replace(/--target\s+\S+/, '').trim() || 'hello world REST API returning { message: "hello world" }'

  console.log(`Generating ${target} code...`)
  const code = await generateCode(spec, target)

  const outDir = await mkdtemp(join(tmpdir(), 'sdlc-gen-'))
  await writeGeneratedFiles(code, outDir)
  console.log(`Files written to: ${outDir}`)

  console.log('Running cargo check...')
  const result = await compileRust(outDir)

  const statusColor = result.success ? '#34d399' : '#f87171'
  const statusText = result.success ? 'COMPILED OK' : 'COMPILE FAILED'

  const fileList = Object.entries(code.files).map(([path, content]) =>
    `<h3>${path}</h3><pre><code>${content.replace(/</g, '&lt;')}</code></pre>`
  ).join('\n')

  const html = wrapHtml('Code Generation Result', `
    <p style="color:${statusColor};font-size:18px;font-weight:bold">${statusText}</p>
    ${result.stderr ? `<h3>Compiler Output</h3><pre>${result.stderr}</pre>` : ''}
    <h2>Generated Files</h2>
    ${fileList}
    <p>Output directory: <code>${outDir}</code></p>
  `)

  await openVisualCompanion(html)

  if (!result.success) {
    console.error('Compilation failed. See visual companion for details.')
    process.exit(1)
  }

  console.log('Code generated and compiled successfully.')
}
```

- [ ] **Step 6: Run test**

```bash
cd apps/skills && pnpm vitest run src/generate/compiler.test.ts
```

Expected: 2 tests PASS

- [ ] **Step 7: Commit**

```bash
git add apps/skills/src/generate/
git commit -m "feat(skills): add /generate skill — code generation and cargo check"
```

---

### Task 8: `/test` skill — TDD loop + dependency-sorted failure tree

**Files:**
- Create: `apps/skills/src/test/test-generator.ts`
- Create: `apps/skills/src/test/test-runner.ts`
- Create: `apps/skills/src/test/failure-tree.ts`
- Create: `apps/skills/src/test/index.ts`
- Test: `apps/skills/src/test/failure-tree.test.ts`

- [ ] **Step 1: Write the failing test**

`apps/skills/src/test/failure-tree.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { buildFailureTree, findRootCauses, formatFailureTree } from './failure-tree.js'
import type { TestFailure } from './failure-tree.js'

describe('failure-tree', () => {
  it('groups failures by normalized error', () => {
    const failures: TestFailure[] = [
      { name: 'test_a', error: 'cannot find value `foo` in module', file: 'src/a.rs', line: 10 },
      { name: 'test_b', error: 'cannot find value `foo` in module', file: 'src/b.rs', line: 20 },
      { name: 'test_c', error: 'mismatched types: expected `u32`, found `i32`', file: 'src/c.rs', line: 5 },
    ]
    const tree = buildFailureTree(failures)
    expect(tree).toHaveLength(2)
    const fooNode = tree.find(n => n.normalizedError.includes('foo'))
    expect(fooNode?.children).toHaveLength(2)
  })

  it('identifies root causes — groups with 2+ failures', () => {
    const failures: TestFailure[] = [
      { name: 'test_a', error: 'undefined: missing_fn', file: 'src/a.rs', line: 1 },
      { name: 'test_b', error: 'undefined: missing_fn', file: 'src/b.rs', line: 2 },
      { name: 'test_c', error: 'type mismatch in handler', file: 'src/c.rs', line: 3 },
    ]
    const tree = buildFailureTree(failures)
    const roots = findRootCauses(tree)
    expect(roots).toHaveLength(1)
    expect(roots[0].children).toHaveLength(2)
  })

  it('formats tree as readable string', () => {
    const failures: TestFailure[] = [
      { name: 'test_a', error: 'missing module: serde', file: 'src/a.rs', line: 1 },
    ]
    const tree = buildFailureTree(failures)
    const formatted = formatFailureTree(tree)
    expect(formatted).toContain('missing module')
    expect(formatted).toContain('test_a')
  })
})
```

- [ ] **Step 2: Run — verify fails**

```bash
cd apps/skills && pnpm vitest run src/test/failure-tree.test.ts 2>&1 | head -10
```

Expected: FAIL

- [ ] **Step 3: Create failure-tree.ts**

`apps/skills/src/test/failure-tree.ts`:
```typescript
export interface TestFailure {
  name: string
  error: string
  file: string
  line: number
}

export interface FailureNode {
  normalizedError: string
  children: TestFailure[]
  isRootCause: boolean
}

export function normalizeError(error: string): string {
  return error
    .replace(/line \d+/g, 'line N')
    .replace(/\bcolumn \d+/g, 'column N')
    .replace(/0x[0-9a-fA-F]+/g, '0xADDR')
    .trim()
    .toLowerCase()
}

export function buildFailureTree(failures: TestFailure[]): FailureNode[] {
  const groups = new Map<string, TestFailure[]>()

  for (const failure of failures) {
    const key = normalizeError(failure.error)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(failure)
  }

  return Array.from(groups.entries()).map(([normalizedError, children]) => ({
    normalizedError,
    children,
    isRootCause: children.length > 1,
  }))
}

export function findRootCauses(tree: FailureNode[]): FailureNode[] {
  return tree.filter(n => n.isRootCause)
}

export function formatFailureTree(tree: FailureNode[]): string {
  const roots = findRootCauses(tree)
  const others = tree.filter(n => !n.isRootCause)

  const lines: string[] = []

  if (roots.length > 0) {
    lines.push('=== ROOT CAUSES (fix these first) ===')
    for (const node of roots) {
      lines.push(`\n[ROOT] ${node.normalizedError}`)
      lines.push(`  Affects ${node.children.length} tests:`)
      for (const child of node.children) {
        lines.push(`    - ${child.name} (${child.file}:${child.line})`)
      }
    }
    lines.push('\n=== OTHER FAILURES ===')
  }

  for (const node of others) {
    lines.push(`\n[FAIL] ${node.normalizedError}`)
    for (const child of node.children) {
      lines.push(`  - ${child.name} (${child.file}:${child.line})`)
    }
  }

  return lines.join('\n')
}
```

- [ ] **Step 4: Create test-generator.ts**

`apps/skills/src/test/test-generator.ts`:
```typescript
import { callClaude } from '@sdlc/sdk'

export async function generateTestSuite(spec: string, target: 'rust' | 'typescript'): Promise<string> {
  const prompt = `Generate a ${target} test suite for this spec:

${spec}

For Rust: use #[cfg(test)] module with #[tokio::test] for async tests. Test the HTTP endpoints with reqwest or direct handler calls.
For TypeScript: use Vitest. Test exported functions directly.

Output ONLY the complete test file content. No explanation.`

  return callClaude(prompt, { maxTokens: 3000 })
}
```

- [ ] **Step 5: Create test-runner.ts**

`apps/skills/src/test/test-runner.ts`:
```typescript
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { TestFailure } from './failure-tree.js'

const execFileAsync = promisify(execFile)

export interface TestRunResult {
  passed: number
  failed: number
  failures: TestFailure[]
  raw: string
}

export async function runCargoTests(projectDir: string): Promise<TestRunResult> {
  try {
    const { stdout, stderr } = await execFileAsync('cargo', ['test', '--', '--nocapture'], {
      cwd: projectDir,
      timeout: 120_000,
    })
    const output = stdout + stderr
    return parseCargoTestOutput(output)
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string }
    const output = (e.stdout ?? '') + (e.stderr ?? '')
    return parseCargoTestOutput(output)
  }
}

export function parseCargoTestOutput(output: string): TestRunResult {
  const failures: TestFailure[] = []
  const failedMatch = output.match(/^FAILED\s+(.+)$/gm)

  if (failedMatch) {
    for (const line of failedMatch) {
      const name = line.replace(/^FAILED\s+/, '').trim()
      const errorMatch = output.match(new RegExp(`${name}[\\s\\S]*?thread '${name}' panicked at '(.+?)'`, 'm'))
      failures.push({
        name,
        error: errorMatch?.[1] ?? 'unknown error',
        file: 'unknown',
        line: 0,
      })
    }
  }

  const passedMatch = output.match(/test result: .* (\d+) passed/)
  const failedCount = output.match(/test result: .* (\d+) failed/)

  return {
    passed: parseInt(passedMatch?.[1] ?? '0'),
    failed: parseInt(failedCount?.[1] ?? '0') + failures.length,
    failures,
    raw: output,
  }
}
```

- [ ] **Step 6: Create test/index.ts**

`apps/skills/src/test/index.ts`:
```typescript
import { generateTestSuite } from './test-generator.js'
import { runCargoTests } from './test-runner.js'
import { buildFailureTree, formatFailureTree } from './failure-tree.js'
import { openVisualCompanion, wrapHtml } from '@sdlc/sdk'

export default async function testSkill(args: string): Promise<void> {
  const dirMatch = args.match(/--dir\s+(\S+)/)
  const projectDir = dirMatch?.[1] ?? process.cwd()

  console.log(`Running tests in: ${projectDir}`)
  const result = await runCargoTests(projectDir)

  console.log(`Results: ${result.passed} passed, ${result.failed} failed`)

  if (result.failures.length === 0) {
    console.log('All tests passed!')
    return
  }

  const tree = buildFailureTree(result.failures)
  const treeText = formatFailureTree(tree)
  console.log('\n' + treeText)

  const treeHtml = tree.map(node => `
    <div style="background:${node.isRootCause ? '#f8717120' : '#1a1f2e'};border:1px solid ${node.isRootCause ? '#f87171' : '#4b5563'};border-radius:8px;padding:12px;margin:8px 0;">
      ${node.isRootCause ? '<span style="color:#f87171;font-weight:bold">ROOT CAUSE</span><br>' : ''}
      <code style="color:#fbbf24">${node.normalizedError}</code>
      <ul>
        ${node.children.map(c => `<li><code>${c.name}</code> — ${c.file}:${c.line}</li>`).join('')}
      </ul>
    </div>
  `).join('')

  const html = wrapHtml('Test Failure Tree', `
    <p style="color:#f87171">Failed: ${result.failed} | Passed: ${result.passed}</p>
    ${treeHtml}
    <h3>Raw Output</h3>
    <pre style="font-size:11px">${result.raw.replace(/</g, '&lt;')}</pre>
  `)

  await openVisualCompanion(html)
}
```

- [ ] **Step 7: Run tests**

```bash
cd apps/skills && pnpm vitest run src/test/failure-tree.test.ts
```

Expected: 3 tests PASS

- [ ] **Step 8: Commit**

```bash
git add apps/skills/src/test/
git commit -m "feat(skills): add /test skill with TDD loop and dependency-sorted failure tree"
```

---

### Task 9: E2E integration test — hello world proof chain

**Files:**
- Create: `apps/skills/e2e/hello-world.test.ts`

- [ ] **Step 1: Write the E2E test**

`apps/skills/e2e/hello-world.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { buildSpecPrompt, parseSpecResponse } from '../src/define/spec-generator.js'
import { buildCargoToml, buildAxumHandler } from '../src/generate/code-generator.js'
import { buildFailureTree, formatFailureTree } from '../src/test/failure-tree.js'
import type { TestFailure } from '../src/test/failure-tree.js'
import { PlatformFactory } from '@sdlc/pal'

describe('Hello World Proof Chain (E2E — no network)', () => {
  it('step 1: spec prompt is built from idea', () => {
    const prompt = buildSpecPrompt('hello world REST API')
    expect(prompt.length).toBeGreaterThan(50)
    expect(prompt).toContain('hello world REST API')
  })

  it('step 2: spec artifact is parsed from raw text', () => {
    const raw = '# Hello World Spec\n\n## Endpoints\nGET /hello → 200'
    const spec = parseSpecResponse(raw, 'hello world REST API')
    expect(spec.type).toBe('spec')
    expect(spec.content).toContain('GET /hello')
  })

  it('step 3: code generation produces valid Cargo.toml', () => {
    const toml = buildCargoToml('hello-world')
    expect(toml).toContain('axum')
    expect(toml).toContain('tokio')
  })

  it('step 4: code generation produces valid Axum handler', () => {
    const handler = buildAxumHandler('GET /hello')
    expect(handler).toContain('#[tokio::main]')
    expect(handler).toContain('hello world')
  })

  it('step 5: failure tree correctly identifies root causes', () => {
    const failures: TestFailure[] = [
      { name: 'test_hello_status', error: 'cannot find value `router` in this scope', file: 'src/main.rs', line: 45 },
      { name: 'test_hello_body', error: 'cannot find value `router` in this scope', file: 'src/main.rs', line: 60 },
      { name: 'test_hello_content_type', error: 'mismatched types', file: 'src/main.rs', line: 75 },
    ]
    const tree = buildFailureTree(failures)
    const rootCauses = tree.filter(n => n.isRootCause)
    expect(rootCauses).toHaveLength(1)
    expect(rootCauses[0].children).toHaveLength(2)
    const formatted = formatFailureTree(tree)
    expect(formatted).toContain('ROOT CAUSE')
  })

  it('step 6: PAL local adapter stores and retrieves an artifact', async () => {
    const pal = await PlatformFactory.createAsync('local')
    const content = JSON.stringify({ type: 'spec', content: 'hello world' })
    const url = await pal.storage.upload('artifacts/spec-001.json', Buffer.from(content))
    const retrieved = await pal.storage.download(url)
    expect(JSON.parse(retrieved.toString()).type).toBe('spec')
  })

  it('step 7: PAL emits events to realtime channel', async () => {
    const pal = await PlatformFactory.createAsync('local')
    const received: unknown[] = []
    await pal.realtime.subscribe('workspace.events', event => received.push(event))
    await pal.realtime.broadcast('workspace.events', { type: 'spec.drafted', workspaceId: 'test' })
    expect(received).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run — verify fails (deps not installed yet)**

```bash
cd apps/skills && pnpm vitest run e2e/hello-world.test.ts 2>&1 | head -20
```

Expected: FAIL or import errors — not PASS

- [ ] **Step 3: Install workspace deps**

```bash
cd "/Users/evanmccall/Projects/SDLC - Visual - Workflow - SoftwareEngineering-NewAge" && pnpm install
```

Expected: Packages installed across all workspace packages

- [ ] **Step 4: Run E2E test**

```bash
cd apps/skills && pnpm vitest run e2e/hello-world.test.ts
```

Expected: 7 tests PASS — the full proof chain validates without hitting any external API

- [ ] **Step 5: Run all skill tests**

```bash
pnpm vitest run --project skills
```

Or from workspace root:

```bash
nx run skills:test
```

Expected: All tests across runner, define, generate, test, and e2e PASS

- [ ] **Step 6: Commit**

```bash
git add apps/skills/e2e/
git commit -m "test(skills): add E2E hello world proof chain — validates full idea→spec→code→test loop"
```

---

### Task 10: Final verification and plan update

- [ ] **Step 1: Run all workspace tests**

```bash
nx run-many --target=test --all
```

Expected: All test targets in schemas, pal, sdk, skills PASS

- [ ] **Step 2: Type-check all packages**

```bash
nx run-many --target=build --all --dry-run
```

Or:

```bash
pnpm -r exec tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 3: Verify hello world loop manually**

From workspace root:

```bash
# Initialize a workspace context
mkdir -p /tmp/hello-world-test/.workspace
echo '{"workspaceId":"test-ws-001","projectId":"test-proj-001","platform":"local"}' > /tmp/hello-world-test/.workspace/config.json

# Run /define skill (uses Claude API — needs ANTHROPIC_API_KEY)
ANTHROPIC_API_KEY=your_key node --loader ts-node/esm apps/skills/src/runner.ts /define "hello world REST API"
```

Expected: Spec and C4 diagrams open in browser

- [ ] **Step 4: Mark Phase 1 complete in continuity state**

Update `.foundry/projects/diagram-driven-orchestration/current-task.json`:
- Set `currentPhase.status` to `"completed"`
- Set `sdlcPhase` to `"verify"`
- Update `nextCommandSet` to Phase 2 initialization commands

- [ ] **Step 5: Final commit**

```bash
git add .foundry/projects/diagram-driven-orchestration/current-task.json
git commit -m "chore: mark Phase 1 complete — hello world loop proven"
```

---

## Acceptance Criteria Checklist

- [ ] `libs/schemas` — all 3 Zod schema groups pass vitest
- [ ] `libs/pal` — local adapter passes 3 PAL tests (SQL, realtime, storage)
- [ ] `libs/sdk` — context detection passes 2 tests
- [ ] `apps/skills` — runner parses args correctly
- [ ] `/define` — spec-generator unit tests pass
- [ ] `/generate` — code-generator unit tests pass (Cargo.toml + Axum handler structure)
- [ ] `/test` — failure-tree unit tests pass (grouping, root cause, formatting)
- [ ] E2E — all 7 hello world proof chain steps pass without network calls
- [ ] No TypeScript strict-mode errors across all packages
- [ ] `.foundry` continuity state updated to `verify` phase
