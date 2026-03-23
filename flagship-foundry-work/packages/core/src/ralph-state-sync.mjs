import fs from 'node:fs/promises';
import path from 'node:path';
import { applyGraphPatches, loadGraph, saveGraph } from './graph-store.mjs';

/**
 * Synchronizes the progress of a Ralph loop back to the Foundry graph store.
 */
export async function syncRalphStateToFoundry(ecosystemId, shardId, ralphWorkspaceDir) {
  try {
    const progressText = await fs.readFile(path.join(ralphWorkspaceDir, 'progress.txt'), 'utf8');
    
    // We parse whether Ralph claims it's complete, failed, or learned a new rule
    const isComplete = progressText.toLowerCase().includes('all prd items are complete');
    const learnedFailure = progressText.match(/learned:(.*)/i);
    
    console.log(`[ralph-state-sync] Syncing shard ${shardId}. Complete? ${isComplete}`);
    
    const graph = await loadGraph(ecosystemId, ecosystemId);
    const patches = [];
    
    // Example patch: update node status based on executor loop progress tracker
    patches.push({
      op: 'replace',
      path: `status/${shardId}`,
      value: isComplete ? 'verified-complete' : 'in-progress'
    });

    if (learnedFailure && learnedFailure[1]) {
      // Append a rule automatically based on agent failure
      patches.push({
        op: 'add',
        path: `learned-rules/${shardId}`,
        value: learnedFailure[1].trim()
      });
    }

    const patchedGraph = applyGraphPatches(graph, patches);
    await saveGraph(patchedGraph);
    
    return { success: true, isComplete };
  } catch (err) {
    console.error(`[ralph-state-sync] Failed to sync state:`, err);
    return { success: false, error: err.message };
  }
}
