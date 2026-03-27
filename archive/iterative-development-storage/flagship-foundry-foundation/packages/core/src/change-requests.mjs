import { repoPath } from './paths.mjs';
import { writeJson, readJson, fileExists } from './fs-utils.mjs';

export function changeRequestPath(requestId) {
  return repoPath('state', 'change-requests', `${requestId}.json`);
}

export function saveChangeRequest(changeRequest) {
  writeJson(changeRequestPath(changeRequest.requestId), changeRequest);
  return changeRequestPath(changeRequest.requestId);
}

export function loadChangeRequest(requestId) {
  const target = changeRequestPath(requestId);
  if (!fileExists(target)) return null;
  return readJson(target);
}
