import { makeId, slugify } from '../../../packages/core/src/ids.mjs';

export function telemetryToChangeRequest(incident) {
  const title = incident.title || `${incident.systemId || 'system'} incident`;
  const systemId = incident.systemId?.replace('system:', '') || 'control-plane';

  return {
    requestId: makeId('cr', title),
    type: incident.severity === 'critical' ? 'incident' : 'bug',
    title,
    summary: incident.summary || incident.message || 'Derived from telemetry event',
    requestedBy: incident.reportedBy || 'telemetry-intake',
    riskLevel: incident.severity || 'high',
    impactedSystems: [systemId],
    impactedComponents: incident.impactedComponents || [],
    constraints: [
      'preserve current production behavior until fix is validated',
      'treat telemetry as observed evidence, not complete truth'
    ],
    requestedOutcomes: [
      'identify impacted systems and components',
      'propose remediation plan',
      'capture reusable learning'
    ],
    acceptanceCriteria: [
      'issue is reproducible or bounded with evidence',
      'fix is validated with targeted verification',
      'fix memory is created'
    ],
    telemetryRefs: [incident.incidentId || slugify(title)],
    artifacts: incident.artifacts || []
  };
}
