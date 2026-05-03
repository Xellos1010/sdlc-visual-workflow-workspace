import path from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

export interface ProvenanceRecord {
  sourceWorkspace: string;
  pipelineProject: string;
  generatedAt: string;
  importedAt: string;
  artifactType: string;
  pipelinePhase?: string;
  originPath?: string;
  importSessionId?: string;
  transformVersion?: string;
  direction?: 'import' | 'export';
}

export function provenanceSidecarPath(targetArtifactPath: string): string {
  return `${targetArtifactPath}.provenance.json`;
}

export async function writeProvenanceRecord(targetArtifactPath: string, record: ProvenanceRecord): Promise<string> {
  const sidecarPath = provenanceSidecarPath(targetArtifactPath);
  await mkdir(path.dirname(sidecarPath), { recursive: true });
  await writeFile(sidecarPath, JSON.stringify(record, null, 2));
  return sidecarPath;
}

export async function readProvenanceChain(targetArtifactPath: string): Promise<ProvenanceRecord[]> {
  const sidecarPath = provenanceSidecarPath(targetArtifactPath);
  const raw = await readFile(sidecarPath, 'utf8');
  const parsed = JSON.parse(raw) as ProvenanceRecord | ProvenanceRecord[];
  return Array.isArray(parsed) ? parsed : [parsed];
}
