import path from 'node:path';
import { readJson, writeJson, slugify } from './io.mjs';

/**
 * Derives a branch name suggestion from a task title and id.
 *
 * @param {string} taskId
 * @param {string} title
 * @returns {string}
 */
function branchName(taskId, title) {
  const shortId = taskId.split(':').pop() ?? taskId;
  return `ralph/${slugify(shortId)}-${slugify(title).slice(0, 40)}`;
}

/**
 * Extracts all tasks from a Foundry plan into a flat array.
 *
 * Supports two plan shapes:
 *   - createPlan() output: { projectPlans: [{ tasks: [...] }] }
 *   - scope-chunker output: { workOrders: [...] }
 *
 * @param {object} plan
 * @returns {Array<object>}
 */
function extractTasks(plan) {
  // createPlan() shape
  if (Array.isArray(plan.projectPlans)) {
    return plan.projectPlans.flatMap((projectPlan) => projectPlan.tasks ?? []);
  }

  // scope-chunker / sample-plan shape
  if (Array.isArray(plan.workOrders)) {
    return plan.workOrders.map((wo) => ({
      id: wo.workOrderId,
      title: `${wo.agentRole ?? wo.lifecycleStage} — ${wo.systemId ?? ''}`.trim(),
      acceptanceCriteria: wo.acceptanceCriteria ?? [],
      phase: wo.lifecycleStage ?? 'implement'
    }));
  }

  return [];
}

/**
 * Converts a single Foundry task into a Ralph user story entry.
 *
 * @param {object} task
 * @param {number} index - Zero-based position, used as the story priority.
 * @returns {object}
 */
function taskToStory(task, index) {
  const title = task.title ?? task.phase ?? `Task ${index + 1}`;
  const description =
    task.objective ??
    task.description ??
    `Implement: ${title}`;

  return {
    id: task.id ?? `story-${index + 1}`,
    title,
    description,
    acceptanceCriteria: Array.isArray(task.acceptanceCriteria) ? task.acceptanceCriteria : [],
    priority: index + 1,
    branch: branchName(task.id ?? `story-${index + 1}`, title),
    passes: false,
    notes: ''
  };
}

/**
 * Compiles a Foundry plan JSON file into a Ralph-compatible PRD object.
 *
 * The plan is read from `planPath`. If `options.outputPath` is provided the
 * compiled PRD is written there; otherwise it is only returned.
 *
 * @param {string} planPath    - Absolute or relative path to the plan JSON file.
 * @param {object} [options]
 * @param {string} [options.outputPath] - Where to write the prd.json output.
 * @returns {Promise<object>}  The compiled Ralph PRD object.
 */
export async function compilePlanToRalph(planPath, options = {}) {
  const plan = await readJson(planPath);

  const tasks = extractTasks(plan);

  if (tasks.length === 0) {
    console.warn('[ralph-compiler] No tasks found in plan — PRD will have empty userStories.');
  }

  const userStories = tasks.map((task, index) => taskToStory(task, index));

  const planTitle = plan.title ?? plan.planId ?? path.basename(planPath, '.json');
  const firstBranch = userStories[0]?.branch ?? `ralph/${slugify(planTitle)}`;

  const prd = {
    project: planTitle,
    branchName: firstBranch,
    description: plan.objective ?? `Foundry plan: ${planTitle}`,
    userStories
  };

  if (options.outputPath) {
    await writeJson(options.outputPath, prd);
    console.log(`[ralph-compiler] Wrote Ralph PRD to ${options.outputPath} (${userStories.length} stories)`);
  }

  return prd;
}
