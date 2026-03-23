import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Edge, NodeMouseHandler, NodeTypes } from '@xyflow/react'
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import './App.css'
import { EcosystemNode } from './nodes/EcosystemNode.tsx'
import { SystemNode } from './nodes/SystemNode.tsx'
import { ProjectNode } from './nodes/ProjectNode.tsx'
import { DefaultNode } from './nodes/DefaultNode.tsx'
import { buildHierarchicalLayout } from './layout.ts'
import type { EcosystemGraph, EcosystemManifest, FoundryEdge, FoundryNode } from './types.ts'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4010'

const NODE_TYPES: NodeTypes = {
  ecosystemNode: EcosystemNode,
  systemNode: SystemNode,
  projectNode: ProjectNode,
  defaultNode: DefaultNode,
}

function typeBadgeClass(type: string): string {
  const known = [
    'ecosystem', 'system', 'project', 'framework', 'platform',
    'rule-pack', 'environment', 'diagram', 'repo',
  ]
  return known.includes(type) ? `type-badge-${type}` : 'type-badge-default'
}

interface SelectedNodeInfo {
  foundryNode: FoundryNode;
  inbound: FoundryEdge[];
  outbound: FoundryEdge[];
}

// ── Detail Panel ─────────────────────────────────────────────────────────────

interface DetailPanelProps {
  info: SelectedNodeInfo | null;
  onClose: () => void;
}

function DetailPanel({ info, onClose }: DetailPanelProps) {
  return (
    <div className="detail-panel">
      <div className="detail-panel-header">
        <span className="detail-panel-title">Node Details</span>
        {info && (
          <button className="detail-panel-close" onClick={onClose} aria-label="Close panel">
            x
          </button>
        )}
      </div>
      <div className="detail-panel-body">
        {!info ? (
          <div className="detail-empty">
            <div className="detail-empty-title">No node selected</div>
            <div className="detail-empty-sub">Click a node in the graph to inspect its details</div>
          </div>
        ) : (
          <NodeDetail info={info} />
        )}
      </div>
    </div>
  )
}

function NodeDetail({ info }: { info: SelectedNodeInfo }) {
  const { foundryNode, inbound, outbound } = info
  const props = foundryNode.properties

  return (
    <>
      <div className="detail-node-name">{foundryNode.name}</div>
      <span className={`detail-node-type ${typeBadgeClass(foundryNode.type)}`}>
        {foundryNode.type}
      </span>

      <div className="detail-section-title">ID</div>
      <div className="detail-kv-list">
        <div className="detail-kv-row">
          <span className="detail-kv-value" style={{ fontSize: '11px' }}>{foundryNode.id}</span>
        </div>
      </div>

      {Object.keys(props).length > 0 && (
        <>
          <div className="detail-section-title">Properties</div>
          <div className="detail-kv-list">
            {Object.entries(props).map(([key, val]) => (
              <div className="detail-kv-row" key={key}>
                <span className="detail-kv-key">{key}</span>
                <span className="detail-kv-value">{String(val)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {foundryNode.tags.length > 0 && (
        <>
          <div className="detail-section-title">Tags</div>
          <div className="detail-tags">
            {foundryNode.tags.map((tag) => (
              <span className="detail-tag" key={tag}>{tag}</span>
            ))}
          </div>
        </>
      )}

      {foundryNode.refs.length > 0 && (
        <>
          <div className="detail-section-title">Refs</div>
          <div className="detail-tags">
            {foundryNode.refs.map((ref) => (
              <span className="detail-tag" key={ref}>{ref}</span>
            ))}
          </div>
        </>
      )}

      {outbound.length > 0 && (
        <>
          <div className="detail-section-title">Outgoing Edges ({outbound.length})</div>
          <div className="detail-edge-list">
            {outbound.map((edge, i) => (
              <div className="detail-edge-item" key={edge.id ?? `out-${i}`}>
                <div className="detail-edge-direction">to</div>
                <div className="detail-edge-target">{edge.target}</div>
                {edge.label && <div className="detail-edge-label">{edge.label}</div>}
                {edge.type && <div className="detail-edge-label">{edge.type}</div>}
              </div>
            ))}
          </div>
        </>
      )}

      {inbound.length > 0 && (
        <>
          <div className="detail-section-title">Incoming Edges ({inbound.length})</div>
          <div className="detail-edge-list">
            {inbound.map((edge, i) => (
              <div className="detail-edge-item" key={edge.id ?? `in-${i}`}>
                <div className="detail-edge-direction">from</div>
                <div className="detail-edge-target">{edge.source}</div>
                {edge.label && <div className="detail-edge-label">{edge.label}</div>}
                {edge.type && <div className="detail-edge-label">{edge.type}</div>}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}

// ── Root App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [ecosystems, setEcosystems] = useState<EcosystemManifest[]>([])
  const [ecosystemsLoading, setEcosystemsLoading] = useState(true)
  const [ecosystemsError, setEcosystemsError] = useState<string | null>(null)

  const [selectedEcosystemId, setSelectedEcosystemId] = useState<string>('')
  const [graph, setGraph] = useState<EcosystemGraph | null>(null)
  const [graphLoading, setGraphLoading] = useState(false)
  const [graphError, setGraphError] = useState<string | null>(null)

  const [selectedNodeInfo, setSelectedNodeInfo] = useState<SelectedNodeInfo | null>(null)

  // Fetch ecosystem list on mount
  useEffect(() => {
    setEcosystemsLoading(true)
    setEcosystemsError(null)
    fetch(`${API_BASE}/ecosystems`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<EcosystemManifest[]>
      })
      .then((data) => {
        setEcosystems(data)
        if (data.length > 0) {
          setSelectedEcosystemId(data[0].id ?? '')
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        setEcosystemsError(`Failed to load ecosystems: ${msg}`)
      })
      .finally(() => setEcosystemsLoading(false))
  }, [])

  // Fetch graph when ecosystem selection changes
  useEffect(() => {
    if (!selectedEcosystemId) {
      setGraph(null)
      return
    }
    setGraphLoading(true)
    setGraphError(null)
    setSelectedNodeInfo(null)
    fetch(`${API_BASE}/ecosystems/${encodeURIComponent(selectedEcosystemId)}/graph`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<EcosystemGraph>
      })
      .then((data) => setGraph(data))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        setGraphError(`Failed to load graph: ${msg}`)
      })
      .finally(() => setGraphLoading(false))
  }, [selectedEcosystemId])

  // Convert Foundry graph data into React Flow nodes and edges
  const { rfNodes, rfEdges } = useMemo(() => {
    if (!graph) return { rfNodes: [], rfEdges: [] }

    const rfNodes = buildHierarchicalLayout(graph.nodes)

    const rfEdges: Edge[] = graph.edges.map((edge, index) => ({
      id: edge.id ?? `edge-${index}`,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'default',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 12,
        height: 12,
        color: '#4b5563',
      },
      style: { stroke: '#4b5563', strokeWidth: 1.5 },
      labelStyle: { fill: '#94a3b8', fontSize: 11 },
      labelBgStyle: { fill: '#1a1d27' },
    }))

    return { rfNodes, rfEdges }
  }, [graph])

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      if (!graph) return
      const foundryNode = graph.nodes.find((n) => n.id === node.id)
      if (!foundryNode) return

      const inbound = graph.edges.filter((e) => e.target === node.id)
      const outbound = graph.edges.filter((e) => e.source === node.id)

      setSelectedNodeInfo({ foundryNode, inbound, outbound })
    },
    [graph],
  )

  const handlePaneClick = useCallback(() => {
    setSelectedNodeInfo(null)
  }, [])

  const toolbarStatus = ecosystemsLoading
    ? 'Loading ecosystems...'
    : ecosystemsError
      ? ecosystemsError
      : graphLoading
        ? `Loading graph for ${selectedEcosystemId}...`
        : graph
          ? `${graph.nodes.length} nodes, ${graph.edges.length} edges`
          : ''

  const toolbarStatusError = !!(ecosystemsError || graphError)

  return (
    <div className="app-shell">
      <div className="app-toolbar">
        <span className="app-title">Foundry Graph Viewer</span>
        <div className="toolbar-separator" />
        <span className="ecosystem-select-label">Ecosystem:</span>
        <select
          className="ecosystem-select"
          value={selectedEcosystemId}
          onChange={(e) => setSelectedEcosystemId(e.target.value)}
          disabled={ecosystemsLoading || ecosystems.length === 0}
        >
          {ecosystems.length === 0 && !ecosystemsLoading && (
            <option value="">No ecosystems found</option>
          )}
          {ecosystems.map((eco) => (
            <option key={eco.id} value={eco.id ?? ''}>
              {(eco.name as string) ?? eco.id}
            </option>
          ))}
        </select>
        <span className={`toolbar-status${toolbarStatusError ? ' error' : ''}`}>
          {toolbarStatus}
        </span>
      </div>

      <div className="app-content">
        <div className="graph-canvas">
          {!selectedEcosystemId && !ecosystemsLoading && (
            <div className="graph-placeholder">
              <div className="graph-placeholder-title">Select an ecosystem</div>
              <div className="graph-placeholder-sub">Choose an ecosystem from the toolbar to explore its graph</div>
            </div>
          )}
          {graphLoading && (
            <div className="graph-loading">Loading graph...</div>
          )}
          {graphError && !graphLoading && (
            <div className="graph-error">
              <div className="graph-error-title">Failed to load graph</div>
              <div className="graph-error-message">{graphError}</div>
            </div>
          )}
          {!graphLoading && !graphError && rfNodes.length > 0 && (
            <ReactFlow
              nodes={rfNodes}
              edges={rfEdges}
              nodeTypes={NODE_TYPES}
              onNodeClick={handleNodeClick}
              onPaneClick={handlePaneClick}
              fitView
              fitViewOptions={{ padding: 0.15 }}
              minZoom={0.1}
              maxZoom={2}
              proOptions={{ hideAttribution: true }}
            >
              <Controls />
              <Background
                variant={BackgroundVariant.Dots}
                gap={20}
                size={1}
                color="#2d3148"
              />
              <MiniMap
                nodeColor={minimapNodeColor}
                maskColor="rgba(15, 17, 23, 0.75)"
              />
            </ReactFlow>
          )}
        </div>

        <DetailPanel
          info={selectedNodeInfo}
          onClose={() => setSelectedNodeInfo(null)}
        />
      </div>
    </div>
  )
}

function minimapNodeColor(node: { type?: string }): string {
  switch (node.type) {
    case 'ecosystemNode': return '#3b5bdb'
    case 'systemNode': return '#0369a1'
    case 'projectNode': return '#16a34a'
    default: return '#7c3aed'
  }
}
