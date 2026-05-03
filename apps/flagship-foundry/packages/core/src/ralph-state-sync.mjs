import path from 'node:path';
import { readJson, writeJson, readText, exists } from './io.mjs';
import { transitionPhase } from './continuity.mjs';

/**
 * Parses the Ralph progress.txt log to extract which story IDs Ralph
 * has explicitly reported as completed within its progress entries.
 *
 * Ralph progress entries follow the format:
 *   ## [Date/Time] - [Story ID]
 *
 * @param {string} progressText
 * @returns {Set<string>} Set of story IDs mentioned in progress entries.
 */
function parseCompletedFromProgress(progressText) {
  const completed = new Set();
  // Match lines like: ## 2024-01-01 - US-001
  const entryPattern = /^##\s+[^\-]+-\s*(.+)$/gm;
  let match;
  while ((match = entryPattern.exec(progressText)) !== null) {
    const storyId = match[1].trim();
    if (storyId) {
      completed.add(storyId);
    }
  }
  return completed;
}

/**
 * Reads the prd.json at prdPath and applies progress from the sibling
 * progress.txt back into Foundry continuity state.
 *
 * For each story where `passes === true` (set by Ralph after it verifies a
 * story), the sync marks it completed in the report. When ALL stories pass,
 * the Foundry project is transitioned to the `verify` phase.
 *
 * @param {string} prdPath     - Absolute path to the Ralph prd.json file.
 * @param {string} projectName - Foundry project name (used for continuity state).
 * @returns {Promise<object>}  Sync report:
 *   { totalStories, completed, remaining, syncedTasks, allComplete }
 */
export async function syncRalphProgress(prdPath, projectName) {
  const prdDir = path.dirname(prdPath);
  const progressPath = path.join(prdDir, 'progress.txt');

  // Load PRD
  const prd = await readJson(prdPath);
  const stories = Array.isArray(prd.userStories) ? prd.userStories : [];

  // Load progress log (optional — Ralph may not have started yet)
  let progressText = '';
  if (await exists(progressPath)) {
    progressText = await readText(progressPath);
  } else {
    console.warn(`[ralph-state-sync] progress.txt not found at ${progressPath} — relying on prd.json passes flags only.`);
  }

  const mentionedInProgress = parseCompletedFromProgress(progressText);

  // A story is considered complete when EITHER:
  //   - prd.json has passes === true (Ralph updated it directly), OR
  //   - the story ID appears in a progress.txt entry heading
  const syncedTasks = [];
  const remainingTasks = [];

  for (const story of stories) {
    const passesInPrd = story.passes === true;
    const mentionedInLog = mentionedInProgress.has(story.id);
    const isComplete = passesInPrd || mentionedInLog;

    if (isComplete) {
      syncedTasks.push({
        id: story.id,
        title: story.title,
        source: passesInPrd ? 'prd-passes' : 'progress-log'
      });
    } else {
      remainingTasks.push({ id: story.id, title: story.title });
    }
  }

  const totalStories = stories.length;
  const completed = syncedTasks.length;
  const remaining = remainingTasks.length;
  const allComplete = totalStories > 0 && remaining === 0;

  console.log(
    `[ralph-state-sync] Project "${projectName}": ${completed}/${totalStories} stories complete.`
  );

  // Transition Foundry project phase when everything passes
  if (allComplete && projectName) {
    try {
      await transitionPhase(
        projectName,
        'verify',
        `All ${totalStories} Ralph stories passed. Transitioning to verify phase.`
      );
      console.log(`[ralph-state-sync] Transitioned "${projectName}" to verify phase.`);
    } catch (err) {
      console.warn(
        `[ralph-state-sync] Could not transition phase for "${projectName}": ${err.message}`
      );
    }
  }

  const report = {
    totalStories,
    completed,
    remaining,
    syncedTasks,
    remainingTasks,
    allComplete
  };

  return report;
}
