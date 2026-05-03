import { useCallback, useEffect, useState } from 'react'
import type { EcosystemManifest } from '../types.ts'
import './HomeView.css'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4010'

// Run header shape returned by the new list endpoints
interface RunHeader {
  id: string;
  planId: string;
  ecosystemId?: string;
  status: string;
  mode?: string;
  adapterId?: string;
  createdAt?: string;
  updatedAt?: string;
  startedAt?: string;
  completedAt?: string;
  taskCount?: number;
}

type AppView = 'home' | 'graph' | 'lifecycle' | 'work-orders' | 'glossary'

interface HomeViewProps {
  ecosystems: EcosystemManifest[];
  ecosystemsLoading: boolean;
  selectedEcosystemId: string;
  onSelectEcosystem: (ecosystemId: string) => void;
  onViewRuns: (ecosystemId: string) => void;
  onNavigate: (view: AppView) => void;
}

function formatRelativeTime(isoString?: string): string {
  if (!isoString) return 'never'
  const diff = Date.now() - new Date(isoString).getTime()
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

function runStatusClass(status: string): string {
  switch (status) {
    case 'completed': return 'status-completed'
    case 'running': return 'status-running'
    case 'failed': return 'status-failed'
    case 'paused': return 'status-paused'
    case 'stopped': return 'status-stopped'
    default: return 'status-default'
  }
}

function statusDot(status: string): string {
  switch (status) {
    case 'completed': return '✓'
    case 'running': return '▶'
    case 'failed': return '✕'
    case 'paused': return '⏸'
    case 'stopped': return '⏹'
    default: return '·'
  }
}

// Derive a human-readable label from a plan ID slug
function planLabel(planId: string): string {
  // Strip prefix and timestamps, keep the meaningful middle part
  return planId
    .replace(/^plan[:-]/, '')
    .replace(/-\d{13,}$/, '')
    .replace(/^[a-z-]+-workspace-/, '')
    .replace(/-/g, ' ')
    .slice(0, 48)
}

export function HomeView({
  ecosystems,
  ecosystemsLoading,
  selectedEcosystemId,
  onSelectEcosystem,
  onViewRuns,
  onNavigate,
}: HomeViewProps) {
  const [recentRuns, setRecentRuns] = useState<RunHeader[]>([])
  const [runsLoading, setRunsLoading] = useState(false)
  const [focusedEcosystemId, setFocusedEcosystemId] = useState<string>(selectedEcosystemId)

  // Sync focused ecosystem with parent selection
  useEffect(() => {
    if (selectedEcosystemId) {
      setFocusedEcosystemId(selectedEcosystemId)
    } else if (ecosystems.length > 0) {
      setFocusedEcosystemId(ecosystems[0].id)
    }
  }, [selectedEcosystemId, ecosystems])

  // Fetch recent runs for focused ecosystem
  useEffect(() => {
    if (!focusedEcosystemId) return
    setRunsLoading(true)
    fetch(`${API_BASE}/runs?ecosystemId=${encodeURIComponent(focusedEcosystemId)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<RunHeader[]>
      })
      .then((data) => setRecentRuns(data.slice(0, 8)))
      .catch(() => setRecentRuns([]))
      .finally(() => setRunsLoading(false))
  }, [focusedEcosystemId])

  const handleCardClick = useCallback((ecosystemId: string) => {
    setFocusedEcosystemId(ecosystemId)
  }, [])

  if (ecosystemsLoading) {
    return (
      <div className="home-view home-view-loading">
        <div className="home-loading-text">Loading workspace...</div>
      </div>
    )
  }

  const focusedEco = ecosystems.find((e) => e.id === focusedEcosystemId)

  return (
    <div className="home-view">
      {/* ── Header ── */}
      <div className="home-header">
        <div className="home-header-left">
          <h1 className="home-title">Workspace Overview</h1>
          <p className="home-subtitle">Select a project to explore its architecture, history, and decisions.</p>
        </div>
        <div className="home-header-actions">
          <button
            type="button"
            className="home-action-btn home-action-btn-primary"
            onClick={() => onNavigate('lifecycle')}
          >
            View Lifecycle
          </button>
          <button
            type="button"
            className="home-action-btn"
            onClick={() => onNavigate('glossary')}
          >
            Glossary
          </button>
        </div>
      </div>

      {/* ── Project Cards ── */}
      <section className="home-section">
        <h2 className="home-section-title">Projects</h2>
        {ecosystems.length === 0 ? (
          <div className="home-empty">
            <div className="home-empty-title">No projects found</div>
            <div className="home-empty-sub">Import a workspace to get started.</div>
          </div>
        ) : (
          <div className="home-project-grid">
            {ecosystems.map((eco) => (
              <div
                key={eco.id}
                className={`home-project-card${focusedEcosystemId === eco.id ? ' home-project-card-focused' : ''}`}
                onClick={() => handleCardClick(eco.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(eco.id) }}
                aria-pressed={focusedEcosystemId === eco.id}
              >
                <div className="home-project-card-header">
                  <span className="home-project-name">{(eco.name as string) ?? eco.id}</span>
                  <span className="home-project-id">{eco.id}</span>
                </div>
                {typeof eco.importedAt === 'string' && (
                  <div className="home-project-meta">
                    Imported {formatRelativeTime(eco.importedAt)}
                  </div>
                )}
                <div className="home-project-card-actions">
                  <button
                    type="button"
                    className="home-card-btn"
                    onClick={(e) => { e.stopPropagation(); onSelectEcosystem(eco.id) }}
                    title="View dependency graph"
                  >
                    Graph
                  </button>
                  <button
                    type="button"
                    className="home-card-btn"
                    onClick={(e) => { e.stopPropagation(); onViewRuns(eco.id) }}
                    title="View work orders and runs"
                  >
                    Work Orders
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Recent Activity ── */}
      {focusedEco && (
        <section className="home-section">
          <h2 className="home-section-title">
            Recent Activity
            <span className="home-section-subtitle"> — {(focusedEco.name as string) ?? focusedEco.id}</span>
          </h2>

          {runsLoading ? (
            <div className="home-runs-loading">Loading runs...</div>
          ) : recentRuns.length === 0 ? (
            <div className="home-runs-empty">No runs found for this project.</div>
          ) : (
            <div className="home-runs-list">
              {recentRuns.map((run) => (
                <div key={run.id} className="home-run-row">
                  <span className={`home-run-dot ${runStatusClass(run.status)}`}>
                    {statusDot(run.status)}
                  </span>
                  <span className="home-run-label">{planLabel(run.planId)}</span>
                  <span className={`home-run-status ${runStatusClass(run.status)}`}>{run.status}</span>
                  <span className="home-run-tasks">{run.taskCount ?? 0} tasks</span>
                  <span className="home-run-time">{formatRelativeTime(run.updatedAt ?? run.createdAt)}</span>
                </div>
              ))}
              <button
                type="button"
                className="home-view-all-btn"
                onClick={() => onViewRuns(focusedEcosystemId)}
              >
                View all work orders →
              </button>
            </div>
          )}
        </section>
      )}

      {/* ── Quick Actions ── */}
      <section className="home-section home-quick-actions">
        <h2 className="home-section-title">Quick Actions</h2>
        <div className="home-actions-row">
          <button
            type="button"
            className="home-quick-btn home-quick-btn-future"
            disabled
            title="Coming soon — define intent and create work orders"
          >
            <span className="home-quick-btn-icon">◈</span>
            <span className="home-quick-btn-label">Define Intent</span>
            <span className="home-quick-btn-badge">Soon</span>
          </button>
          <button
            type="button"
            className="home-quick-btn"
            onClick={() => onNavigate('graph')}
          >
            <span className="home-quick-btn-icon">◉</span>
            <span className="home-quick-btn-label">Explore Graph</span>
          </button>
          <button
            type="button"
            className="home-quick-btn"
            onClick={() => onNavigate('lifecycle')}
          >
            <span className="home-quick-btn-icon">⟳</span>
            <span className="home-quick-btn-label">View Lifecycle</span>
          </button>
          <button
            type="button"
            className="home-quick-btn"
            onClick={() => onNavigate('glossary')}
          >
            <span className="home-quick-btn-icon">≡</span>
            <span className="home-quick-btn-label">Glossary</span>
          </button>
        </div>
      </section>
    </div>
  )
}
