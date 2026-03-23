import type { VerificationResult } from '../types.ts'

export interface EvidencePanelProps {
  verificationResults: VerificationResult[];
  evidenceArtifacts: string[];
  acceptanceCriteria: string[];
}

function ExitCodeBadge({ code }: { code: number }) {
  const passed = code === 0
  return (
    <span
      className={`evidence-exit-badge${passed ? ' evidence-exit-pass' : ' evidence-exit-fail'}`}
      aria-label={`Exit code ${code}`}
    >
      exit {code}
    </span>
  )
}

export function EvidencePanel({
  verificationResults,
  evidenceArtifacts,
  acceptanceCriteria,
}: EvidencePanelProps) {
  const hasResults = verificationResults.length > 0
  const hasArtifacts = evidenceArtifacts.length > 0
  const hasCriteria = acceptanceCriteria.length > 0

  if (!hasResults && !hasArtifacts && !hasCriteria) {
    return (
      <div className="evidence-empty">
        No evidence recorded yet.
      </div>
    )
  }

  return (
    <div className="evidence-panel">
      {hasCriteria && (
        <section className="evidence-section">
          <div className="evidence-section-title">Acceptance Criteria</div>
          <ul className="evidence-criteria-list">
            {acceptanceCriteria.map((criterion, index) => {
              const passed = hasResults && verificationResults.every((r) => r.exitCode === 0)
              return (
                <li key={index} className={`evidence-criterion${passed ? ' evidence-criterion-pass' : ''}`}>
                  <span className="evidence-criterion-indicator" aria-hidden="true">
                    {passed ? '\u2713' : '\u25cb'}
                  </span>
                  {criterion}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {hasResults && (
        <section className="evidence-section">
          <div className="evidence-section-title">Verification Commands</div>
          <div className="evidence-result-list">
            {verificationResults.map((result, index) => (
              <div key={index} className="evidence-result-item">
                <div className="evidence-result-header">
                  <code className="evidence-command">{result.command}</code>
                  <ExitCodeBadge code={result.exitCode} />
                </div>
                {result.output && (
                  <pre className="evidence-output">{result.output.slice(0, 500)}{result.output.length > 500 ? '\n...(truncated)' : ''}</pre>
                )}
                <div className="evidence-result-ts">{result.timestamp}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {hasArtifacts && (
        <section className="evidence-section">
          <div className="evidence-section-title">Evidence Artifacts</div>
          <ul className="evidence-artifact-list">
            {evidenceArtifacts.map((artifact, index) => (
              <li key={index} className="evidence-artifact-item">
                <code className="evidence-artifact-path">{artifact}</code>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
