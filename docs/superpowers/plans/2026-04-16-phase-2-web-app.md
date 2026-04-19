---

# Phase 2 — Next.js 14 Web Application Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the collaborative web application with God View dashboard, artifact inspector, approval queue, confidence panel, and real-time updates via WebSocket — all reading from the PAL database layer.

**Architecture:** Next.js 14 App Router with React Server Components. Realtime via AWS API Gateway WebSockets (local: EventEmitter adapter). All data through PAL. Auth via Amazon Cognito (local: stub). shadcn/ui + Tailwind for UI.

**Tech Stack:** Next.js 14, React 18, TypeScript 5, Tailwind CSS, shadcn/ui, Zod, @sdlc/schemas, @sdlc/pal, @sdlc/sdk, Vitest, Playwright (E2E)

---

## File Map

```
apps/web/
  app/
    layout.tsx               — root layout, WebSocket provider
    page.tsx                 — God View dashboard
    workspace/
      [id]/
        page.tsx             — Project workspace view
        artifacts/
          [artifactId]/
            page.tsx         — Artifact inspector
    runbooks/
      page.tsx               — Runbook list
      [id]/
        page.tsx             — Runbook builder/executor
    approvals/
      page.tsx               — Approval queue
    confidence/
      page.tsx               — Confidence panel
    api/
      events/
        route.ts             — WebSocket upgrade endpoint
      workspaces/
        route.ts             — GET/POST workspaces
      artifacts/
        route.ts             — GET/POST artifacts
      approvals/
        [gateId]/
          route.ts           — POST approval decision
  components/
    providers/
      workspace-provider.tsx — Workspace context + WebSocket subscription
      realtime-provider.tsx  — WebSocket client + event dispatch
    ui/
      artifact-card.tsx      — Artifact list item
      approval-card.tsx      — Single approval gate card
      confidence-badge.tsx   — Score + threshold indicator
      failure-tree-view.tsx  — Interactive test failure tree
    dashboard/
      god-view.tsx           — Dashboard overview panel
      project-card.tsx       — Project status card
      activity-feed.tsx      — Live event feed
    workspace/
      artifact-list.tsx      — Filterable artifact grid
      task-board.tsx         — Kanban task board
  lib/
    pal.ts                   — PAL singleton for server components
    events.ts                — Event type helpers
    realtime.ts              — WebSocket client hook
  hooks/
    use-workspace.ts         — SWR hook for workspace data
    use-realtime.ts          — WebSocket event subscription hook
    use-approvals.ts         — Approval queue hook
    use-confidence.ts        — Confidence score hook
  package.json
  tsconfig.json
  project.json
  next.config.mjs
  tailwind.config.ts
```

---

### Task 1: Initialize apps/web — Next.js 14 + Tailwind + shadcn

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/next.config.mjs`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/project.json`

- [ ] **Step 1: Write the failing test (type-check gate)**

Create `apps/web/app/page.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'

describe('web app bootstrap', () => {
  it('placeholder — passes when web app files exist', () => {
    expect(true).toBe(true)
  })
})
```

- [ ] **Step 2: Run — verify fails**

```bash
cd apps/web && pnpm vitest run app/page.test.tsx 2>&1 | head -10
```

Expected: FAIL — Cannot find module or no vitest config

- [ ] **Step 3: Create package.json**

`apps/web/package.json`:
```json
{
  "name": "@sdlc/web",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@sdlc/schemas": "workspace:*",
    "@sdlc/pal": "workspace:*",
    "@sdlc/sdk": "workspace:*",
    "next": "14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "swr": "^2.2.5",
    "zod": "^3.23.8",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "@types/node": "^24.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.9.3",
    "vitest": "^2.0.0",
    "@vitejs/plugin-react": "^4.3.0"
  }
}
```

- [ ] **Step 4: Create tsconfig.json**

`apps/web/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",
    "incremental": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: Create next.config.mjs**

`apps/web/next.config.mjs`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@sdlc/schemas', '@sdlc/pal', '@sdlc/sdk'],
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
}

export default nextConfig
```

- [ ] **Step 6: Create tailwind.config.ts**

`apps/web/tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0f1320',
          surface: '#1a1f2e',
          border: '#4b5563',
          accent: '#7c8cf8',
          green: '#34d399',
          red: '#f87171',
          amber: '#f59e0b',
          muted: '#94a3b8',
        },
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 7: Create project.json**

`apps/web/project.json`:
```json
{
  "name": "web",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/web",
  "projectType": "application",
  "targets": {
    "build": { "executor": "@nx/next:build", "outputs": ["{options.outputPath}"], "options": { "outputPath": "dist/apps/web" } },
    "serve": { "executor": "@nx/next:server", "options": { "buildTarget": "web:build", "dev": true } },
    "test": { "executor": "@nx/vite:test" },
    "typecheck": { "executor": "nx:run-commands", "options": { "command": "tsc --noEmit", "cwd": "apps/web" } }
  }
}
```

- [ ] **Step 8: Install and run bootstrap test**

```bash
cd apps/web && pnpm install && pnpm vitest run app/page.test.tsx
```

Expected: 1 test PASS

- [ ] **Step 9: Commit**

```bash
git add apps/web/
git commit -m "feat(web): initialize Next.js 14 web app with Tailwind and Nx project"
```

---

### Task 2: PAL singleton + API route foundation

**Files:**
- Create: `apps/web/lib/pal.ts`
- Create: `apps/web/lib/events.ts`
- Create: `apps/web/app/api/workspaces/route.ts`
- Create: `apps/web/app/api/artifacts/route.ts`
- Test: `apps/web/lib/pal.test.ts`

- [ ] **Step 1: Write the failing test**

`apps/web/lib/pal.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { getPalServer, initDb } from './pal.js'

describe('PAL server singleton', () => {
  it('returns a pal instance on local platform', async () => {
    process.env.PLATFORM = 'local'
    const pal = await getPalServer()
    expect(pal.db).toBeDefined()
    expect(pal.realtime).toBeDefined()
  })

  it('can initialize DB schema', async () => {
    process.env.PLATFORM = 'local'
    const pal = await getPalServer()
    await initDb(pal)
    const rows = await pal.db.query('SELECT name FROM sqlite_master WHERE type="table"', [])
    const tableNames = rows.map((r: any) => r.name)
    expect(tableNames).toContain('workspaces')
    expect(tableNames).toContain('artifacts')
    expect(tableNames).toContain('events')
  })
})
```

- [ ] **Step 2: Run — verify fails**

```bash
cd apps/web && pnpm vitest run lib/pal.test.ts 2>&1 | head -10
```

Expected: FAIL

- [ ] **Step 3: Create lib/pal.ts**

`apps/web/lib/pal.ts`:
```typescript
import { PlatformFactory } from '@sdlc/pal'
import type { PlatformAdapter, Platform } from '@sdlc/pal'

let _pal: PlatformAdapter | null = null

export async function getPalServer(): Promise<PlatformAdapter> {
  if (_pal) return _pal
  const platform = (process.env.PLATFORM ?? 'local') as Platform
  _pal = PlatformFactory.create(platform)
  return _pal
}

export async function initDb(pal: PlatformAdapter): Promise<void> {
  await pal.db.execute(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `, [])

  await pal.db.execute(`
    CREATE TABLE IF NOT EXISTS artifacts (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      project_id TEXT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      version INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `, [])

  await pal.db.execute(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      type TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      actor_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      conf_delta REAL
    )
  `, [])

  await pal.db.execute(`
    CREATE TABLE IF NOT EXISTS approval_gates (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      run_id TEXT NOT NULL,
      gate_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      assignee_ids TEXT NOT NULL DEFAULT '[]',
      opened_at TEXT NOT NULL,
      closed_at TEXT
    )
  `, [])

  await pal.db.execute(`
    CREATE TABLE IF NOT EXISTS confidence_scores (
      workspace_id TEXT NOT NULL,
      gate_type TEXT NOT NULL,
      score REAL NOT NULL DEFAULT 0.0,
      threshold REAL NOT NULL DEFAULT 0.85,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (workspace_id, gate_type)
    )
  `, [])
}
```

- [ ] **Step 4: Create lib/events.ts**

`apps/web/lib/events.ts`:
```typescript
import { EventType } from '@sdlc/schemas'
import type { WorkspaceEvent } from '@sdlc/schemas'
import { randomUUID } from 'node:crypto'

export function makeEvent(
  type: EventType,
  workspaceId: string,
  actorId: string,
  payload: Record<string, unknown>,
  actorType: 'user' | 'agent' = 'user',
): WorkspaceEvent {
  return {
    id: randomUUID(),
    workspaceId,
    type,
    actorId,
    actorType,
    payload,
    timestamp: new Date().toISOString(),
  }
}
```

- [ ] **Step 5: Create workspaces API route**

`apps/web/app/api/workspaces/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getPalServer, initDb } from '@/lib/pal'
import { randomUUID } from 'node:crypto'
import { WorkspaceSchema } from '@sdlc/schemas'

export async function GET() {
  const pal = await getPalServer()
  await initDb(pal)
  const rows = await pal.db.query('SELECT * FROM workspaces ORDER BY created_at DESC', [])
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const pal = await getPalServer()
  await initDb(pal)

  const workspace = WorkspaceSchema.parse({
    id: randomUUID(),
    name: body.name,
    ownerId: body.ownerId ?? 'system',
    createdAt: new Date().toISOString(),
  })

  await pal.db.execute(
    'INSERT INTO workspaces (id, name, owner_id, created_at) VALUES (?, ?, ?, ?)',
    [workspace.id, workspace.name, workspace.ownerId, workspace.createdAt]
  )

  return NextResponse.json(workspace, { status: 201 })
}
```

- [ ] **Step 6: Create artifacts API route**

`apps/web/app/api/artifacts/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getPalServer, initDb } from '@/lib/pal'
import { randomUUID } from 'node:crypto'

export async function GET(req: NextRequest) {
  const workspaceId = req.nextUrl.searchParams.get('workspaceId')
  const pal = await getPalServer()
  await initDb(pal)

  const rows = workspaceId
    ? await pal.db.query('SELECT * FROM artifacts WHERE workspace_id = ? ORDER BY updated_at DESC', [workspaceId])
    : await pal.db.query('SELECT * FROM artifacts ORDER BY updated_at DESC', [])

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const pal = await getPalServer()
  await initDb(pal)

  const now = new Date().toISOString()
  const artifact = {
    id: randomUUID(),
    workspace_id: body.workspaceId,
    project_id: body.projectId ?? null,
    type: body.type,
    title: body.title,
    content: body.content ?? null,
    version: 1,
    created_at: now,
    updated_at: now,
  }

  await pal.db.execute(
    'INSERT INTO artifacts (id, workspace_id, project_id, type, title, content, version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [artifact.id, artifact.workspace_id, artifact.project_id, artifact.type, artifact.title, artifact.content, artifact.version, artifact.created_at, artifact.updated_at]
  )

  return NextResponse.json(artifact, { status: 201 })
}
```

- [ ] **Step 7: Run PAL tests**

```bash
cd apps/web && pnpm vitest run lib/pal.test.ts
```

Expected: 2 tests PASS

- [ ] **Step 8: Commit**

```bash
git add apps/web/lib/ apps/web/app/api/
git commit -m "feat(web): add PAL server singleton, DB schema init, and workspace/artifact API routes"
```

---

### Task 3: Realtime provider — WebSocket client hook

**Files:**
- Create: `apps/web/lib/realtime.ts`
- Create: `apps/web/hooks/use-realtime.ts`
- Create: `apps/web/components/providers/realtime-provider.tsx`
- Test: `apps/web/hooks/use-realtime.test.ts`

- [ ] **Step 1: Write the failing test**

`apps/web/hooks/use-realtime.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { parseWebSocketMessage, buildSubscribeMessage } from '../lib/realtime.js'

describe('realtime utilities', () => {
  it('parses a valid workspace event message', () => {
    const raw = JSON.stringify({
      type: 'spec.drafted',
      workspaceId: 'ws-001',
      payload: { artifactId: 'art-001' },
    })
    const msg = parseWebSocketMessage(raw)
    expect(msg?.type).toBe('spec.drafted')
    expect(msg?.workspaceId).toBe('ws-001')
  })

  it('returns null for invalid JSON', () => {
    const msg = parseWebSocketMessage('not json')
    expect(msg).toBeNull()
  })

  it('builds a subscribe message for a workspace', () => {
    const msg = buildSubscribeMessage('ws-001')
    const parsed = JSON.parse(msg)
    expect(parsed.action).toBe('subscribe')
    expect(parsed.workspaceId).toBe('ws-001')
  })
})
```

- [ ] **Step 2: Run — verify fails**

```bash
cd apps/web && pnpm vitest run hooks/use-realtime.test.ts 2>&1 | head -10
```

Expected: FAIL

- [ ] **Step 3: Create lib/realtime.ts**

`apps/web/lib/realtime.ts`:
```typescript
export interface RealtimeMessage {
  type: string
  workspaceId: string
  payload: Record<string, unknown>
}

export function parseWebSocketMessage(raw: string): RealtimeMessage | null {
  try {
    const parsed = JSON.parse(raw)
    if (!parsed.type || !parsed.workspaceId) return null
    return {
      type: parsed.type,
      workspaceId: parsed.workspaceId,
      payload: parsed.payload ?? {},
    }
  } catch {
    return null
  }
}

export function buildSubscribeMessage(workspaceId: string): string {
  return JSON.stringify({ action: 'subscribe', workspaceId })
}

export function buildUnsubscribeMessage(workspaceId: string): string {
  return JSON.stringify({ action: 'unsubscribe', workspaceId })
}

export function getWebSocketUrl(): string {
  if (typeof window === 'undefined') return ''
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return process.env.NEXT_PUBLIC_WS_URL ?? `${proto}//${window.location.host}/api/events`
}
```

- [ ] **Step 4: Create hooks/use-realtime.ts**

`apps/web/hooks/use-realtime.ts`:
```typescript
'use client'

import { useEffect, useRef, useCallback } from 'react'
import { parseWebSocketMessage, buildSubscribeMessage, buildUnsubscribeMessage, getWebSocketUrl } from '@/lib/realtime'
import type { RealtimeMessage } from '@/lib/realtime'

type MessageHandler = (msg: RealtimeMessage) => void

export function useRealtime(workspaceId: string | null, onMessage: MessageHandler) {
  const ws = useRef<WebSocket | null>(null)
  const handlerRef = useRef(onMessage)
  handlerRef.current = onMessage

  useEffect(() => {
    if (!workspaceId) return

    const url = getWebSocketUrl()
    if (!url) return

    const socket = new WebSocket(url)
    ws.current = socket

    socket.onopen = () => {
      socket.send(buildSubscribeMessage(workspaceId))
    }

    socket.onmessage = (event) => {
      const msg = parseWebSocketMessage(event.data)
      if (msg && msg.workspaceId === workspaceId) {
        handlerRef.current(msg)
      }
    }

    socket.onerror = (err) => {
      console.warn('WebSocket error:', err)
    }

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(buildUnsubscribeMessage(workspaceId))
      }
      socket.close()
    }
  }, [workspaceId])
}
```

- [ ] **Step 5: Create realtime provider**

`apps/web/components/providers/realtime-provider.tsx`:
```typescript
'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import type { RealtimeMessage } from '@/lib/realtime'

interface RealtimeContextValue {
  lastMessage: RealtimeMessage | null
  workspaceId: string | null
}

const RealtimeContext = createContext<RealtimeContextValue>({
  lastMessage: null,
  workspaceId: null,
})

export function RealtimeProvider({
  workspaceId,
  children,
}: {
  workspaceId: string | null
  children: ReactNode
}) {
  const [lastMessage, setLastMessage] = useState<RealtimeMessage | null>(null)

  const handleMessage = useCallback((msg: RealtimeMessage) => {
    setLastMessage(msg)
  }, [])

  useRealtime(workspaceId, handleMessage)

  return (
    <RealtimeContext.Provider value={{ lastMessage, workspaceId }}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtimeContext() {
  return useContext(RealtimeContext)
}
```

- [ ] **Step 6: Run tests**

```bash
cd apps/web && pnpm vitest run hooks/use-realtime.test.ts
```

Expected: 3 tests PASS

- [ ] **Step 7: Commit**

```bash
git add apps/web/lib/realtime.ts apps/web/hooks/use-realtime.ts apps/web/components/providers/realtime-provider.tsx
git commit -m "feat(web): add WebSocket realtime provider and message parsing utilities"
```

---

### Task 4: SWR data hooks — workspaces, approvals, confidence

**Files:**
- Create: `apps/web/hooks/use-workspace.ts`
- Create: `apps/web/hooks/use-approvals.ts`
- Create: `apps/web/hooks/use-confidence.ts`
- Test: `apps/web/hooks/use-workspace.test.ts`

- [ ] **Step 1: Write the failing test**

`apps/web/hooks/use-workspace.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { buildWorkspaceUrl, buildArtifactsUrl } from './use-workspace.js'

describe('workspace URL builders', () => {
  it('builds workspace API URL', () => {
    const url = buildWorkspaceUrl('ws-001')
    expect(url).toBe('/api/workspaces/ws-001')
  })

  it('builds artifacts URL with workspace filter', () => {
    const url = buildArtifactsUrl('ws-001')
    expect(url).toBe('/api/artifacts?workspaceId=ws-001')
  })

  it('builds artifacts URL without filter', () => {
    const url = buildArtifactsUrl()
    expect(url).toBe('/api/artifacts')
  })
})
```

- [ ] **Step 2: Run — verify fails**

```bash
cd apps/web && pnpm vitest run hooks/use-workspace.test.ts 2>&1 | head -10
```

Expected: FAIL

- [ ] **Step 3: Create hooks/use-workspace.ts**

`apps/web/hooks/use-workspace.ts`:
```typescript
'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function buildWorkspaceUrl(id: string) {
  return `/api/workspaces/${id}`
}

export function buildArtifactsUrl(workspaceId?: string) {
  return workspaceId ? `/api/artifacts?workspaceId=${workspaceId}` : '/api/artifacts'
}

export function useWorkspace(id: string | null) {
  const { data, error, mutate } = useSWR(
    id ? buildWorkspaceUrl(id) : null,
    fetcher,
    { refreshInterval: 0 }
  )
  return { workspace: data, error, refresh: mutate }
}

export function useArtifacts(workspaceId: string | null) {
  const { data, error, mutate } = useSWR(
    buildArtifactsUrl(workspaceId ?? undefined),
    fetcher,
    { refreshInterval: 5000 }
  )
  return { artifacts: data ?? [], error, refresh: mutate }
}

export function useWorkspaceList() {
  const { data, error, mutate } = useSWR('/api/workspaces', fetcher, {
    refreshInterval: 30_000,
  })
  return { workspaces: data ?? [], error, refresh: mutate }
}
```

- [ ] **Step 4: Create hooks/use-approvals.ts**

`apps/web/hooks/use-approvals.ts`:
```typescript
'use client'

import useSWR from 'swr'
import { useCallback } from 'react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useApprovals(workspaceId: string | null) {
  const { data, error, mutate } = useSWR(
    workspaceId ? `/api/approvals?workspaceId=${workspaceId}&status=open` : null,
    fetcher,
    { refreshInterval: 10_000 }
  )

  const decide = useCallback(async (gateId: string, decision: 'approved' | 'rejected') => {
    await fetch(`/api/approvals/${gateId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    })
    await mutate()
  }, [mutate])

  return { gates: data ?? [], error, decide, refresh: mutate }
}
```

- [ ] **Step 5: Create hooks/use-confidence.ts**

`apps/web/hooks/use-confidence.ts`:
```typescript
'use client'

import useSWR from 'swr'
import { useCallback } from 'react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useConfidence(workspaceId: string | null) {
  const { data, error, mutate } = useSWR(
    workspaceId ? `/api/confidence?workspaceId=${workspaceId}` : null,
    fetcher,
    { refreshInterval: 15_000 }
  )
  return { scores: data ?? [], error, refresh: mutate }
}
```

- [ ] **Step 6: Run tests**

```bash
cd apps/web && pnpm vitest run hooks/use-workspace.test.ts
```

Expected: 3 tests PASS

- [ ] **Step 7: Commit**

```bash
git add apps/web/hooks/
git commit -m "feat(web): add SWR data hooks for workspaces, artifacts, approvals, and confidence"
```

---

### Task 5: UI components — artifact card, approval card, confidence badge

**Files:**
- Create: `apps/web/components/ui/artifact-card.tsx`
- Create: `apps/web/components/ui/approval-card.tsx`
- Create: `apps/web/components/ui/confidence-badge.tsx`
- Create: `apps/web/components/ui/failure-tree-view.tsx`
- Test: `apps/web/components/ui/confidence-badge.test.tsx`

- [ ] **Step 1: Write the failing test**

`apps/web/components/ui/confidence-badge.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { getConfidenceColor, getConfidenceLabel } from './confidence-badge.js'

describe('confidence-badge utilities', () => {
  it('returns green color above threshold', () => {
    expect(getConfidenceColor(0.9, 0.85)).toBe('#34d399')
  })

  it('returns amber color near threshold', () => {
    expect(getConfidenceColor(0.75, 0.85)).toBe('#f59e0b')
  })

  it('returns red color far below threshold', () => {
    expect(getConfidenceColor(0.3, 0.85)).toBe('#f87171')
  })

  it('formats score as percentage', () => {
    expect(getConfidenceLabel(0.873)).toBe('87.3%')
  })
})
```

- [ ] **Step 2: Run — verify fails**

```bash
cd apps/web && pnpm vitest run components/ui/confidence-badge.test.tsx 2>&1 | head -10
```

Expected: FAIL

- [ ] **Step 3: Create confidence-badge.tsx**

`apps/web/components/ui/confidence-badge.tsx`:
```typescript
export function getConfidenceColor(score: number, threshold: number): string {
  if (score >= threshold) return '#34d399'
  if (score >= threshold * 0.85) return '#f59e0b'
  return '#f87171'
}

export function getConfidenceLabel(score: number): string {
  return `${(score * 100).toFixed(1)}%`
}

interface ConfidenceBadgeProps {
  score: number
  threshold?: number
  gateType: string
}

export function ConfidenceBadge({ score, threshold = 0.85, gateType }: ConfidenceBadgeProps) {
  const color = getConfidenceColor(score, threshold)
  const label = getConfidenceLabel(score)
  const autoApprove = score >= threshold

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: '#1a1f2e',
        border: `1px solid ${color}`,
        borderRadius: '8px',
        padding: '6px 12px',
      }}
    >
      <span style={{ color, fontWeight: 700, fontSize: '14px' }}>{label}</span>
      <span style={{ color: '#94a3b8', fontSize: '11px' }}>{gateType}</span>
      {autoApprove && (
        <span style={{ color: '#34d399', fontSize: '10px', fontWeight: 600 }}>AUTO</span>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create artifact-card.tsx**

`apps/web/components/ui/artifact-card.tsx`:
```typescript
interface ArtifactCardProps {
  id: string
  title: string
  type: string
  updatedAt: string
  workspaceId: string
}

const TYPE_COLORS: Record<string, string> = {
  spec: '#7c8cf8',
  diagram: '#34d399',
  code: '#f59e0b',
  schema: '#a78bfa',
  runbook: '#38bdf8',
  evidence: '#94a3b8',
  template: '#f87171',
}

export function ArtifactCard({ id, title, type, updatedAt, workspaceId }: ArtifactCardProps) {
  const color = TYPE_COLORS[type] ?? '#94a3b8'

  return (
    <div
      style={{
        background: '#1a1f2e',
        border: `1px solid #4b5563`,
        borderLeft: `3px solid ${color}`,
        borderRadius: '8px',
        padding: '12px 16px',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '14px' }}>{title}</span>
        <span style={{ color, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>{type}</span>
      </div>
      <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>
        Updated {new Date(updatedAt).toLocaleDateString()}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create approval-card.tsx**

`apps/web/components/ui/approval-card.tsx`:
```typescript
interface ApprovalCardProps {
  gateId: string
  gateType: string
  runId: string
  confidenceScore: number
  threshold: number
  onDecide: (gateId: string, decision: 'approved' | 'rejected') => Promise<void>
}

export function ApprovalCard({ gateId, gateType, runId, confidenceScore, threshold, onDecide }: ApprovalCardProps) {
  const autoApprove = confidenceScore >= threshold

  return (
    <div
      style={{
        background: '#1a1f2e',
        border: '1px solid #4b5563',
        borderRadius: '10px',
        padding: '16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{gateType}</span>
          <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '8px' }}>run: {runId.slice(0, 8)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: confidenceScore >= threshold ? '#34d399' : '#f59e0b', fontSize: '12px' }}>
            {(confidenceScore * 100).toFixed(1)}% confidence
          </span>
          {autoApprove && (
            <span style={{ background: '#34d39920', color: '#34d399', fontSize: '10px', padding: '2px 8px', borderRadius: '4px' }}>
              AUTO-APPROVE ELIGIBLE
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button
          onClick={() => onDecide(gateId, 'approved')}
          style={{ flex: 1, background: '#34d39920', border: '1px solid #34d399', color: '#34d399', borderRadius: '6px', padding: '8px', cursor: 'pointer', fontWeight: 600 }}
        >
          Approve
        </button>
        <button
          onClick={() => onDecide(gateId, 'rejected')}
          style={{ flex: 1, background: '#f8717120', border: '1px solid #f87171', color: '#f87171', borderRadius: '6px', padding: '8px', cursor: 'pointer', fontWeight: 600 }}
        >
          Reject
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create failure-tree-view.tsx**

`apps/web/components/ui/failure-tree-view.tsx`:
```typescript
import type { FailureNode } from '@sdlc/skills/src/test/failure-tree.js'

interface FailureTreeViewProps {
  tree: FailureNode[]
}

export function FailureTreeView({ tree }: FailureTreeViewProps) {
  const roots = tree.filter(n => n.isRootCause)
  const others = tree.filter(n => !n.isRootCause)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {roots.length > 0 && (
        <>
          <h3 style={{ color: '#f87171', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', margin: 0 }}>
            ROOT CAUSES — FIX THESE FIRST
          </h3>
          {roots.map((node, i) => (
            <div key={i} style={{ background: '#f8717115', border: '1px solid #f87171', borderRadius: '8px', padding: '12px' }}>
              <code style={{ color: '#fbbf24', fontSize: '12px' }}>{node.normalizedError}</code>
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {node.children.map((c, j) => (
                  <div key={j} style={{ color: '#94a3b8', fontSize: '11px' }}>
                    <code style={{ color: '#e2e8f0' }}>{c.name}</code> — {c.file}:{c.line}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
      {others.length > 0 && (
        <>
          <h3 style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', margin: 0, marginTop: roots.length > 0 ? '8px' : 0 }}>
            OTHER FAILURES
          </h3>
          {others.map((node, i) => (
            <div key={i} style={{ background: '#1a1f2e', border: '1px solid #4b5563', borderRadius: '8px', padding: '12px' }}>
              <code style={{ color: '#fbbf24', fontSize: '12px' }}>{node.normalizedError}</code>
              <div style={{ marginTop: '8px' }}>
                {node.children.map((c, j) => (
                  <div key={j} style={{ color: '#94a3b8', fontSize: '11px' }}>
                    <code style={{ color: '#e2e8f0' }}>{c.name}</code> — {c.file}:{c.line}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 7: Run tests**

```bash
cd apps/web && pnpm vitest run components/ui/confidence-badge.test.tsx
```

Expected: 4 tests PASS

- [ ] **Step 8: Commit**

```bash
git add apps/web/components/ui/
git commit -m "feat(web): add artifact card, approval card, confidence badge, and failure tree UI components"
```

---

### Task 6: God View dashboard — root page

**Files:**
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/globals.css`
- Create: `apps/web/app/page.tsx`
- Create: `apps/web/components/dashboard/god-view.tsx`
- Create: `apps/web/components/dashboard/project-card.tsx`
- Create: `apps/web/components/dashboard/activity-feed.tsx`

- [ ] **Step 1: Create layout.tsx**

`apps/web/app/layout.tsx`:
```typescript
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SDLC Workspace',
  description: 'Diagram-driven collaborative AI workspace',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0f1320', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Create globals.css**

`apps/web/app/globals.css`:
```css
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; padding: 0; }
a { color: #7c8cf8; text-decoration: none; }
a:hover { text-decoration: underline; }
code { font-family: 'Courier New', monospace; }
```

- [ ] **Step 3: Create dashboard components**

`apps/web/components/dashboard/project-card.tsx`:
```typescript
interface ProjectCardProps {
  id: string
  name: string
  artifactCount: number
  pendingApprovals: number
}

export function ProjectCard({ id, name, artifactCount, pendingApprovals }: ProjectCardProps) {
  return (
    <a href={`/workspace/${id}`}>
      <div style={{ background: '#1a1f2e', border: '1px solid #4b5563', borderRadius: '10px', padding: '16px', transition: 'border-color 0.15s' }}>
        <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '15px' }}>{name}</div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
          <span style={{ color: '#7c8cf8', fontSize: '12px' }}>{artifactCount} artifacts</span>
          {pendingApprovals > 0 && (
            <span style={{ color: '#f59e0b', fontSize: '12px', fontWeight: 600 }}>{pendingApprovals} pending</span>
          )}
        </div>
      </div>
    </a>
  )
}
```

`apps/web/components/dashboard/activity-feed.tsx`:
```typescript
'use client'

import { useRealtimeContext } from '@/components/providers/realtime-provider'
import { useState, useEffect } from 'react'
import type { RealtimeMessage } from '@/lib/realtime'

const EVENT_COLORS: Record<string, string> = {
  'spec.drafted': '#7c8cf8',
  'code.generated': '#f59e0b',
  'test.passed': '#34d399',
  'test.failed': '#f87171',
  'approval.decided': '#a78bfa',
  'approval.auto': '#34d399',
  'confidence.updated': '#38bdf8',
}

export function ActivityFeed({ workspaceId }: { workspaceId: string | null }) {
  const { lastMessage } = useRealtimeContext()
  const [events, setEvents] = useState<RealtimeMessage[]>([])

  useEffect(() => {
    if (lastMessage && (!workspaceId || lastMessage.workspaceId === workspaceId)) {
      setEvents(prev => [lastMessage, ...prev].slice(0, 50))
    }
  }, [lastMessage, workspaceId])

  if (events.length === 0) {
    return <p style={{ color: '#64748b', fontSize: '13px' }}>No events yet — start a run to see activity here.</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {events.map((evt, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#1a1f2e', borderRadius: '6px' }}>
          <span style={{ color: EVENT_COLORS[evt.type] ?? '#94a3b8', fontSize: '11px', fontWeight: 600, minWidth: '140px' }}>
            {evt.type}
          </span>
          <span style={{ color: '#64748b', fontSize: '11px' }}>
            {evt.workspaceId.slice(0, 8)}
          </span>
        </div>
      ))}
    </div>
  )
}
```

`apps/web/components/dashboard/god-view.tsx`:
```typescript
'use client'

import { useWorkspaceList } from '@/hooks/use-workspace'
import { ProjectCard } from './project-card'
import { ActivityFeed } from './activity-feed'

export function GodView() {
  const { workspaces, error } = useWorkspaceList()

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#7c8cf8', marginBottom: '8px' }}>SDLC Workspace</h1>
      <p style={{ color: '#94a3b8', marginBottom: '32px' }}>Diagram-driven collaborative AI development platform</p>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <div>
          <h2 style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '16px' }}>PROJECTS</h2>
          {error && <p style={{ color: '#f87171' }}>Failed to load workspaces</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {workspaces.map((ws: any) => (
              <ProjectCard
                key={ws.id}
                id={ws.id}
                name={ws.name}
                artifactCount={ws.artifact_count ?? 0}
                pendingApprovals={ws.pending_approvals ?? 0}
              />
            ))}
          </div>
          {workspaces.length === 0 && !error && (
            <p style={{ color: '#64748b', fontSize: '13px' }}>No workspaces yet. Use /workspace init to create one.</p>
          )}
        </div>

        <div>
          <h2 style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '16px' }}>LIVE ACTIVITY</h2>
          <ActivityFeed workspaceId={null} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create root page**

`apps/web/app/page.tsx`:
```typescript
import { GodView } from '@/components/dashboard/god-view'

export default function HomePage() {
  return <GodView />
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/ apps/web/components/dashboard/
git commit -m "feat(web): add God View dashboard — project list and live activity feed"
```

---

### Task 7: Approval queue page + API route

**Files:**
- Create: `apps/web/app/approvals/page.tsx`
- Create: `apps/web/app/api/approvals/route.ts`
- Create: `apps/web/app/api/approvals/[gateId]/route.ts`

- [ ] **Step 1: Create approvals API route**

`apps/web/app/api/approvals/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getPalServer, initDb } from '@/lib/pal'

export async function GET(req: NextRequest) {
  const workspaceId = req.nextUrl.searchParams.get('workspaceId')
  const status = req.nextUrl.searchParams.get('status') ?? 'open'
  const pal = await getPalServer()
  await initDb(pal)

  const rows = workspaceId
    ? await pal.db.query(
        'SELECT * FROM approval_gates WHERE workspace_id = ? AND status = ? ORDER BY opened_at DESC',
        [workspaceId, status]
      )
    : await pal.db.query(
        'SELECT * FROM approval_gates WHERE status = ? ORDER BY opened_at DESC',
        [status]
      )

  return NextResponse.json(rows)
}
```

- [ ] **Step 2: Create gate decision route**

`apps/web/app/api/approvals/[gateId]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getPalServer, initDb } from '@/lib/pal'
import { EventType } from '@sdlc/schemas'
import { makeEvent } from '@/lib/events'
import { randomUUID } from 'node:crypto'

export async function POST(
  req: NextRequest,
  { params }: { params: { gateId: string } }
) {
  const body = await req.json()
  const { decision } = body
  if (decision !== 'approved' && decision !== 'rejected') {
    return NextResponse.json({ error: 'decision must be approved or rejected' }, { status: 400 })
  }

  const pal = await getPalServer()
  await initDb(pal)

  const rows = await pal.db.query('SELECT * FROM approval_gates WHERE id = ?', [params.gateId])
  if (rows.length === 0) {
    return NextResponse.json({ error: 'gate not found' }, { status: 404 })
  }

  const gate = rows[0] as any
  const now = new Date().toISOString()

  await pal.db.execute(
    'UPDATE approval_gates SET status = ?, closed_at = ? WHERE id = ?',
    [decision, now, params.gateId]
  )

  const confDelta = decision === 'approved' ? 0.05 : -0.1
  const event = makeEvent(
    EventType.APPROVAL_DECIDED,
    gate.workspace_id,
    body.deciderId ?? 'system',
    { gateId: params.gateId, gateType: gate.gate_type, decision, confDelta },
    'user'
  )

  await pal.events.emit(`workspace.${gate.workspace_id}`, event)

  await pal.db.execute(`
    INSERT INTO confidence_scores (workspace_id, gate_type, score, threshold, updated_at)
    VALUES (?, ?, ?, 0.85, ?)
    ON CONFLICT(workspace_id, gate_type) DO UPDATE SET
      score = MIN(1.0, MAX(0.0, score + ?)),
      updated_at = ?
  `, [gate.workspace_id, gate.gate_type, Math.max(0, confDelta), now, confDelta, now])

  return NextResponse.json({ success: true, decision, confDelta })
}
```

- [ ] **Step 3: Create approvals page**

`apps/web/app/approvals/page.tsx`:
```typescript
'use client'

import { useApprovals } from '@/hooks/use-approvals'
import { ApprovalCard } from '@/components/ui/approval-card'
import { useSearchParams } from 'next/navigation'

export default function ApprovalsPage() {
  const searchParams = useSearchParams()
  const workspaceId = searchParams.get('workspaceId')
  const { gates, error, decide } = useApprovals(workspaceId)

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#7c8cf8', marginBottom: '8px' }}>Approval Queue</h1>
      <p style={{ color: '#94a3b8', marginBottom: '32px' }}>{gates.length} pending gate{gates.length !== 1 ? 's' : ''}</p>

      {error && <p style={{ color: '#f87171' }}>Failed to load approval queue</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {gates.map((gate: any) => (
          <ApprovalCard
            key={gate.id}
            gateId={gate.id}
            gateType={gate.gate_type}
            runId={gate.run_id}
            confidenceScore={gate.confidence_score ?? 0}
            threshold={0.85}
            onDecide={decide}
          />
        ))}
        {gates.length === 0 && !error && (
          <p style={{ color: '#64748b' }}>No pending approvals.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/approvals/ apps/web/app/api/approvals/
git commit -m "feat(web): add approval queue page with decision API and confidence delta update"
```

---

### Task 8: Confidence panel + API route

**Files:**
- Create: `apps/web/app/confidence/page.tsx`
- Create: `apps/web/app/api/confidence/route.ts`

- [ ] **Step 1: Create confidence API route**

`apps/web/app/api/confidence/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getPalServer, initDb } from '@/lib/pal'

export async function GET(req: NextRequest) {
  const workspaceId = req.nextUrl.searchParams.get('workspaceId')
  const pal = await getPalServer()
  await initDb(pal)

  const rows = workspaceId
    ? await pal.db.query(
        'SELECT * FROM confidence_scores WHERE workspace_id = ? ORDER BY updated_at DESC',
        [workspaceId]
      )
    : await pal.db.query('SELECT * FROM confidence_scores ORDER BY updated_at DESC', [])

  return NextResponse.json(rows)
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { workspaceId, gateType, threshold } = body
  if (!workspaceId || !gateType || threshold == null) {
    return NextResponse.json({ error: 'workspaceId, gateType, threshold required' }, { status: 400 })
  }

  const pal = await getPalServer()
  await initDb(pal)
  const now = new Date().toISOString()

  await pal.db.execute(`
    INSERT INTO confidence_scores (workspace_id, gate_type, score, threshold, updated_at)
    VALUES (?, ?, 0.0, ?, ?)
    ON CONFLICT(workspace_id, gate_type) DO UPDATE SET threshold = ?, updated_at = ?
  `, [workspaceId, gateType, threshold, now, threshold, now])

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: Create confidence page**

`apps/web/app/confidence/page.tsx`:
```typescript
'use client'

import { useConfidence } from '@/hooks/use-confidence'
import { ConfidenceBadge } from '@/components/ui/confidence-badge'
import { useSearchParams } from 'next/navigation'

export default function ConfidencePage() {
  const searchParams = useSearchParams()
  const workspaceId = searchParams.get('workspaceId')
  const { scores, error } = useConfidence(workspaceId)

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#7c8cf8', marginBottom: '8px' }}>Confidence Scores</h1>
      <p style={{ color: '#94a3b8', marginBottom: '32px' }}>
        Auto-approval fires when score ≥ threshold. Override threshold via PATCH /api/confidence.
      </p>

      {error && <p style={{ color: '#f87171' }}>Failed to load confidence scores</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {scores.map((score: any) => (
          <div key={`${score.workspace_id}-${score.gate_type}`} style={{ background: '#1a1f2e', border: '1px solid #4b5563', borderRadius: '10px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <ConfidenceBadge
                score={score.score}
                threshold={score.threshold}
                gateType={score.gate_type}
              />
              <div style={{ color: '#64748b', fontSize: '11px' }}>
                threshold: {(score.threshold * 100).toFixed(0)}% · updated {new Date(score.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
        {scores.length === 0 && !error && (
          <p style={{ color: '#64748b' }}>No confidence scores yet. Make approval decisions to build the model.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/confidence/ apps/web/app/api/confidence/
git commit -m "feat(web): add confidence panel and PATCH threshold API"
```

---

### Task 9: Workspace + Artifact pages

**Files:**
- Create: `apps/web/app/workspace/[id]/page.tsx`
- Create: `apps/web/components/workspace/artifact-list.tsx`
- Create: `apps/web/app/workspace/[id]/artifacts/[artifactId]/page.tsx`

- [ ] **Step 1: Create artifact list component**

`apps/web/components/workspace/artifact-list.tsx`:
```typescript
'use client'

import { useArtifacts } from '@/hooks/use-workspace'
import { ArtifactCard } from '@/components/ui/artifact-card'

interface ArtifactListProps {
  workspaceId: string
  filter?: string
}

export function ArtifactList({ workspaceId, filter }: ArtifactListProps) {
  const { artifacts, error } = useArtifacts(workspaceId)

  const filtered = filter
    ? artifacts.filter((a: any) => a.type === filter)
    : artifacts

  if (error) return <p style={{ color: '#f87171' }}>Failed to load artifacts</p>

  if (filtered.length === 0) return (
    <p style={{ color: '#64748b', fontSize: '13px' }}>
      No {filter ?? ''} artifacts yet.
    </p>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {filtered.map((artifact: any) => (
        <a key={artifact.id} href={`/workspace/${workspaceId}/artifacts/${artifact.id}`} style={{ textDecoration: 'none' }}>
          <ArtifactCard
            id={artifact.id}
            title={artifact.title}
            type={artifact.type}
            updatedAt={artifact.updated_at}
            workspaceId={workspaceId}
          />
        </a>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create workspace page**

`apps/web/app/workspace/[id]/page.tsx`:
```typescript
'use client'

import { useWorkspace } from '@/hooks/use-workspace'
import { ArtifactList } from '@/components/workspace/artifact-list'
import { useParams } from 'next/navigation'

export default function WorkspacePage() {
  const { id } = useParams<{ id: string }>()
  const { workspace, error } = useWorkspace(id)

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {error && <p style={{ color: '#f87171' }}>Failed to load workspace</p>}
      <h1 style={{ color: '#7c8cf8', marginBottom: '4px' }}>
        {workspace?.name ?? 'Loading...'}
      </h1>
      <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '32px' }}>
        {id}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div>
          <h2 style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '12px' }}>ARTIFACTS</h2>
          <ArtifactList workspaceId={id} />
        </div>
        <div>
          <h2 style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '12px' }}>QUICK LINKS</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a href={`/approvals?workspaceId=${id}`} style={{ color: '#f59e0b', fontSize: '13px' }}>Approval Queue</a>
            <a href={`/confidence?workspaceId=${id}`} style={{ color: '#38bdf8', fontSize: '13px' }}>Confidence Panel</a>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create artifact inspector page**

`apps/web/app/workspace/[id]/artifacts/[artifactId]/page.tsx`:
```typescript
import { getPalServer, initDb } from '@/lib/pal'
import { notFound } from 'next/navigation'

export default async function ArtifactPage({ params }: { params: { id: string; artifactId: string } }) {
  const pal = await getPalServer()
  await initDb(pal)

  const rows = await pal.db.query('SELECT * FROM artifacts WHERE id = ?', [params.artifactId])
  if (rows.length === 0) notFound()

  const artifact = rows[0] as any

  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
      <a href={`/workspace/${params.id}`} style={{ color: '#7c8cf8', fontSize: '13px' }}>← Back to workspace</a>
      <h1 style={{ color: '#e2e8f0', marginTop: '16px', marginBottom: '4px' }}>{artifact.title}</h1>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <span style={{ color: '#7c8cf8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>{artifact.type}</span>
        <span style={{ color: '#64748b', fontSize: '12px' }}>v{artifact.version}</span>
        <span style={{ color: '#64748b', fontSize: '12px' }}>Updated {new Date(artifact.updated_at).toLocaleDateString()}</span>
      </div>
      {artifact.content && (
        <pre style={{ background: '#1a1f2e', border: '1px solid #4b5563', borderRadius: '10px', padding: '20px', overflowX: 'auto', fontSize: '13px', lineHeight: 1.6 }}>
          {artifact.content}
        </pre>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/workspace/ apps/web/components/workspace/
git commit -m "feat(web): add workspace page, artifact list, and artifact inspector"
```

---

### Task 10: Final type-check and web app verification

- [ ] **Step 1: Run all web tests**

```bash
cd apps/web && pnpm vitest run
```

Expected: All unit tests PASS (confidence-badge, PAL, realtime, workspace hook)

- [ ] **Step 2: Type-check**

```bash
cd apps/web && pnpm typecheck
```

Expected: No TypeScript errors

- [ ] **Step 3: Build dry-run**

```bash
cd apps/web && pnpm build 2>&1 | tail -20
```

Expected: Build completes (or fails on missing Nx Next plugin — record error)

- [ ] **Step 4: Start dev server and verify manually**

```bash
cd apps/web && PLATFORM=local pnpm dev
```

Open `http://localhost:3000` in Chrome.

Verify:
- God View renders (empty workspace list)
- `/approvals` page renders
- `/confidence` page renders
- No console errors

- [ ] **Step 5: Commit final state**

```bash
git add .
git commit -m "feat(web): complete Phase 2 web app — dashboard, approvals, confidence, workspace views"
```

---

## Acceptance Criteria Checklist

- [ ] PAL server singleton initializes all 5 DB tables without error
- [ ] `GET /api/workspaces` returns empty array on fresh start
- [ ] `POST /api/workspaces` creates a workspace and returns 201
- [ ] `POST /api/approvals/:gateId` updates gate status, emits event, updates confidence score
- [ ] `GET /api/confidence` returns confidence scores per gate type
- [ ] `PATCH /api/confidence` updates threshold for a gate type
- [ ] God View dashboard renders workspace list with links
- [ ] Approval queue page renders approval cards with decide buttons
- [ ] Confidence page renders score badges with auto-approve indicator
- [ ] Artifact inspector page renders artifact content
- [ ] All Vitest unit tests pass
- [ ] TypeScript `tsc --noEmit` reports zero errors
