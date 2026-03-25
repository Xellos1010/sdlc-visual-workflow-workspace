import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { FoundryNode } from '../types.ts'

interface SystemNodeData extends Record<string, unknown> {
  foundryNode: FoundryNode;
  selected?: boolean;
}

export function SystemNode({ data, selected }: NodeProps<SystemNodeData>) {
  const node = data.foundryNode
  const nodePath = node.properties.path as string | undefined
  const projectCount = node.properties.projectCount as number | undefined

  return (
    <div className={`foundry-node system-node${selected ? ' node-selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
      <div className="node-header system-header">
        <span className="node-type-label">SYSTEM</span>
      </div>
      <div className="node-body">
        <div className="node-label">{node.name}</div>
        {nodePath && (
          <div className="node-subtitle">{nodePath}</div>
        )}
        {projectCount !== undefined && (
          <div className="node-meta">{projectCount} projects</div>
        )}
      </div>
    </div>
  )
}
