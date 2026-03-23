import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Compiles a Foundry PRD Shard into a Ralph-compatible workspace structure.
 * Ralph relies on `prd.json`, `progress.txt`, and `AGENTS.md`.
 */
export async function compileShardForRalph(shard, targetDir) {
  // Ensure the target directory exists
  await fs.mkdir(targetDir, { recursive: true });

  // 1. Write the prd.json focusing only on this bounded schema
  const prdData = {
    objective: shard.objective,
    acceptanceCriteria: shard.acceptanceCriteria,
    affectedAreas: shard.blastRadius.impactedSystems,
    verificationPlan: shard.verificationPlan
  };
  await fs.writeFile(
    path.join(targetDir, 'prd.json'),
    JSON.stringify(prdData, null, 2)
  );

  // 2. Clear or initialize progress.txt
  await fs.writeFile(
    path.join(targetDir, 'progress.txt'),
    "Ralph execution initiated. Awaiting first step.\\n"
  );

  // 3. Define the minimal Agent doctrine for this bounded shard
  const agentsMd = `# Ralph Agents

You are a bounded executor.
Role: Builder
Model: Qwen3-Coder (via Model Gateway tunneled to local SSH VLLM)

Rules:
1. Do not rewrite architectural patterns outside ${shard.ownerNodeId}.
2. Adhere to the verification plan: ${shard.verificationPlan.join(', ')}
3. Update progress.txt on every step.
`;
  await fs.writeFile(path.join(targetDir, 'AGENTS.md'), agentsMd);

  console.log(`[ralph-compiler] Shard ${shard.shardId} successfully compiled into ${targetDir}`);
  return { workspacePath: targetDir, ready: true };
}
