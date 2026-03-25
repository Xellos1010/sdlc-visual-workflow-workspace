export type GateStatus = 'passed' | 'partial' | 'blocked' | 'pending'

export interface GateIndicatorProps {
  fromPhase: string;
  toPhase: string;
  status: GateStatus;
  criteria?: string[];
}

function gateStatusClass(status: GateStatus): string {
  return `gate-indicator-${status}`
}

function gateAriaLabel(from: string, to: string, status: GateStatus): string {
  return `Gate from ${from} to ${to}: ${status}`
}

export function GateIndicator({ fromPhase, toPhase, status, criteria }: GateIndicatorProps) {
  const tooltipText = criteria && criteria.length > 0
    ? criteria.join(' | ')
    : `${fromPhase} → ${toPhase}`

  return (
    <div
      className={`gate-indicator ${gateStatusClass(status)}`}
      title={tooltipText}
      aria-label={gateAriaLabel(fromPhase, toPhase, status)}
      role="img"
    >
      <svg
        className="gate-indicator-arrow"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3 8h10M9 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
