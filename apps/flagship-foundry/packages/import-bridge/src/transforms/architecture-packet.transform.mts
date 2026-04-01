export interface ArchitectureArtifactProjection {
  adrs: string[];
  contracts: string[];
  diagrams: string[];
  documents: string[];
}

export function classifyArchitectureArtifacts(paths: string[]): ArchitectureArtifactProjection {
  return {
    adrs: paths.filter((item) => /(^|\/)adr-.*\.md$/i.test(item)),
    contracts: paths.filter((item) => item.includes('/contracts/') && item.endsWith('.json')),
    diagrams: paths.filter((item) => item.endsWith('.mmd')),
    documents: paths.filter((item) => item.endsWith('.md') && !/(^|\/)adr-.*\.md$/i.test(item))
  };
}
