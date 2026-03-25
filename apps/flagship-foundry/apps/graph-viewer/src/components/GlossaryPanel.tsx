import { useCallback, useRef, useState } from 'react'
import type { GlossaryCategory, GlossaryTerm } from '../types.ts'
import { useGlossary } from '../hooks/useGlossary.ts'

export interface GlossaryPanelProps {
  isOpen: boolean
  onClose: () => void
  filterPhase?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPhaseId(id: string): string {
  return id.charAt(0).toUpperCase() + id.slice(1)
}

// ── TermItem ──────────────────────────────────────────────────────────────────

interface TermItemProps {
  term: GlossaryTerm
  termRefs: React.MutableRefObject<Map<string, HTMLDivElement>>
  onRelatedClick: (term: string) => void
}

function TermItem({ term, termRefs, onRelatedClick }: TermItemProps) {
  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (el) {
        termRefs.current.set(term.term.toLowerCase(), el)
      } else {
        termRefs.current.delete(term.term.toLowerCase())
      }
    },
    [term.term, termRefs],
  )

  return (
    <div
      ref={setRef}
      className="glossary-term-item"
    >
      <div className="glossary-term-name">{term.term}</div>
      <div className="glossary-term-definition">{term.definition}</div>

      {term.applicablePhases && term.applicablePhases.length > 0 && (
        <div className="glossary-term-phases">
          {term.applicablePhases.map((phase) => (
            <span key={phase} className="glossary-phase-badge">
              {formatPhaseId(phase)}
            </span>
          ))}
        </div>
      )}

      {term.relatedTerms && term.relatedTerms.length > 0 && (
        <div className="glossary-term-related">
          <span className="glossary-related-label">Related: </span>
          {term.relatedTerms.map((related, idx) => (
            <span key={related}>
              <button
                className="glossary-related-link"
                onClick={() => onRelatedClick(related)}
                type="button"
              >
                {related}
              </button>
              {idx < (term.relatedTerms?.length ?? 0) - 1 && (
                <span className="glossary-related-sep">, </span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── CategorySection ───────────────────────────────────────────────────────────

interface CategorySectionProps {
  category: GlossaryCategory
  visibleTerms: GlossaryTerm[]
  termRefs: React.MutableRefObject<Map<string, HTMLDivElement>>
  onRelatedClick: (term: string) => void
}

function CategorySection({ category, visibleTerms, termRefs, onRelatedClick }: CategorySectionProps) {
  const [expanded, setExpanded] = useState(true)

  if (visibleTerms.length === 0) return null

  return (
    <div className="glossary-category">
      <button
        className="glossary-category-header"
        onClick={() => setExpanded((prev) => !prev)}
        type="button"
        aria-expanded={expanded}
      >
        <span className="glossary-category-name">{category.name}</span>
        <span className="glossary-category-count">{visibleTerms.length}</span>
        <span className="glossary-category-chevron" aria-hidden="true">
          {expanded ? '\u25BE' : '\u25B8'}
        </span>
      </button>

      {expanded && (
        <div className="glossary-category-terms">
          {visibleTerms.map((term) => (
            <TermItem
              key={term.term}
              term={term}
              termRefs={termRefs}
              onRelatedClick={onRelatedClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── GlossaryPanel ─────────────────────────────────────────────────────────────

export function GlossaryPanel({ isOpen, onClose, filterPhase }: GlossaryPanelProps) {
  const { categories, searchTerms, getTermsForPhase, loading, error } = useGlossary()
  const [query, setQuery] = useState('')
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const termRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Determine which terms to show: if filterPhase is set, restrict to phase first.
  const phaseFilteredTerms = filterPhase ? getTermsForPhase(filterPhase) : null
  const matchedTerms = searchTerms(query)

  const visibleTerms = phaseFilteredTerms
    ? matchedTerms.filter((t) =>
        phaseFilteredTerms.some((pt) => pt.term === t.term),
      )
    : matchedTerms

  const totalVisible = visibleTerms.length

  const handleRelatedClick = useCallback((relatedTerm: string) => {
    const key = relatedTerm.toLowerCase().replace(/\s+/g, '-')
    // Try exact key first, then fall back to a scan.
    let el = termRefs.current.get(key)
    if (!el) {
      for (const [k, node] of termRefs.current.entries()) {
        if (k.includes(relatedTerm.toLowerCase()) || relatedTerm.toLowerCase().includes(k)) {
          el = node
          break
        }
      }
    }
    if (el && scrollContainerRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      el.classList.add('glossary-term-highlight')
      setTimeout(() => el?.classList.remove('glossary-term-highlight'), 1500)
    }
  }, [])

  if (!isOpen) return null

  return (
    <div className="glossary-panel" role="complementary" aria-label="Glossary">
      <div className="glossary-panel-header">
        <div className="glossary-panel-title-row">
          <span className="glossary-panel-title">Glossary</span>
          <button
            className="glossary-panel-close"
            onClick={onClose}
            type="button"
            aria-label="Close glossary panel"
          >
            x
          </button>
        </div>
        {!loading && !error && (
          <div className="glossary-panel-count">
            {totalVisible} term{totalVisible !== 1 ? 's' : ''}
            {filterPhase ? ` in ${formatPhaseId(filterPhase)}` : ''}
          </div>
        )}
        <input
          className="glossary-search-input"
          type="search"
          placeholder="Search terms..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search glossary terms"
        />
      </div>

      <div className="glossary-panel-body" ref={scrollContainerRef}>
        {loading && (
          <div className="glossary-state-msg">Loading glossary...</div>
        )}
        {error && !loading && (
          <div className="glossary-state-msg glossary-state-error">{error}</div>
        )}
        {!loading && !error && visibleTerms.length === 0 && (
          <div className="glossary-state-msg">No terms match your search.</div>
        )}
        {!loading && !error && categories.map((cat) => {
          const catTerms = visibleTerms.filter((t) => t.category === cat.id)
          return (
            <CategorySection
              key={cat.id}
              category={cat}
              visibleTerms={catTerms}
              termRefs={termRefs}
              onRelatedClick={handleRelatedClick}
            />
          )
        })}
      </div>
    </div>
  )
}
