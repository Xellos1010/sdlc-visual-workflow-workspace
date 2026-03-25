import path from 'node:path';
import { loadGraph } from './graph-store.mjs';
import { loadKnowledgeBaseManifest, loadKnowledgeDocuments } from './knowledge-base.mjs';
import { loadCatalogs } from './catalogs.mjs';

/**
 * Layered retrieval outline for planning: ecosystem → packs → framework hints.
 *
 * @param {string} ecosystemId
 * @param {string | null} knowledgeBaseId
 * @returns {Promise<object>}
 */
export async function buildLayeredPlanningContext(ecosystemId, knowledgeBaseId) {
  const graph = await loadGraph(ecosystemId, ecosystemId);
  const catalogs = await loadCatalogs();
  const projects = graph.nodes.filter((n) => n.type === 'project').map((n) => ({ id: n.id, name: n.name }));
  const frameworks = graph.nodes
    .filter((n) => n.type === 'framework')
    .map((n) => ({ id: n.id, name: n.name }));

  let documentsSample = [];
  if (knowledgeBaseId) {
    await loadKnowledgeBaseManifest(knowledgeBaseId);
    const docs = await loadKnowledgeDocuments(knowledgeBaseId);
    documentsSample = docs.slice(0, 5).map((d) => ({ id: d.id, title: d.title ?? d.id }));
  }

  return {
    ecosystemId,
    layer1_workspace: { projectCount: projects.length, projects },
    layer2_frameworks: frameworks,
    layer3_knowledgeCatalogs: {
      domainPacks: (catalogs.knowledgePacks ?? []).length,
      frameworkRegistry: (catalogs.frameworkRegistry ?? []).length
    },
    layer4_documents: documentsSample.map((d) => ({ id: d.id, title: d.title ?? d.id })),
    retrievalNotes: [
      'Narrow by impacted packs from gap analysis before full RAG',
      'Bind persona/runbook phase when generating agent prompts'
    ]
  };
}
