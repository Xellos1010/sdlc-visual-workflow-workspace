import { readJson } from './fs-utils.mjs';
import { repoPath } from './paths.mjs';

const routing = readJson(repoPath('configs', 'model-routing', 'default-routing.json'));
const providers = readJson(repoPath('configs', 'providers', 'providers.json'));

export function resolveProviderForTask({ taskClass, riskLevel = 'medium' }) {
  const taskRoute = routing.taskClassRouting[taskClass] || routing.taskClassRouting.structured_generation;
  const tier = taskRoute.preferredTier;
  const candidates = routing.tierRouting[tier] || [];
  const ranked = candidates
    .map((providerId) => providers.providers.find((p) => p.providerId === providerId))
    .filter(Boolean)
    .sort((a, b) => {
      const riskWeight = { low: 1, medium: 2, high: 3, critical: 4 };
      return (riskWeight[b.riskFit || 'medium'] || 2) - (riskWeight[a.riskFit || 'medium'] || 2);
    });

  const selection = ranked.find((candidate) => {
    if (riskLevel === 'critical') return candidate.suitableForCritical === true;
    return true;
  }) || ranked[0];

  return {
    modelTier: tier,
    provider: selection || null,
    reasoningStyle: taskRoute.reasoningStyle,
    fallbackTiers: taskRoute.fallbackTiers || []
  };
}
