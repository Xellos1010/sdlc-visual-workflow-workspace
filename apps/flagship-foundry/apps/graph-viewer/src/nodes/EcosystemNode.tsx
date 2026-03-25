import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { FoundryNode } from '../types.ts'

interface EcosystemNodeData extends Record<string, unknown> {
  foundryNode: FoundryNode;
  selected?: boolean;
}

export function EcosystemNode({ data, selected }: NodeProps<EcosystemNodeData>) {
  const node = data.foundryNode
  const topology = node.properties.topology as string | undefined
  const projectCount = node.properties.projectCount as number | undefined

  return (
    <div className={`foundry-node ecosystem-node${selected ? ' node-selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
      <div className="node-header ecosystem-header">
        <span className="node-type-label">ECOSYSTEM</span>
      </div>
      <div className="node-body">
        <div className="node-label">{node.name}</div>
        {topology && (
          <div className="node-subtitle">{topology}</div>
        )}
        {projectCount !== undefined && (
          <div className="node-meta">{projectCount} projects</div>
        )}
      </div>
    </div>
  )
}
