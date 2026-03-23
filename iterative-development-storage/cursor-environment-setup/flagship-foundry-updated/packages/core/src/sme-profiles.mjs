import path from 'node:path';
import { ensureDir, makeId, writeJson } from './io.mjs';

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function buildProfile({ domain, title, ecosystem, sources, rules, projects, questions, heuristics, designPrinciples }) {
  return {
    id: makeId('sme', `${ecosystem.id}-${domain}`),
    domain,
    title,
    ecosystemId: ecosystem.id,
    intent: `Provide deterministic planning, implementation, verification, and blast-radius guidance for ${title}.`,
    detectedFrom: unique(sources),
    mappedRuleIds: unique(rules.map((rule) => rule.id)),
    relatedProjectIds: unique(projects.map((project) => project.id)),
    mandatoryQuestions: questions,
    blastRadiusChecklist: heuristics,
    designPrinciples,
    artifactExpectations: [
      'plan fragment with impacted components and interfaces',
      'verification commands and evidence bundle requirements',
      'handoff update and fix-memory candidate when defects are found'
    ],
    trainingSignals: [
      'resolved bugs',
      'verification failures',
      'telemetry regressions',
      'handoff gaps',
      'blast-radius misses'
    ]
  };
}

export function generateSmeProfiles({ ecosystem }) {
  const rules = ecosystem.ruleFiles ?? [];
  const projects = ecosystem.projects ?? [];
  const frameworks = ecosystem.frameworks ?? [];
  const chromeProjects = projects.filter((project) => project.platformIds.includes('platform:chrome-extension-mv3'));
  const nodeProjects = projects.filter((project) => project.platformIds.includes('platform:node-runtime'));
  const observabilityRules = rules.filter((rule) => rule.path.includes('/10-observability/'));
  const chromeRules = rules.filter((rule) => rule.path.includes('/15-chome-extension/'));
  const nxRules = rules.filter((rule) => /nx|architecture/.test(rule.path));
  const workflowRules = rules.filter((rule) => rule.path.includes('/03-workflow/'));
  const webAutomationRules = rules.filter((rule) => rule.path.includes('/16-web-automation/'));
  const testingRules = rules.filter((rule) => rule.path.includes('/04-testing/'));

  const profiles = [];

  if (ecosystem.topology.kind === 'nx-monorepo') {
    profiles.push(
      buildProfile({
        domain: 'nx-monorepo',
        title: 'Nx Monorepo Cartographer',
        ecosystem,
        sources: ['nx.json', 'pnpm-workspace.yaml', 'project.json', 'workspace package.json'],
        rules: [...nxRules, ...workflowRules],
        projects,
        questions: [
          'Which apps, libs, and tools are touched directly or transitively?',
          'Which shared libraries or path aliases create cross-project coupling?',
          'Which Nx targets must pass before the plan can move to verified?'
        ],
        heuristics: [
          'Include all dependent libs resolved from path aliases and shared scopes.',
          'Expand impact to sibling projects with the same tags when changing shared patterns.',
          'Prefer affected targets first, but widen to same-scope projects when the change touches runbooks, generators, or shared libraries.'
        ],
        designPrinciples: [
          'treat project graph and tags as first-class blast-radius signals',
          'separate apps, libs, and tools responsibilities',
          'keep target and verification surfaces explicit'
        ]
      })
    );
  }

  if (chromeProjects.length > 0) {
    profiles.push(
      buildProfile({
        domain: 'chrome-extension-mv3',
        title: 'Chrome Extension MV3 SME',
        ecosystem,
        sources: ['manifest v3 patterns', 'service_worker/content/popup/sidepanel file layout', 'Chrome API documentation bundle'],
        rules: [...chromeRules, ...testingRules, ...webAutomationRules],
        projects: chromeProjects,
        questions: [
          'Does the change touch service worker, content script, popup, side panel, storage, permissions, or messaging contracts?',
          'Which Chrome APIs are in scope and what manifest or permission updates follow from the change?',
          'Does the plan cover state rehydration, sidepanel-view synchronization, and service worker lifecycle behavior?'
        ],
        heuristics: [
          'Whenever service worker logic changes, inspect sidepanel, popup, content script, storage, and message contracts in the same plan.',
          'When host permissions or declarative APIs change, inspect all sibling extension apps and shared extension libraries.',
          'When watch or inspector flows change, include overlay, scheduler, metrics, logs, and regression e2e slices.'
        ],
        designPrinciples: [
          'background owns orchestration and durable state',
          'UI surfaces are views over background state',
          'content scripts stay narrow and observable',
          'permission scope stays least-privilege'
        ]
      })
    );
  }

  if (frameworks.some((framework) => framework.id === 'framework:react')) {
    profiles.push(
      buildProfile({
        domain: 'react-vite-ui',
        title: 'React + Vite UI SME',
        ecosystem,
        sources: ['root package.json', 'tsx entrypoints', 'vite configuration'],
        rules: rules.filter((rule) => rule.path.includes('/13-ux/') || rule.path.includes('/01-code-standards/') || rule.path.includes('/04-testing/')),
        projects: projects.filter((project) => project.frameworkIds.includes('framework:react')),
        questions: [
          'Which surfaces render the affected state and where is source-of-truth stored?',
          'What tests prove the user-visible contract after the change?',
          'What shared UI primitives or design tokens should receive the same update?'
        ],
        heuristics: [
          'Treat shared components and design tokens as blast-radius parents.',
          'When a state contract changes, widen to all surfaces that consume that contract.',
          'Prefer background state authority over local UI-only state for operator tooling.'
        ],
        designPrinciples: [
          'shared UI contracts before one-off fixes',
          'observable state flows',
          'test user journeys as well as local components'
        ]
      })
    );
  }

  if (nodeProjects.length > 0) {
    profiles.push(
      buildProfile({
        domain: 'typescript-node-runtime',
        title: 'TypeScript + Node Runtime SME',
        ecosystem,
        sources: ['package.json engines', 'tsconfig files', 'Node platform rules'],
        rules: rules.filter((rule) => rule.path.includes('/01-code-standards/') || rule.path.includes('/07-apis/') || rule.path.includes('/08-infrastructure/')),
        projects: nodeProjects,
        questions: [
          'What runtime contracts, timeouts, retries, and logging semantics are in scope?',
          'Which structured errors and config boundaries need to stay stable?',
          'Which verification commands prove backward compatibility?'
        ],
        heuristics: [
          'Expand impact to shared config and logger utilities when runtime behavior changes.',
          'Favor contract and timeout regressions over superficial code diffs.',
          'Include observability and API schemas in the same verification slice.'
        ],
        designPrinciples: [
          'typed contracts and explicit error semantics',
          'structured logging and measurable retries',
          'configuration as artifact authority'
        ]
      })
    );
  }

  if (observabilityRules.length > 0) {
    profiles.push(
      buildProfile({
        domain: 'telemetry-observability',
        title: 'Telemetry and Incident Response SME',
        ecosystem,
        sources: ['observability rule packs', 'watch metrics stores', 'run logs and diagnostic surfaces'],
        rules: observabilityRules,
        projects,
        questions: [
          'What telemetry or error signal triggered the plan and how is it correlated to impacted components?',
          'What additional instrumentation should be added to prevent recurrence?',
          'What fix-memory record should be emitted when the defect is resolved?'
        ],
        heuristics: [
          'Use telemetry sources as seeds, then widen by capability lineage and runtime adjacency.',
          'Require a before/after evidence bundle for every incident-derived fix.',
          'Promote recurring defects into guardrail or verifier updates.'
        ],
        designPrinciples: [
          'signals outrank anecdotes',
          'instrument before and after fixing',
          'learn from every resolved incident'
        ]
      })
    );
  }

  if (testingRules.length > 0) {
    profiles.push(
      buildProfile({
        domain: 'verification-and-quality-gates',
        title: 'Independent Verifier SME',
        ecosystem,
        sources: ['testing rule packs', 'project targets', 'current task verification commands'],
        rules: testingRules,
        projects,
        questions: [
          'Which unit, integration, e2e, and build targets are required for this change?',
          'What negative or regression case currently fails and should pass after the fix?',
          'What evidence must be written for handoff and plan closure?'
        ],
        heuristics: [
          'Never close a plan without evidence from independent verification.',
          'Use the narrowest affected slice first, then widen for shared-library or runtime-boundary changes.',
          'Keep verification agent independent from the builder agent.'
        ],
        designPrinciples: [
          'verification is a role, not a comment',
          'capture commands and outputs as artifacts',
          'regression coverage is part of the fix'
        ]
      })
    );
  }

  return profiles;
}

export async function writeSmeProfiles(outputDir, profiles) {
  await ensureDir(outputDir);
  for (const profile of profiles) {
    await writeJson(path.join(outputDir, `${profile.id.replace(/[:/]+/g, '-')}.json`), profile);
  }
  await writeJson(path.join(outputDir, 'index.json'), profiles);
  return profiles;
}
