import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { FoundryNode } from '../types.ts'

interface DefaultNodeData extends Record<string, unknown> {
  foundryNode: FoundryNode;
  selected?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  framework: 'FRAMEWORK',
  platform: 'PLATFORM',
  'rule-pack': 'RULE PACK',
  environment: 'ENVIRONMENT',
  diagram: 'DIAGRAM',
  repo: 'REPO',
}

export function DefaultNode({ data, selected }: NodeProps<DefaultNodeData>) {
  const node = data.foundryNode
  const typeLabel = TYPE_LABELS[node.type] ?? node.type.toUpperCase()
  const nodePath = node.properties.path as string | undefined
  const version = node.properties.version as string | undefined

  return (
    <div className={`foundry-node default-node default-node-${node.type}${selected ? ' node-selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
      <div className="node-header default-header">
        <span className="node-type-label">{typeLabel}</span>
      </div>
      <div className="node-body">
        <div className="node-label">{node.name}</div>
        {nodePath && (
          <div className="node-subtitle">{nodePath}</div>
        )}
        {version && (
          <div className="node-meta">v{version}</div>
        )}
      </div>
    </div>
  )
}
