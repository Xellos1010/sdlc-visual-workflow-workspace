export interface PrincipleCardProps {
  name: string;
  description?: string;
  applicablePhases: string[];
  allPhases: string[];
}

function formatPrincipleName(raw: string): string {
  return raw
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function PrincipleCard({ name, description, applicablePhases, allPhases }: PrincipleCardProps) {
  const applicableSet = new Set(applicablePhases)

  return (
    <div className="principle-card">
      <div className="principle-card-name">{formatPrincipleName(name)}</div>
      {description && (
        <div className="principle-card-description">{description}</div>
      )}
      <div className="principle-card-phases" aria-label="Phase applicability">
        {allPhases.map((phaseId) => (
          <span
            key={phaseId}
            className={`principle-phase-dot ${applicableSet.has(phaseId) ? 'principle-phase-dot-active' : 'principle-phase-dot-inactive'}`}
            title={phaseId}
            aria-label={`${phaseId}: ${applicableSet.has(phaseId) ? 'applicable' : 'not applicable'}`}
          />
        ))}
      </div>
    </div>
  )
}
