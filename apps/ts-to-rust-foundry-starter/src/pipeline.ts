import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { addSourceFiles, createProject, extractSourceModel } from './extract-model.js';
import { generateRust } from './rust-generator.js';
import { renderMermaid, renderNomnoml, tryRenderWithTsUml2, writeLocalUmlArtifacts } from './render-uml.js';
import { findInputFiles, relativeArtifactDir } from './scan.js';
import type { PipelineOptions, SourceModel } from './types.js';

export async function runPipeline(options: PipelineOptions): Promise<void> {
  const files = await findInputFiles(options.inputPath);
  if (files.length === 0) {
    throw new Error(`No .ts or .tsx files found under: ${options.inputPath}`);
  }

  const project = createProject(options.tsconfigPath);
  addSourceFiles(project, files);

  const index: Array<{ source: string; artifactDir: string; notes: string[] }> = [];

  for (const filePath of files) {
    const sourceFile = project.getSourceFile(filePath);
    if (!sourceFile) {
      continue;
    }
    const model = extractSourceModel(sourceFile, options.inputPath);
    const relativeDir = relativeArtifactDir(options.inputPath, filePath);
    const artifactDir = path.join(options.outputRoot, relativeDir);
    await mkdir(artifactDir, { recursive: true });
    await emitArtifacts(model, artifactDir, options);
    index.push({ source: filePath, artifactDir, notes: model.notes });
  }

  await writeFile(path.join(options.outputRoot, 'index.json'), JSON.stringify(index, null, 2), 'utf8');
}

async function emitArtifacts(model: SourceModel, artifactDir: string, options: PipelineOptions): Promise<void> {
  await writeFile(path.join(artifactDir, 'model.json'), JSON.stringify(model, null, 2), 'utf8');
  await writeFile(path.join(artifactDir, 'pseudocode.md'), buildPseudocodeMarkdown(model), 'utf8');

  const useTsUml2 = options.useTsUml2;
  const sourceIsTsx = model.fileName.endsWith('.tsx');
  let tsuml2Worked = false;
  if (options.command !== 'generate-rust') {
    if (useTsUml2 === 'always' || (useTsUml2 === 'auto' && !sourceIsTsx)) {
      tsuml2Worked = await tryRenderWithTsUml2(model.sourcePath, artifactDir, options.tsconfigPath);
    }
    if (!tsuml2Worked) {
      await writeLocalUmlArtifacts(model, artifactDir);
    }
  }

  if (options.command !== 'analyze') {
    await writeFile(path.join(artifactDir, 'generated.rs'), generateRust(model), 'utf8');
  }
}

function buildPseudocodeMarkdown(model: SourceModel): string {
  const lines: string[] = [`# Pseudocode Ledger`, '', `Source: ${model.relativePath}`, ''];
  if (model.notes.length > 0) {
    lines.push('## Notes', '');
    for (const note of model.notes) {
      lines.push(`- ${note}`);
    }
    lines.push('');
  }
  if (model.types.length > 0) {
    lines.push('## Types', '');
    for (const type of model.types) {
      lines.push(`### ${type.kind} ${type.name}`, '');
      if (type.properties.length > 0) {
        lines.push('Properties:');
        for (const prop of type.properties) {
          lines.push(`- ${prop.name}: ${prop.type}${prop.optional ? ' (optional)' : ''}`);
        }
        lines.push('');
      }
      if (type.methods.length > 0) {
        lines.push('Methods:', '');
        for (const method of type.methods) {
          lines.push(`#### ${method.name}`, '');
          lines.push(`- Return: ${method.returnType}`);
          if (method.parameters.length > 0) {
            lines.push(`- Parameters: ${method.parameters.map((param) => `${param.name}: ${param.type}`).join(', ')}`);
          }
          lines.push('- Pseudocode:');
          for (const step of method.pseudocode ?? ['// no pseudocode']) {
            lines.push(`  - ${step}`);
          }
          lines.push('');
        }
      }
      if (type.members?.length) {
        lines.push('Members:');
        for (const member of type.members) {
          lines.push(`- ${member}`);
        }
        lines.push('');
      }
      if (type.targetType) {
        lines.push(`Alias target: ${type.targetType}`, '');
      }
    }
  }
  if (model.functions.length > 0) {
    lines.push('## Top-level Functions', '');
    for (const fn of model.functions) {
      lines.push(`### ${fn.name}`, '');
      lines.push(`- Kind: ${fn.kind}`);
      lines.push(`- Return: ${fn.returnType}`);
      if (fn.parameters.length > 0) {
        lines.push(`- Parameters: ${fn.parameters.map((param) => `${param.name}: ${param.type}`).join(', ')}`);
      }
      lines.push('- Pseudocode:');
      for (const step of fn.pseudocode ?? ['// no pseudocode']) {
        lines.push(`  - ${step}`);
      }
      lines.push('');
    }
  }
  lines.push('## Renderable UML', '', '- uml.nomnoml', '- uml.mmd', '', '## Suggested review workflow', '', '1. Validate structural model.', '2. Review pseudocode for business logic.', '3. Refine Rust ownership and async behavior.', '4. Implement or AI-complete generated.rs.', '');
  return lines.join('\n');
}
