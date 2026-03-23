import path from 'node:path';
import { ensureDir, makeId, writeJson, writeText } from './io.mjs';

function mermaidSafe(value) {
  return String(value).replace(/"/g, '\\"');
}

function nodeLine(id, label) {
  return `  ${id}["${mermaidSafe(label)}"]`;
}

export function buildVisualizationSpecs({ ecosystem, graph }) {
  const systems = ecosystem.systems ?? [];
  const projects = ecosystem.projects ?? [];
  const frameworks = ecosystem.frameworks ?? [];
  const platforms = ecosystem.platforms ?? [];
  const existingDiagrams = ecosystem.existingVisualizations ?? [];

  const overviewLines = ['flowchart TB', nodeLine('eco', ecosystem.name)];
  for (const system of systems) {
    const systemNode = `sys_${system.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
    overviewLines.push(nodeLine(systemNode, `${system.name}\n${system.projectIds.length} projects`));
    overviewLines.push(`  eco --> ${systemNode}`);
    const systemProjects = projects.filter((project) => system.projectIds.includes(project.id)).slice(0, 8);
    for (const project of systemProjects) {
      const projectNode = `proj_${project.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
      overviewLines.push(nodeLine(projectNode, project.name));
      overviewLines.push(`  ${systemNode} --> ${projectNode}`);
    }
  }

  const frameworkLines = ['flowchart LR'];
  frameworkLines.push(nodeLine('workspace', ecosystem.name));
  for (const framework of frameworks.slice(0, 10)) {
    const frameworkNode = `fw_${framework.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
    frameworkLines.push(nodeLine(frameworkNode, framework.name));
    frameworkLines.push(`  workspace --> ${frameworkNode}`);
    const consumers = projects.filter((project) => project.frameworkIds.includes(framework.id)).slice(0, 6);
    for (const consumer of consumers) {
      const consumerNode = `proj_${consumer.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
      frameworkLines.push(nodeLine(consumerNode, consumer.name));
      frameworkLines.push(`  ${frameworkNode} --> ${consumerNode}`);
    }
  }
  for (const platform of platforms.slice(0, 8)) {
    const platformNode = `pf_${platform.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
    frameworkLines.push(nodeLine(platformNode, platform.name));
    frameworkLines.push(`  workspace --> ${platformNode}`);
    const consumers = projects.filter((project) => project.platformIds.includes(platform.id)).slice(0, 6);
    for (const consumer of consumers) {
      const consumerNode = `proj_${consumer.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
      frameworkLines.push(`  ${platformNode} --> ${consumerNode}`);
    }
  }

  const orchestrationLines = [
    'flowchart LR',
    nodeLine('req', 'Requests / Telemetry / Inspection'),
    nodeLine('import', 'Workspace Import + Pattern Extraction'),
    nodeLine('graph', 'Living Ecosystem Graph'),
    nodeLine('blast', 'Blast Radius + Similarity Analysis'),
    nodeLine('plan', 'Plan Draft'),
    nodeLine('approval', 'Manual or Auto Approval'),
    nodeLine('run', 'Run Controller'),
    nodeLine('agents', 'Task Agents + SMEs + Verifiers'),
    nodeLine('evidence', 'Evidence + Continuity + Handoff'),
    nodeLine('learning', 'Fix Memory + Guardrail Improvement'),
    '  req --> import --> graph --> blast --> plan --> approval --> run --> agents --> evidence --> learning',
    '  graph --> approval',
    '  evidence --> graph',
    '  learning --> graph'
  ];

  const existingDiagramLines = ['flowchart TB', nodeLine('root', 'Imported Visualizations')];
  for (const diagram of existingDiagrams.slice(0, 20)) {
    const diagramNode = `diag_${diagram.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
    existingDiagramLines.push(nodeLine(diagramNode, `${diagram.projectName}\n${diagram.title}`));
    existingDiagramLines.push(`  root --> ${diagramNode}`);
  }

  return [
    {
      id: makeId('visualization', `${ecosystem.id}-overview`),
      title: 'Ecosystem Overview',
      kind: 'mermaid-flowchart',
      fileName: 'ecosystem-overview.mmd',
      relatedNodeIds: graph.nodes.filter((node) => ['ecosystem', 'system', 'project'].includes(node.type)).map((node) => node.id),
      content: `${overviewLines.join('\n')}\n`
    },
    {
      id: makeId('visualization', `${ecosystem.id}-framework-platform-map`),
      title: 'Framework and Platform Coverage',
      kind: 'mermaid-flowchart',
      fileName: 'framework-platform-map.mmd',
      relatedNodeIds: graph.nodes.filter((node) => ['framework', 'platform', 'project'].includes(node.type)).map((node) => node.id),
      content: `${frameworkLines.join('\n')}\n`
    },
    {
      id: makeId('visualization', `${ecosystem.id}-orchestration-control`),
      title: 'Orchestration Control Flow',
      kind: 'mermaid-flowchart',
      fileName: 'orchestration-control-flow.mmd',
      relatedNodeIds: graph.nodes.map((node) => node.id),
      content: `${orchestrationLines.join('\n')}\n`
    },
    {
      id: makeId('visualization', `${ecosystem.id}-existing-visualizations`),
      title: 'Existing Visualization Index',
      kind: 'mermaid-flowchart',
      fileName: 'existing-visualizations-index.mmd',
      relatedNodeIds: existingDiagrams.map((diagram) => diagram.id),
      content: `${existingDiagramLines.join('\n')}\n`
    }
  ];
}

export async function writeVisualizationSet(outputDir, specs) {
  await ensureDir(outputDir);
  for (const spec of specs) {
    await writeText(path.join(outputDir, spec.fileName), spec.content);
  }
  await writeJson(path.join(outputDir, 'index.json'), specs);
  return specs;
}
