export interface FoundryNodeProperties {
  path?: string;
  projectCount?: number;
  topology?: string;
  importedAt?: string;
  packageManager?: string;
  nodeEngine?: string;
  framework?: string;
  version?: string;
  [key: string]: unknown;
}

export interface FoundryNode {
  id: string;
  type: string;
  name: string;
  label?: string;
  tags: string[];
  refs: string[];
  properties: FoundryNodeProperties;
  metadata?: Record<string, unknown>;
}

export interface FoundryEdge {
  id?: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
}

export interface EcosystemGraph {
  graphId: string;
  ecosystemId: string;
  ecosystemName: string;
  generatedAt: string;
  nodes: FoundryNode[];
  edges: FoundryEdge[];
}

export interface EcosystemManifest {
  id: string;
  name: string;
  [key: string]: unknown;
}

export type NodeType =
  | 'ecosystem'
  | 'system'
  | 'project'
  | 'framework'
  | 'platform'
  | 'rule-pack'
  | 'environment'
  | 'diagram'
  | 'repo'
  | string;

// ── Phase Lifecycle types ─────────────────────────────────────────────────────

export interface PhaseData {
  id: string;
  name: string;
  order: number;
  loop: string;
  objective: string;
  primaryAgent: string;
  supportingAgents: string[];
  principles: string[];
  guardrailPacks: string[];
  definitionOfReady: string[];
  definitionOfDone: string[];
  requiredArtifacts: string[];
  visualizationTypes: string[];
  glossaryCategories: string[];
  skills: string[];
  nextPhase: string | null;
}

export interface LoopData {
  id: string;
  name: string;
  phases: string[];
  description: string;
}

export interface PhaseLifecycle {
  version: string;
  lifecycleModel: string;
  loops: LoopData[];
  phases: PhaseData[];
}

// ── Glossary types ─────────────────────────────────────────────────────────────

export interface GlossaryTerm {
  term: string;
  definition: string;
  relatedTerms?: string[];
  applicablePhases?: string[];
  category: string;
}

export interface GlossaryCategory {
  id: string;
  name: string;
  description?: string;
  terms: GlossaryTerm[];
}

export interface Glossary {
  version: string;
  source: string;
  categories: GlossaryCategory[];
}

// ── Principle enforcement types ────────────────────────────────────────────────

export interface PrincipleInfo {
  id: string;
  statement: string;
  applicablePhases: string[];
  complianceStatus: 'verified' | 'unchecked' | 'violation';
}

// ── Run Timeline types ─────────────────────────────────────────────────────────

export interface VerificationResult {
  command: string;
  exitCode: number;
  output?: string;
  timestamp: string;
}

export interface RunTask {
  id: string;
  title: string;
  phase: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'paused' | 'stopped';
  personaIds?: string[];
  acceptanceCriteria?: string[];
  verificationCommands?: string[];
  commands?: string[];
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  verificationResults?: VerificationResult[];
  evidenceArtifacts?: string[];
  projectId?: string;
  projectPlanId?: string;
  sequence?: number;
}

export interface Run {
  id: string;
  planId: string;
  ecosystemId?: string;
  status: string;
  mode?: string;
  adapterId?: string;
  createdAt?: string;
  updatedAt?: string;
  startedAt?: string;
  completedAt?: string;
  tasks: RunTask[];
}
