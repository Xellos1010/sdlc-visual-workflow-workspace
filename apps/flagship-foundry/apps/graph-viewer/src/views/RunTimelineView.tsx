import { useCallback, useEffect, useState } from 'react'
import type { Run, RunTask } from '../types.ts'
import { TaskCard } from '../components/TaskCard.tsx'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4010'

export interface RunTimelineViewProps {
  ecosystemId?: string;
  onTaskSelect?: (taskId: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupTasksByPhase(tasks: RunTask[]): Map<string, RunTask[]> {
  const groups = new Map<string, RunTask[]>()
  for (const task of tasks) {
    const phase = task.phase ?? 'unknown'
    if (!groups.has(phase)) groups.set(phase, [])
    groups.get(phase)!.push(task)
  }
  return groups
}

function runStatusClass(status: string): string {
  const map: Record<string, string> = {
    ready: 'run-status-ready',
    running: 'run-status-running',
    paused: 'run-status-paused',
    stopped: 'run-status-stopped',
    completed: 'run-status-completed',
    failed: 'run-status-failed',
  }
  return map[status] ?? 'run-status-ready'
}

function shortRunId(id: string): string {
  // Strip the "run:" prefix and trim to a readable length
  const bare = id.replace(/^run:/, '')
  if (bare.length <= 60) return bare
  return `${bare.slice(0, 30)}...${bare.slice(-20)}`
}

// ── Run Selector ──────────────────────────────────────────────────────────────

interface RunSelectorProps {
  runs: Run[];
  selectedId: string;
  onChange: (id: string) => void;
  disabled: boolean;
}

function RunSelector({ runs, selectedId, onChange, disabled }: RunSelectorProps) {
  return (
    <div className="run-selector">
      <label className="run-selector-label" htmlFor="run-select">Run:</label>
      <select
        id="run-select"
        className="run-select"
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || runs.length === 0}
      >
        {runs.length === 0 && (
          <option value="">No runs found</option>
        )}
        {runs.map((run) => (
          <option key={run.id} value={run.id}>
            {shortRunId(run.id)} — {run.status}
          </option>
        ))}
      </select>
    </div>
  )
}

// ── Run Header ────────────────────────────────────────────────────────────────

interface RunHeaderProps {
  run: Run;
}

function RunHeader({ run }: RunHeaderProps) {
  const totalTasks = run.tasks.length
  const completedTasks = run.tasks.filter((t) => t.status === 'completed').length
  const failedTasks = run.tasks.filter((t) => t.status === 'failed').length

  return (
    <div className="run-header">
      <div className="run-header-row">
        <div className="run-header-field">
          <span className="run-header-label">Plan</span>
          <span className="run-header-value run-header-plan-id">{run.planId}</span>
        </div>
        <div className="run-header-field">
          <span className="run-header-label">Status</span>
          <span className={`run-header-status ${runStatusClass(run.status)}`}>{run.status}</span>
        </div>
        {run.startedAt && (
          <div className="run-header-field">
            <span className="run-header-label">Started</span>
            <span className="run-header-value">{run.startedAt}</span>
          </div>
        )}
        {run.completedAt && (
          <div className="run-header-field">
            <span className="run-header-label">Completed</span>
            <span className="run-header-value">{run.completedAt}</span>
          </div>
        )}
      </div>
      <div className="run-header-stats">
        <span className="run-stat">{totalTasks} tasks</span>
        {completedTasks > 0 && (
          <span className="run-stat run-stat-completed">{completedTasks} completed</span>
        )}
        {failedTasks > 0 && (
          <span className="run-stat run-stat-failed">{failedTasks} failed</span>
        )}
        {run.ecosystemId && (
          <span className="run-stat">ecosystem: {run.ecosystemId}</span>
        )}
      </div>
    </div>
  )
}

// ── Phase Swimlane ────────────────────────────────────────────────────────────

interface PhaseSwimlaneProps {
  phase: string;
  tasks: RunTask[];
  expandedTaskId: string | null;
  onTaskClick: (taskId: string) => void;
}

function PhaseSwimlane({ phase, tasks, expandedTaskId, onTaskClick }: PhaseSwimlaneProps) {
  const allCompleted = tasks.every((t) => t.status === 'completed')
  const anyFailed = tasks.some((t) => t.status === 'failed')
  const anyRunning = tasks.some((t) => t.status === 'running')

  let phaseClass = 'phase-swimlane'
  if (allCompleted) phaseClass += ' phase-swimlane-completed'
  else if (anyFailed) phaseClass += ' phase-swimlane-failed'
  else if (anyRunning) phaseClass += ' phase-swimlane-running'

  return (
    <div className={phaseClass}>
      <div className="phase-swimlane-header">
        <span className="phase-swimlane-name">Phase: {phase}</span>
        <span className="phase-swimlane-count">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="phase-swimlane-tasks">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isExpanded={expandedTaskId === task.id}
            onClick={() => onTaskClick(task.id)}
          />
        ))}
      </div>
    </div>
  )
}

// ── Root View ─────────────────────────────────────────────────────────────────

export function RunTimelineView({ ecosystemId, onTaskSelect }: RunTimelineViewProps) {
  const [runs, setRuns] = useState<Run[]>([])
  const [runsLoading, setRunsLoading] = useState(true)
  const [runsError, setRunsError] = useState<string | null>(null)

  const [selectedRunId, setSelectedRunId] = useState<string>('')
  const [selectedRun, setSelectedRun] = useState<Run | null>(null)
  const [runLoading, setRunLoading] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)

  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)

  // Fetch run list on mount (optionally filter by ecosystemId if the API supports it)
  useEffect(() => {
    setRunsLoading(true)
    setRunsError(null)
    const url = ecosystemId
      ? `${API_BASE}/runs?ecosystemId=${encodeURIComponent(ecosystemId)}`
      : `${API_BASE}/runs`
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<Run[]>
      })
      .then((data) => {
        setRuns(data)
        if (data.length > 0) {
          setSelectedRunId(data[0].id)
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        setRunsError(`Failed to load runs: ${msg}`)
      })
      .finally(() => setRunsLoading(false))
  }, [ecosystemId])

  // Fetch full run data when selection changes
  useEffect(() => {
    if (!selectedRunId) {
      setSelectedRun(null)
      return
    }
    setRunLoading(true)
    setRunError(null)
    setExpandedTaskId(null)
    fetch(`${API_BASE}/runs/${encodeURIComponent(selectedRunId)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<Run>
      })
      .then((data) => setSelectedRun(data))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        setRunError(`Failed to load run: ${msg}`)
      })
      .finally(() => setRunLoading(false))
  }, [selectedRunId])

  const handleTaskClick = useCallback(
    (taskId: string) => {
      setExpandedTaskId((current) => (current === taskId ? null : taskId))
      onTaskSelect?.(taskId)
    },
    [onTaskSelect],
  )

  // Derive ordered phase groups from selected run
  const phaseGroups = selectedRun ? groupTasksByPhase(selectedRun.tasks) : new Map<string, RunTask[]>()

  return (
    <div className="run-timeline-view">
      <div className="run-timeline-toolbar">
        <RunSelector
          runs={runs}
          selectedId={selectedRunId}
          onChange={setSelectedRunId}
          disabled={runsLoading}
        />
        {runsError && (
          <span className="run-timeline-error">{runsError}</span>
        )}
        {runError && (
          <span className="run-timeline-error">{runError}</span>
        )}
        {(runsLoading || runLoading) && (
          <span className="run-timeline-loading">Loading...</span>
        )}
      </div>

      <div className="run-timeline-body">
        {!runsLoading && runs.length === 0 && !runsError && (
          <div className="run-timeline-empty">
            <div className="run-timeline-empty-title">No runs found</div>
            <div className="run-timeline-empty-sub">
              Create a run by starting a plan. Runs will appear here once they exist.
            </div>
          </div>
        )}

        {selectedRun && !runLoading && !runError && (
          <>
            <RunHeader run={selectedRun} />
            <div className="run-timeline-phases">
              {phaseGroups.size === 0 ? (
                <div className="run-timeline-empty">
                  <div className="run-timeline-empty-sub">This run has no tasks.</div>
                </div>
              ) : (
                Array.from(phaseGroups.entries()).map(([phase, tasks]) => (
                  <PhaseSwimlane
                    key={phase}
                    phase={phase}
                    tasks={tasks}
                    expandedTaskId={expandedTaskId}
                    onTaskClick={handleTaskClick}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
