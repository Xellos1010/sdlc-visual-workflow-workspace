const CLASS_CANONICAL = 'canonical';
const CLASS_GENERATED = 'generated';
const CLASS_ARCHIVE = 'archive';

const AUTH_CANONICAL = 'canonical';
const AUTH_REFERENCE_ONLY = 'reference-only';
const AUTH_NON_AUTHORITATIVE = 'non-authoritative';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MIN_ARCHIVE_RETENTION_DAYS = 30;

function normalizePath(value) {
  return String(value || '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .toLowerCase();
}

function isUnder(pathValue, prefix) {
  return pathValue === prefix || pathValue.startsWith(`${prefix}/`);
}

/**
 * Classify an artifact path according to ADR-001 and ADR-003.
 *
 * ADR-001:
 * - canonical docs and runtime sources live under flagship-foundry-work/
 * - root-level plane is reference-only unless promoted
 *
 * ADR-003:
 * - three classes: canonical, generated, archive
 *
 * @param {string} relativePath
 * @returns {{artifactClass: string, authority: string, reasons: string[]}}
 */
export function classifyArtifact(relativePath) {
  const pathValue = normalizePath(relativePath);
  const reasons = [];

  if (!pathValue) {
    return {
      artifactClass: CLASS_ARCHIVE,
      authority: AUTH_NON_AUTHORITATIVE,
      reasons: ['empty-path']
    };
  }

  if (isUnder(pathValue, 'flagship-foundry-work/state')) {
    reasons.push('state-artifacts-are-generated-outputs');
    return {
      artifactClass: CLASS_GENERATED,
      authority: AUTH_NON_AUTHORITATIVE,
      reasons
    };
  }

  if (isUnder(pathValue, 'flagship-foundry-work/docs/adr')) {
    reasons.push('canonical-adr-home');
    return {
      artifactClass: CLASS_CANONICAL,
      authority: AUTH_CANONICAL,
      reasons
    };
  }

  if (isUnder(pathValue, 'flagship-foundry-work/docs')) {
    reasons.push('canonical-docs-home');
    return {
      artifactClass: CLASS_CANONICAL,
      authority: AUTH_CANONICAL,
      reasons
    };
  }

  if (isUnder(pathValue, 'flagship-foundry-work/packages')) {
    reasons.push('canonical-runtime-source-home');
    return {
      artifactClass: CLASS_CANONICAL,
      authority: AUTH_CANONICAL,
      reasons
    };
  }

  if (isUnder(pathValue, 'flagship-foundry-work/schemas')) {
    reasons.push('canonical-contract-home');
    return {
      artifactClass: CLASS_CANONICAL,
      authority: AUTH_CANONICAL,
      reasons
    };
  }

  if (pathValue.includes('/archived/') || pathValue.endsWith('.bak') || pathValue.endsWith('.snapshot.json')) {
    reasons.push('historical-copy-pattern');
    return {
      artifactClass: CLASS_ARCHIVE,
      authority: AUTH_NON_AUTHORITATIVE,
      reasons
    };
  }

  if (!isUnder(pathValue, 'flagship-foundry-work')) {
    reasons.push('outside-canonical-plane');
    reasons.push('reference-only-until-promoted');
    return {
      artifactClass: CLASS_ARCHIVE,
      authority: AUTH_REFERENCE_ONLY,
      reasons
    };
  }

  reasons.push('default-generated-inside-canonical-plane');
  return {
    artifactClass: CLASS_GENERATED,
    authority: AUTH_NON_AUTHORITATIVE,
    reasons
  };
}

/**
 * Evaluate drift between canonical and projection artifacts.
 *
 * @param {object} input
 * @param {string} input.canonicalPath
 * @param {string} input.projectionPath
 * @param {string} input.canonicalDigest
 * @param {string} input.projectionDigest
 * @returns {{status: string, reasons: string[]}}
 */
export function evaluateArtifactDrift(input) {
  const canonical = classifyArtifact(input?.canonicalPath);
  const projection = classifyArtifact(input?.projectionPath);
  const reasons = [];

  if (canonical.artifactClass !== CLASS_CANONICAL || canonical.authority !== AUTH_CANONICAL) {
    reasons.push('canonical-path-is-not-authoritative');
    return { status: 'invalid-canonical-source', reasons };
  }

  if (projection.artifactClass === CLASS_CANONICAL && projection.authority === AUTH_CANONICAL) {
    reasons.push('projection-cannot-be-canonical');
    return { status: 'invalid-projection-target', reasons };
  }

  if (!input?.canonicalDigest || !input?.projectionDigest) {
    reasons.push('missing-digest');
    return { status: 'unknown', reasons };
  }

  if (input.canonicalDigest === input.projectionDigest) {
    reasons.push('digests-match');
    return { status: 'in-sync', reasons };
  }

  reasons.push('digests-differ');
  reasons.push('canonical-precedence');
  return { status: 'drifted', reasons };
}

/**
 * ADR-003 cleanup gate policy:
 * - No destructive cleanup until parity checks are green and approval recorded
 * - Keep archives for >= 30 days and >= 1 successful release cycle
 *
 * @param {object} input
 * @param {string} input.replacedAtIso
 * @param {string} [input.nowIso]
 * @param {boolean} input.parityChecksGreen
 * @param {boolean} input.approvalRecorded
 * @param {number} input.successfulReleaseCyclesSinceReplacement
 * @returns {{allowed: boolean, reasons: string[]}}
 */
export function canCleanupArchive(input) {
  const reasons = [];
  const replacedAtIso = input?.replacedAtIso;
  const nowIsoValue = input?.nowIso ?? new Date().toISOString();
  const releaseCycles = Number(input?.successfulReleaseCyclesSinceReplacement ?? 0);
  const parityChecksGreen = Boolean(input?.parityChecksGreen);
  const approvalRecorded = Boolean(input?.approvalRecorded);

  if (!parityChecksGreen) {
    reasons.push('parity-checks-not-green');
  }
  if (!approvalRecorded) {
    reasons.push('approval-not-recorded');
  }
  if (!replacedAtIso) {
    reasons.push('missing-replacedAtIso');
  }

  let retentionDays = -1;
  if (replacedAtIso) {
    const startMs = Date.parse(replacedAtIso);
    const endMs = Date.parse(nowIsoValue);
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs) {
      reasons.push('invalid-retention-window');
    } else {
      retentionDays = Math.floor((endMs - startMs) / MS_PER_DAY);
      if (retentionDays < MIN_ARCHIVE_RETENTION_DAYS) {
        reasons.push('minimum-30-day-retention-not-met');
      }
    }
  }

  if (releaseCycles < 1) {
    reasons.push('minimum-one-successful-release-cycle-not-met');
  }

  return {
    allowed: reasons.length === 0,
    reasons
  };
}

