import type { Node } from '@xyflow/react'
import type { FoundryNode } from './types.ts'

const NODE_WIDTH = 220
const NODE_HEIGHT = 90
const H_GAP = 40
const V_GAP = 80

// Ordered tiers for hierarchical layout — types not listed fall into the last tier
const TYPE_TIER: Record<string, number> = {
  ecosystem: 0,
  repo: 1,
  system: 2,
  project: 3,
  framework: 4,
  platform: 4,
  'rule-pack': 5,
  environment: 5,
  diagram: 5,
}

function getTier(type: string): number {
  return TYPE_TIER[type] ?? 6
}

export function buildHierarchicalLayout(foundryNodes: FoundryNode[]): Node[] {
  // Group nodes by tier
  const tiers = new Map<number, FoundryNode[]>()
  for (const node of foundryNodes) {
    const tier = getTier(node.type)
    const existing = tiers.get(tier)
    if (existing) {
      existing.push(node)
    } else {
      tiers.set(tier, [node])
    }
  }

  const sortedTiers = Array.from(tiers.keys()).sort((a, b) => a - b)

  const result: Node[] = []
  let currentY = 0

  for (const tier of sortedTiers) {
    const nodesInTier = tiers.get(tier) ?? []
    const totalWidth = nodesInTier.length * NODE_WIDTH + (nodesInTier.length - 1) * H_GAP
    const startX = -(totalWidth / 2)

    for (let i = 0; i < nodesInTier.length; i++) {
      const foundryNode = nodesInTier[i]
      result.push({
        id: foundryNode.id,
        type: mapToReactFlowType(foundryNode.type),
        position: {
          x: startX + i * (NODE_WIDTH + H_GAP),
          y: currentY,
        },
        data: {
          foundryNode,
        },
        style: {
          width: NODE_WIDTH,
          minHeight: NODE_HEIGHT,
        },
      })
    }

    currentY += NODE_HEIGHT + V_GAP
  }

  return result
}

export function mapToReactFlowType(nodeType: string): string {
  switch (nodeType) {
    case 'ecosystem':
      return 'ecosystemNode'
    case 'system':
      return 'systemNode'
    case 'project':
      return 'projectNode'
    default:
      return 'defaultNode'
  }
}
