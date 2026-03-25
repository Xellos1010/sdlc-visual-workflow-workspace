import { useEffect, useRef, useState } from 'react'
import type { PhaseLifecycle, PrincipleInfo } from '../types.ts'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4010'

export interface PrincipleEnforcementBarProps {
  currentPhase?: string
  projectName?: string
}

// Raw shape from the principle-catalog endpoint.
interface RawPrincipleEntry {
  id: string
  statement: string
}

interface RawPrincipleCatalog {
  principles: RawPrincipleEntry[]
}

// Module-level caches to avoid re-fetching on every render cycle.
let cachedLifecycle: PhaseLifecycle | null = null
let cachedCatalog: Map<string, string> | null = null // id -> statement

function fetchLifecycle(): Promise<PhaseLifecycle> {
  if (cachedLifecycle !== null) return Promise.resolve(cachedLifecycle)
  return fetch(`${API_BASE}/ontology/phases`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json() as Promise<PhaseLifecycle>
    })
    .then((data) => {
      cachedLifecycle = data
      return data
    })
}

function fetchCatalog(): Promise<Map<string, string>> {
  if (cachedCatalog !== null) return Promise.resolve(cachedCatalog)
  return fetch(`${API_BASE}/ontology/principles`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json() as Promise<RawPrincipleCatalog>
    })
    .then((raw) => {
      const map = new Map<string, string>()
      for (const p of raw.principles) {
        map.set(p.id, p.statement)
      }
      cachedCatalog = map
      return map
    })
}

function formatPrincipleId(id: string): string {
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function statusClass(status: PrincipleInfo['complianceStatus']): string {
  switch (status) {
    case 'verified':
      return 'principle-chip-verified'
    case 'violation':
      return 'principle-chip-violation'
    default:
      return 'principle-chip-unchecked'
  }
}

function statusLabel(status: PrincipleInfo['complianceStatus']): string {
  switch (status) {
    case 'verified':
      return 'Verified'
    case 'violation':
      return 'Violation'
    default:
      return 'Unchecked'
  }
}

// ── PrincipleChip ─────────────────────────────────────────────────────────────

interface PrincipleChipProps {
  principle: PrincipleInfo
}

function PrincipleChip({ principle }: PrincipleChipProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="principle-chip-wrapper">
      <button
        className={`principle-chip ${statusClass(principle.complianceStatus)}`}
        onClick={() => setExpanded((prev) => !prev)}
        type="button"
        aria-expanded={expanded}
        aria-label={`${formatPrincipleId(principle.id)}: ${statusLabel(principle.complianceStatus)}`}
      >
        <span className="principle-chip-label">{formatPrincipleId(principle.id)}</span>
        <span className="principle-chip-status-dot" aria-hidden="true" />
      </button>

      {expanded && (
        <div className="principle-chip-popover" role="tooltip">
          <div className="principle-chip-popover-id">{formatPrincipleId(principle.id)}</div>
          <div className="principle-chip-popover-statement">{principle.statement}</div>
          <div className={`principle-chip-popover-status ${statusClass(principle.complianceStatus)}`}>
            {statusLabel(principle.complianceStatus)}
          </div>
        </div>
      )}
    </div>
  )
}

// ── PrincipleEnforcementBar ───────────────────────────────────────────────────

export function PrincipleEnforcementBar({ currentPhase, projectName }: PrincipleEnforcementBarProps) {
  const [principles, setPrinciples] = useState<PrincipleInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)

    Promise.all([fetchLifecycle(), fetchCatalog()])
      .then(([lifecycle, catalogMap]) => {
        if (!mountedRef.current) return

        // Find the phase data. Default to the first phase if none specified.
        const phaseId = currentPhase ?? lifecycle.phases[0]?.id
        const phaseData = lifecycle.phases.find((p) => p.id === phaseId)

        if (!phaseData) {
          setPrinciples([])
          return
        }

        const enriched: PrincipleInfo[] = phaseData.principles.map((id) => ({
          id,
          statement: catalogMap.get(id) ?? id,
          // Derive applicable phases: all phases whose principle list includes this id.
          applicablePhases: lifecycle.phases
            .filter((p) => p.principles.includes(id))
            .map((p) => p.id),
          // Default to unchecked — runtime compliance checking is not yet implemented.
          complianceStatus: 'unchecked',
        }))

        setPrinciples(enriched)
      })
      .catch((err: unknown) => {
        if (!mountedRef.current) return
        const msg = err instanceof Error ? err.message : String(err)
        setError(`Failed to load principles: ${msg}`)
      })
      .finally(() => {
        if (!mountedRef.current) return
        setLoading(false)
      })
  }, [currentPhase])

  if (loading) {
    return (
      <div className="principle-bar principle-bar-loading" aria-label="Principle enforcement bar">
        <span className="principle-bar-loading-text">Loading principles...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="principle-bar principle-bar-error" aria-label="Principle enforcement bar">
        <span className="principle-bar-error-text">{error}</span>
      </div>
    )
  }

  if (principles.length === 0) return null

  return (
    <div className="principle-bar" role="region" aria-label="Active principles for current phase">
      <span className="principle-bar-label">
        {currentPhase
          ? `${currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} principles`
          : 'Active principles'}
        {projectName ? ` — ${projectName}` : ''}
      </span>
      <div className="principle-bar-chips">
        {principles.map((p) => (
          <PrincipleChip key={p.id} principle={p} />
        ))}
      </div>
    </div>
  )
}
