import { readJson } from './fs-utils.mjs';
import { repoPath } from './paths.mjs';

export function loadCatalog(name) {
  return readJson(repoPath('manifests', `${name}.catalog.json`));
}

export function loadAllCatalogs() {
  return {
    runbooks: loadCatalog('runbooks'),
    personas: loadCatalog('personas'),
    providers: loadCatalog('providers'),
    adapters: loadCatalog('adapters'),
    guardrails: loadCatalog('guardrails')
  };
}
