import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { FoundryNode } from '../types.ts'

interface ProjectNodeData extends Record<string, unknown> {
  foundryNode: FoundryNode;
  selected?: boolean;
}

export function ProjectNode({ data, selected }: NodeProps<ProjectNodeData>) {
  const node = data.foundryNode
  const nodePath = node.properties.path as string | undefined
  const framework = node.properties.framework as string | undefined

  return (
    <div className={`foundry-node project-node${selected ? ' node-selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
      <div className="node-header project-header">
        <span className="node-type-label">PROJECT</span>
      </div>
      <div className="node-body">
        <div className="node-label">{node.name}</div>
        {nodePath && (
          <div className="node-subtitle">{nodePath}</div>
        )}
        {framework && (
          <div className="node-meta">{framework}</div>
        )}
      </div>
    </div>
  )
}
