import { useEffect, useMemo, useRef, useState } from 'react'
import type { Glossary, GlossaryCategory, GlossaryTerm } from '../types.ts'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4010'

// Raw term shape as received from the API — category is absent since it lives
// on the parent category object.
interface RawGlossaryTerm {
  term: string
  definition: string
  relatedTerms?: string[]
  applicablePhases?: string[]
}

interface RawGlossaryCategory {
  id: string
  name: string
  description?: string
  terms: RawGlossaryTerm[]
}

interface RawGlossary {
  version: string
  source: string
  categories: RawGlossaryCategory[]
}

// Enrich the raw payload by injecting the category id into each term.
function enrichGlossary(raw: RawGlossary): Glossary {
  const categories: GlossaryCategory[] = raw.categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    terms: cat.terms.map((t) => ({
      ...t,
      category: cat.id,
    })),
  }))
  return { version: raw.version, source: raw.source, categories }
}

// Module-level cache so the large JSON is only fetched once per page load.
let cachedGlossary: Glossary | null = null
let pendingFetch: Promise<Glossary> | null = null

function fetchGlossary(): Promise<Glossary> {
  if (cachedGlossary !== null) {
    return Promise.resolve(cachedGlossary)
  }
  if (pendingFetch !== null) {
    return pendingFetch
  }
  pendingFetch = fetch(`${API_BASE}/ontology/glossary`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json() as Promise<RawGlossary>
    })
    .then((raw) => {
      const data = enrichGlossary(raw)
      cachedGlossary = data
      pendingFetch = null
      return data
    })
    .catch((err: unknown) => {
      pendingFetch = null
      throw err
    })
  return pendingFetch
}

export interface UseGlossaryResult {
  categories: GlossaryCategory[]
  allTerms: GlossaryTerm[]
  lookupTerm: (term: string) => GlossaryTerm | undefined
  searchTerms: (query: string) => GlossaryTerm[]
  getTermsForPhase: (phaseId: string) => GlossaryTerm[]
  getTermsForCategory: (categoryId: string) => GlossaryTerm[]
  getTermsForNode: (nodeType: string, nodeTags?: string[]) => GlossaryTerm[]
  loading: boolean
  error: string | null
}

export function useGlossary(): UseGlossaryResult {
  const [glossary, setGlossary] = useState<Glossary | null>(cachedGlossary)
  const [loading, setLoading] = useState<boolean>(cachedGlossary === null)
  const [error, setError] = useState<string | null>(null)

  // Prevent state updates after unmount.
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (cachedGlossary !== null) {
      setGlossary(cachedGlossary)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    fetchGlossary()
      .then((data) => {
        if (!mountedRef.current) return
        setGlossary(data)
      })
      .catch((err: unknown) => {
        if (!mountedRef.current) return
        const msg = err instanceof Error ? err.message : String(err)
        setError(`Failed to load glossary: ${msg}`)
      })
      .finally(() => {
        if (!mountedRef.current) return
        setLoading(false)
      })
  }, [])

  const categories = useMemo<GlossaryCategory[]>(
    () => glossary?.categories ?? [],
    [glossary],
  )

  const allTerms = useMemo<GlossaryTerm[]>(() => {
    if (!glossary) return []
    return glossary.categories.flatMap((cat) => cat.terms)
  }, [glossary])

  // Build a lowercase-keyed lookup map for O(1) term resolution.
  const termMap = useMemo<Map<string, GlossaryTerm>>(() => {
    const map = new Map<string, GlossaryTerm>()
    for (const t of allTerms) {
      map.set(t.term.toLowerCase(), t)
    }
    return map
  }, [allTerms])

  const lookupTerm = useMemo(
    () =>
      (term: string): GlossaryTerm | undefined =>
        termMap.get(term.toLowerCase()),
    [termMap],
  )

  const searchTerms = useMemo(
    () =>
      (query: string): GlossaryTerm[] => {
        if (!query.trim()) return allTerms
        const lower = query.toLowerCase()
        return allTerms.filter((t) => t.term.toLowerCase().includes(lower))
      },
    [allTerms],
  )

  const getTermsForPhase = useMemo(
    () =>
      (phaseId: string): GlossaryTerm[] =>
        allTerms.filter((t) => t.applicablePhases?.includes(phaseId) ?? false),
    [allTerms],
  )

  const getTermsForCategory = useMemo(
    () =>
      (categoryId: string): GlossaryTerm[] => {
        const cat = categories.find((c) => c.id === categoryId)
        return cat ? cat.terms : []
      },
    [categories],
  )

  // Returns glossary terms relevant to a graph node based on its type and tags.
  // Matches terms whose category id contains the node type, or whose related
  // terms list intersects with the node's tags.
  const getTermsForNode = useMemo(
    () =>
      (nodeType: string, nodeTags: string[] = []): GlossaryTerm[] => {
        if (!allTerms.length) return []
        const lowerType = nodeType.toLowerCase()
        const lowerTags = nodeTags.map((t) => t.toLowerCase())
        return allTerms.filter((term) => {
          const lowerTerm = term.term.toLowerCase()
          const lowerCategory = term.category.toLowerCase()
          // Match if the term name or category contains the node type
          if (lowerTerm.includes(lowerType) || lowerCategory.includes(lowerType)) return true
          // Match if any of the node's tags appear in the term or its related terms
          if (lowerTags.some((tag) =>
            lowerTerm.includes(tag) ||
            (term.relatedTerms ?? []).some((rt) => rt.toLowerCase().includes(tag)),
          )) return true
          return false
        }).slice(0, 5)
      },
    [allTerms],
  )

  return {
    categories,
    allTerms,
    lookupTerm,
    searchTerms,
    getTermsForPhase,
    getTermsForCategory,
    getTermsForNode,
    loading,
    error,
  }
}
