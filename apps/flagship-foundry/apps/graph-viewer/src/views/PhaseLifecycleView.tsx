import { useCallback, useEffect, useState } from 'react'
import type { PhaseData, PhaseLifecycle } from '../types.ts'
import { PhaseNode } from '../components/PhaseNode.tsx'
import type { PhaseStatus } from '../components/PhaseNode.tsx'
import { GateIndicator } from '../components/GateIndicator.tsx'
import type { GateStatus } from '../components/GateIndicator.tsx'
import { PrincipleCard } from '../components/PrincipleCard.tsx'
import phaseLifecycleFallback from '../data/phase-lifecycle.json'
import '../PhaseLifecycle.css'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4010'

export interface PhaseLifecycleViewProps {
  currentPhase?: string;
  projectName?: string;
  onPhaseSelect?: (phaseId: string) => void;
}

// ── Loop color themes ─────────────────────────────────────────────────────────

const LOOP_THEME: Record<string, string> = {
  'intent-to-architecture': 'loop-intent',
  'architecture-to-implementation': 'loop-arch',
  'operate-to-improve': 'loop-operate',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function phaseStatus(phase: PhaseData, currentPhaseOrder: number): PhaseStatus {
  if (phase.order < currentPhaseOrder) return 'completed'
  if (phase.order === currentPhaseOrder) return 'current'
  return 'pending'
}

function gateStatus(fromPhase: PhaseData, currentPhaseOrder: number): GateStatus {
  if (fromPhase.order < currentPhaseOrder) return 'passed'
  if (fromPhase.order === currentPhaseOrder) return 'partial'
  return 'pending'
}

// ── Detail panel ──────────────────────────────────────────────────────────────

interface PhaseDetailPanelProps {
  phase: PhaseData;
  allPhaseIds: string[];
  status: PhaseStatus;
  onClose: () => void;
}

function ChecklistSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <div className="phase-detail-section">
      <div className="phase-detail-section-title">{title}</div>
      <ul className="phase-detail-checklist">
        {items.map((item) => (
          <li key={item} className="phase-detail-checklist-item">
            <span className="phase-detail-check-icon" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function TagList({ title, items, tagClass }: { title: string; items: string[]; tagClass?: string }) {
  if (items.length === 0) return null
  return (
    <div className="phase-detail-section">
      <div className="phase-detail-section-title">{title}</div>
      <div className="phase-detail-tags">
        {items.map((item) => (
          <span key={item} className={`phase-detail-tag ${tagClass ?? ''}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function PhaseDetailPanel({ phase, allPhaseIds, status, onClose }: PhaseDetailPanelProps) {
  return (
    <div className={`phase-detail-panel phase-detail-panel-${status}`} role="region" aria-label={`Details for ${phase.name}`}>
      <div className="phase-detail-header">
        <div className="phase-detail-header-left">
          <span className="phase-detail-order">{phase.order}.</span>
          <span className="phase-detail-name">{phase.name}</span>
          <span className={`phase-detail-status-badge phase-detail-status-badge-${status}`}>{status}</span>
        </div>
        <button
          type="button"
          className="phase-detail-close"
          onClick={onClose}
          aria-label="Close detail panel"
        >
          x
        </button>
      </div>

      <div className="phase-detail-objective">{phase.objective}</div>

      <div className="phase-detail-columns">
        <div className="phase-detail-col">
          <ChecklistSection title="Definition of Ready" items={phase.definitionOfReady} />
          <ChecklistSection title="Definition of Done" items={phase.definitionOfDone} />
        </div>

        <div className="phase-detail-col">
          <div className="phase-detail-section">
            <div className="phase-detail-section-title">Agents</div>
            <div className="phase-detail-tags">
              <span className="phase-detail-tag phase-detail-tag-primary">
                {phase.primaryAgent} (primary)
              </span>
              {phase.supportingAgents.map((agent) => (
                <span key={agent} className="phase-detail-tag phase-detail-tag-supporting">
                  {agent}
                </span>
              ))}
            </div>
          </div>

          <TagList title="Required Artifacts" items={phase.requiredArtifacts} tagClass="phase-detail-tag-artifact" />
          <TagList title="Visualization Types" items={phase.visualizationTypes} tagClass="phase-detail-tag-viz" />
          <TagList title="Skills" items={phase.skills} tagClass="phase-detail-tag-skill" />
          <TagList title="Guardrail Packs" items={phase.guardrailPacks} tagClass="phase-detail-tag-guardrail" />
        </div>

        <div className="phase-detail-col">
          {phase.principles.length > 0 && (
            <div className="phase-detail-section">
              <div className="phase-detail-section-title">Principles</div>
              <div className="phase-detail-principle-list">
                {phase.principles.map((p) => (
                  <PrincipleCard
                    key={p}
                    name={p}
                    applicablePhases={[phase.id]}
                    allPhases={allPhaseIds}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Loop group ────────────────────────────────────────────────────────────────

interface LoopGroupProps {
  loopId: string;
  loopName: string;
  loopDescription: string;
  phases: PhaseData[];
  allPhases: PhaseData[];
  currentPhaseOrder: number;
  selectedPhaseId: string | null;
  onPhaseClick: (phaseId: string) => void;
}

function LoopGroup({
  loopId,
  loopName,
  loopDescription,
  phases,
  allPhases,
  currentPhaseOrder,
  selectedPhaseId,
  onPhaseClick,
}: LoopGroupProps) {
  const themeClass = LOOP_THEME[loopId] ?? 'loop-default'

  return (
    <div className={`loop-group ${themeClass}`} aria-label={loopName}>
      <div className="loop-group-label" title={loopDescription}>{loopName}</div>
      <div className="loop-group-phases">
        {phases.map((phase, idx) => {
          const status = phaseStatus(phase, currentPhaseOrder)
          const isSelected = selectedPhaseId === phase.id
          const isLast = idx === phases.length - 1
          const nextPhaseInLoop = phases[idx + 1]

          return (
            <div key={phase.id} className="loop-phase-slot">
              <PhaseNode
                phase={phase}
                status={status}
                isSelected={isSelected}
                onClick={() => onPhaseClick(phase.id)}
              />
              {!isLast && nextPhaseInLoop && (
                <GateIndicator
                  fromPhase={phase.id}
                  toPhase={nextPhaseInLoop.id}
                  status={gateStatus(phase, currentPhaseOrder)}
                  criteria={phase.definitionOfDone}
                />
              )}
            </div>
          )
        })}

        {/* Cross-loop gate after the last phase of this group */}
        {(() => {
          const lastPhase = phases[phases.length - 1]
          if (!lastPhase?.nextPhase) return null
          const nextPhaseData = allPhases.find((p) => p.id === lastPhase.nextPhase)
          if (!nextPhaseData) return null
          // Only render cross-loop gate if next phase is in a different loop
          if (nextPhaseData.loop === loopId) return null
          return (
            <GateIndicator
              key={`cross-${lastPhase.id}`}
              fromPhase={lastPhase.id}
              toPhase={nextPhaseData.id}
              status={gateStatus(lastPhase, currentPhaseOrder)}
              criteria={lastPhase.definitionOfDone}
            />
          )
        })()}
      </div>
    </div>
  )
}

// ── Root view ─────────────────────────────────────────────────────────────────

export function PhaseLifecycleView({ currentPhase, projectName, onPhaseSelect }: PhaseLifecycleViewProps) {
  const [lifecycle, setLifecycle] = useState<PhaseLifecycle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetch(`${API_BASE}/ontology/phases`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<PhaseLifecycle>
      })
      .then((data) => {
        setLifecycle(data)
        setLoading(false)
      })
      .catch(() => {
        // Fall back to bundled static data when the API is unavailable
        setLifecycle(phaseLifecycleFallback as PhaseLifecycle)
        setLoading(false)
      })
  }, [])

  const handlePhaseClick = useCallback(
    (phaseId: string) => {
      setSelectedPhaseId((prev) => (prev === phaseId ? null : phaseId))
      onPhaseSelect?.(phaseId)
    },
    [onPhaseSelect],
  )

  const handleDetailClose = useCallback(() => {
    setSelectedPhaseId(null)
  }, [])

  if (loading) {
    return (
      <div className="plv-root">
        <div className="plv-loading">Loading phase lifecycle data...</div>
      </div>
    )
  }

  if (error || !lifecycle) {
    return (
      <div className="plv-root">
        <div className="plv-error">
          <div className="plv-error-title">Failed to load lifecycle</div>
          <div className="plv-error-message">{error ?? 'Unknown error'}</div>
        </div>
      </div>
    )
  }

  const allPhases = lifecycle.phases.slice().sort((a, b) => a.order - b.order)
  const allPhaseIds = allPhases.map((p) => p.id)

  const currentPhaseOrder = (() => {
    if (!currentPhase) return 0
    const found = allPhases.find((p) => p.id === currentPhase)
    return found ? found.order : 0
  })()

  const selectedPhase = selectedPhaseId
    ? allPhases.find((p) => p.id === selectedPhaseId) ?? null
    : null

  const selectedStatus: PhaseStatus = selectedPhase
    ? phaseStatus(selectedPhase, currentPhaseOrder)
    : 'pending'

  return (
    <div className="plv-root">
      <div className="plv-header">
        <div className="plv-header-left">
          <span className="plv-title">Phase Lifecycle</span>
          {projectName && (
            <span className="plv-project-name">{projectName}</span>
          )}
        </div>
        {currentPhase && (
          <div className="plv-current-phase-badge">
            Current phase: <strong>{currentPhase}</strong>
          </div>
        )}
      </div>

      <div className="plv-pipeline-scroll">
        <div className="plv-pipeline">
          {lifecycle.loops.map((loop) => {
            const loopPhases = allPhases.filter((p) => p.loop === loop.id)
            return (
              <LoopGroup
                key={loop.id}
                loopId={loop.id}
                loopName={loop.name}
                loopDescription={loop.description}
                phases={loopPhases}
                allPhases={allPhases}
                currentPhaseOrder={currentPhaseOrder}
                selectedPhaseId={selectedPhaseId}
                onPhaseClick={handlePhaseClick}
              />
            )
          })}
        </div>
      </div>

      {selectedPhase && (
        <PhaseDetailPanel
          phase={selectedPhase}
          allPhaseIds={allPhaseIds}
          status={selectedStatus}
          onClose={handleDetailClose}
        />
      )}
    </div>
  )
}
