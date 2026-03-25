import type { PhaseData } from '../types.ts'

export type PhaseStatus = 'completed' | 'current' | 'pending'

export interface PhaseNodeProps {
  phase: PhaseData;
  status: PhaseStatus;
  isSelected: boolean;
  onClick: () => void;
}

function StatusDot({ status }: { status: PhaseStatus }) {
  if (status === 'completed') {
    return (
      <span className="phase-node-status-dot phase-node-status-completed" aria-label="Completed">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }
  if (status === 'current') {
    return <span className="phase-node-status-dot phase-node-status-current" aria-label="Current phase" />
  }
  return <span className="phase-node-status-dot phase-node-status-pending" aria-label="Pending" />
}

function DorProgress({ total, status }: { total: number; status: PhaseStatus }) {
  const filled = status === 'completed' ? total : status === 'current' ? Math.ceil(total / 2) : 0
  const pct = total === 0 ? 0 : Math.round((filled / total) * 100)

  return (
    <div className="phase-node-dor" title={`${filled}/${total} DoR criteria`}>
      <div className="phase-node-dor-bar">
        <div
          className={`phase-node-dor-fill phase-node-dor-fill-${status}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="phase-node-dor-label">{filled}/{total} ready</span>
    </div>
  )
}

export function PhaseNode({ phase, status, isSelected, onClick }: PhaseNodeProps) {
  const rootClass = [
    'phase-node',
    `phase-node-${status}`,
    isSelected ? 'phase-node-selected' : '',
  ].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      className={rootClass}
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={`Phase ${phase.order}: ${phase.name}`}
    >
      <div className="phase-node-header">
        <span className="phase-node-order">{phase.order}</span>
        <StatusDot status={status} />
      </div>

      <div className="phase-node-name">{phase.name}</div>

      <div className="phase-node-badges">
        <span className="phase-node-agent-badge">{phase.primaryAgent}</span>
        {phase.principles.length > 0 && (
          <span className="phase-node-principle-count">
            {phase.principles.length} principle{phase.principles.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <DorProgress total={phase.definitionOfReady.length} status={status} />
    </button>
  )
}
