import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { SourceModel } from './types.js';

const execFileAsync = promisify(execFile);

export function renderNomnoml(model: SourceModel): string {
  const lines: string[] = ['#direction: right'];
  for (const type of model.types) {
    if (type.kind === 'enum') {
      const enumMembers = (type.members ?? []).join(';');
      lines.push(`[<enum>${type.name}|${enumMembers}]`);
      continue;
    }
    if (type.kind === 'typeAlias') {
      lines.push(`[<note>${type.name}|${type.targetType ?? 'unknown'}]`);
      continue;
    }
    const attrs = type.properties.map((prop) => `${prop.name}: ${prop.type}${prop.optional ? '?' : ''}`);
    const methods = type.methods.map((method) => `${method.name}(${method.parameters.map((p) => `${p.name}: ${p.type}`).join(', ')}): ${method.returnType}`);
    const stereotype = type.kind === 'interface' ? '<interface>' : 'class';
    lines.push(`[${stereotype}${type.name}|${attrs.join(';')}|${methods.join(';')}]`);
    for (const base of type.extends) {
      lines.push(`[${type.name}]-:>[${sanitizeTypeName(base)}]`);
    }
    for (const impl of type.implements) {
      lines.push(`[${type.name}]--:>[${sanitizeTypeName(impl)}]`);
    }
  }
  for (const edge of collectAssociations(model)) {
    lines.push(edge);
  }
  return lines.join('\n') + '\n';
}

export function renderMermaid(model: SourceModel): string {
  const lines: string[] = ['classDiagram', 'direction LR'];
  for (const type of model.types) {
    if (type.kind === 'enum') {
      lines.push(`class ${type.name} {`);
      lines.push('  <<enumeration>>');
      for (const member of type.members ?? []) {
        lines.push(`  ${member}`);
      }
      lines.push('}');
      continue;
    }
    if (type.kind === 'typeAlias') {
      lines.push(`class ${type.name} {`);
      lines.push(`  <<typeAlias ${escapeMermaid(type.targetType ?? 'unknown')}>>`);
      lines.push('}');
      continue;
    }
    lines.push(`class ${type.name} {`);
    if (type.kind === 'interface') lines.push('  <<interface>>');
    for (const prop of type.properties) {
      lines.push(`  +${prop.name}: ${escapeMermaid(prop.type)}`);
    }
    for (const method of type.methods) {
      const params = method.parameters.map((p) => `${p.name}: ${escapeMermaid(p.type)}`).join(', ');
      lines.push(`  +${method.name}(${params}) ${escapeMermaid(method.returnType)}`);
    }
    lines.push('}');
    for (const base of type.extends) {
      lines.push(`${sanitizeTypeName(base)} <|-- ${type.name}`);
    }
    for (const impl of type.implements) {
      lines.push(`${sanitizeTypeName(impl)} <|.. ${type.name}`);
    }
  }
  for (const edge of collectAssociations(model, true)) {
    lines.push(edge);
  }
  return lines.join('\n') + '\n';
}

export async function tryRenderWithTsUml2(filePath: string, artifactDir: string, tsconfigPath?: string): Promise<boolean> {
  const outDsl = path.join(artifactDir, 'uml.tsuml2.nomnoml');
  const outMermaid = path.join(artifactDir, 'uml.tsuml2.mmd');
  const args = ['tsuml2', '--glob', filePath, '--outDsl', outDsl, '--outMermaidDsl', outMermaid, '-m'];
  if (tsconfigPath) {
    args.push('--tsconfig', tsconfigPath);
  }
  try {
    await mkdir(artifactDir, { recursive: true });
    await execFileAsync('npx', args, { cwd: process.cwd() });
    return true;
  } catch {
    return false;
  }
}

export async function writeLocalUmlArtifacts(model: SourceModel, artifactDir: string): Promise<void> {
  await mkdir(artifactDir, { recursive: true });
  await writeFile(path.join(artifactDir, 'uml.nomnoml'), renderNomnoml(model), 'utf8');
  await writeFile(path.join(artifactDir, 'uml.mmd'), renderMermaid(model), 'utf8');
}

export async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function collectAssociations(model: SourceModel, mermaid = false): string[] {
  const typeNames = new Set(model.types.map((type) => type.name));
  const edges = new Set<string>();
  for (const type of model.types) {
    for (const prop of type.properties) {
      for (const refName of referencedTypes(prop.type, typeNames)) {
        edges.add(mermaid ? `${type.name} --> ${refName}` : `[${type.name}]o-[${refName}]`);
      }
    }
    for (const method of type.methods) {
      for (const param of method.parameters) {
        for (const refName of referencedTypes(param.type, typeNames)) {
          edges.add(mermaid ? `${type.name} ..> ${refName}` : `[${type.name}]-->[${refName}]`);
        }
      }
      for (const refName of referencedTypes(method.returnType, typeNames)) {
        edges.add(mermaid ? `${type.name} ..> ${refName}` : `[${type.name}]-->[${refName}]`);
      }
    }
  }
  return [...edges].sort();
}

function referencedTypes(typeText: string, knownTypes: Set<string>): string[] {
  const hits: string[] = [];
  for (const knownType of knownTypes) {
    if (knownType === typeText) {
      hits.push(knownType);
      continue;
    }
    const regex = new RegExp(`(^|[^A-Za-z0-9_])${escapeRegex(knownType)}([^A-Za-z0-9_]|$)`);
    if (regex.test(typeText)) {
      hits.push(knownType);
    }
  }
  return hits;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sanitizeTypeName(value: string): string {
  return value.replace(/<.*>/g, '').replace(/[^A-Za-z0-9_]/g, '').trim() || 'UnknownType';
}

function escapeMermaid(value: string): string {
  return value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
