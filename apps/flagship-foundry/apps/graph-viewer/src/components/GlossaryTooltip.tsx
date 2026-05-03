import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useGlossary } from '../hooks/useGlossary.ts'

export interface GlossaryTooltipProps {
  term: string
  children: React.ReactNode
}

const TOOLTIP_OFFSET_PX = 8

function formatPhaseId(id: string): string {
  return id.charAt(0).toUpperCase() + id.slice(1)
}

export function GlossaryTooltip({ term, children }: GlossaryTooltipProps) {
  const { lookupTerm } = useGlossary()
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<CSSProperties>({})
  const anchorRef = useRef<HTMLSpanElement>(null)

  const termData = lookupTerm(term)

  function handleMouseEnter() {
    if (!termData || !anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    // Position the tooltip above the anchor element.
    setPosition({
      bottom: window.innerHeight - rect.top + TOOLTIP_OFFSET_PX,
      left: rect.left + rect.width / 2,
      transform: 'translateX(-50%)',
    })
    setVisible(true)
  }

  function handleMouseLeave() {
    setVisible(false)
  }

  // If no term data found, render children without tooltip wrapper overhead.
  if (!termData) {
    return <>{children}</>
  }

  return (
    <>
      <span
        ref={anchorRef}
        className="glossary-tooltip-anchor"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </span>

      {visible && (
        <div
          className="glossary-tooltip"
          style={{ ...position, position: 'fixed' }}
          role="tooltip"
          aria-label={`Definition: ${termData.term}`}
        >
          <div className="glossary-tooltip-term">{termData.term}</div>
          <div className="glossary-tooltip-definition">{termData.definition}</div>
          {termData.applicablePhases && termData.applicablePhases.length > 0 && (
            <div className="glossary-tooltip-phases">
              {termData.applicablePhases.map((phase) => (
                <span key={phase} className="glossary-tooltip-phase-badge">
                  {formatPhaseId(phase)}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
