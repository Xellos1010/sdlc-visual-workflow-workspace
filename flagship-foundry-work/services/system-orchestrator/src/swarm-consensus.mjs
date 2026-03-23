import { getAdapter } from '../../../packages/runtime-adapters/src/registry.mjs';

/**
 * Executes a Model Swarm Consensus pipeline for a specific plan.
 * Specifier -> Architect -> Adversary -> Verifier
 */
export async function executeSwarmConsensus(plan) {
  const shards = [];

  for (const projectPlan of plan.projectPlans) {
    for (const phase of projectPlan.phases) {
      console.log(`[swarm-consensus] Executing phase: ${phase} for project ${projectPlan.name}`);
      
      let adapter;
      if (phase === 'inspect' || phase === 'propose') {
        // Architect
        adapter = getAdapter('claudeCode');
        console.log(`[swarm-consensus] -> Assigned to Specifier/Architect (${adapter.name})`);
      } else if (phase.startsWith('challenge')) {
        // Adversary
        adapter = getAdapter('claudeCode'); // Different logical persona using the same adapter
        console.log(`[swarm-consensus] -> Assigned to Adversary Analyst (${adapter.name})`);
      } else if (phase.startsWith('reconcile')) {
        // Reconciler
        adapter = getAdapter('cursor');
        console.log(`[swarm-consensus] -> Assigned to Reconciler (${adapter.name})`);
      } else if (phase === 'verify') {
        adapter = getAdapter('codex');
        console.log(`[swarm-consensus] -> Assigned to Verifier (${adapter.name})`);
      } else if (phase === 'design') {
        console.log(`[swarm-consensus] -> Generating PRD Shards & Diagrams...`);
        shards.push({
          shardId: `shard-${Date.now()}`,
          ownerNodeId: projectPlan.projectId,
          objective: plan.objective,
          acceptanceCriteria: ["All unit tests pass", "Component renders properly"],
          blastRadius: { impactedSystems: [projectPlan.projectId], couplingRisk: "low" },
          verificationPlan: ["Run npm test"]
        });
      }
      
      // Simulating time to execute swarm step
      await new Promise(r => setTimeout(r, 200));
    }
  }

  return { complete: true, shardsGenerated: shards };
}
