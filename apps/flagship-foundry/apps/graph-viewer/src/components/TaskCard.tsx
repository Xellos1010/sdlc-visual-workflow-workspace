import type { RunTask } from '../types.ts'
import { EvidencePanel } from './EvidencePanel.tsx'

export interface TaskCardProps {
  task: RunTask;
  isExpanded: boolean;
  onClick: () => void;
}

type TaskStatus = RunTask['status']

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.round((ms % 60000) / 1000)
  return `${minutes}m ${seconds}s`
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const labels: Record<TaskStatus, string> = {
    queued: 'queued',
    running: 'running',
    completed: 'completed',
    failed: 'failed',
    paused: 'paused',
    stopped: 'stopped',
  }
  return (
    <span className={`task-status-badge task-status-${status}`} aria-label={`Status: ${status}`}>
      {labels[status] ?? status}
    </span>
  )
}

function PersonaBadge({ personaId }: { personaId: string }) {
  const label = personaId.replace(/^persona:/, '').replace(/-/g, ' ')
  return <span className="task-persona-badge">{label}</span>
}

export function TaskCard({ task, isExpanded, onClick }: TaskCardProps) {
  const personas = task.personaIds ?? []
  const criteria = task.acceptanceCriteria ?? []
  const commands = task.commands ?? task.verificationCommands ?? []
  const verificationResults = task.verificationResults ?? []
  const evidenceArtifacts = task.evidenceArtifacts ?? []

  return (
    <div
      className={`task-card task-card-${task.status}${isExpanded ? ' task-card-expanded' : ''}`}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div className="task-card-header">
        <div className="task-card-title">{task.title || task.id}</div>
        <div className="task-card-meta">
          <StatusBadge status={task.status} />
          {task.durationMs !== undefined && (
            <span className="task-duration">{formatDuration(task.durationMs)}</span>
          )}
          {task.status === 'running' && !task.durationMs && (
            <span className="task-duration task-duration-running">running...</span>
          )}
        </div>
      </div>

      {personas.length > 0 && (
        <div className="task-card-personas">
          {personas.slice(0, 3).map((id) => (
            <PersonaBadge key={id} personaId={id} />
          ))}
          {personas.length > 3 && (
            <span className="task-persona-badge task-persona-overflow">+{personas.length - 3} more</span>
          )}
        </div>
      )}

      {isExpanded && (
        <div className="task-card-body">
          {criteria.length > 0 && (
            <div className="task-card-section">
              <div className="task-card-section-title">Acceptance Criteria</div>
              <ul className="task-criteria-list">
                {criteria.map((criterion, index) => (
                  <li key={index} className="task-criterion">{criterion}</li>
                ))}
              </ul>
            </div>
          )}

          {commands.length > 0 && (
            <div className="task-card-section">
              <div className="task-card-section-title">Verification Commands</div>
              <ul className="task-commands-list">
                {commands.map((cmd, index) => (
                  <li key={index} className="task-command">
                    <code>{cmd}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(verificationResults.length > 0 || evidenceArtifacts.length > 0) && (
            <div className="task-card-section">
              <div className="task-card-section-title">Evidence</div>
              <EvidencePanel
                verificationResults={verificationResults}
                evidenceArtifacts={evidenceArtifacts}
                acceptanceCriteria={criteria}
              />
            </div>
          )}

          <div className="task-card-timestamps">
            {task.startedAt && (
              <div className="task-timestamp">
                <span className="task-timestamp-label">Started:</span>
                <span className="task-timestamp-value">{task.startedAt}</span>
              </div>
            )}
            {task.completedAt && (
              <div className="task-timestamp">
                <span className="task-timestamp-label">Completed:</span>
                <span className="task-timestamp-value">{task.completedAt}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
