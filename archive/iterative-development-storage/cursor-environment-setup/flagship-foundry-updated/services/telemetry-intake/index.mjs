export function changeRequestFromTelemetry(incident) {
  return {
    title: incident.title,
    objective: incident.objective ?? incident.summary ?? incident.title,
    sourceSignal: 'telemetry',
    targetQuery: incident.targetQuery ?? incident.component ?? incident.title,
    riskLevel: incident.riskLevel ?? 'medium',
    requestedTargets: incident.requestedTargets ?? []
  };
}
