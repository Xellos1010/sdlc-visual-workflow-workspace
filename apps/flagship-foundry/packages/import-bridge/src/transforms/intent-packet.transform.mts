export interface FoundryIntentProjection {
  objective: string;
  scope: {
    in: string[];
    out: string[];
  };
  acceptanceCriteria: string[];
  risks: string[];
  rollback: string;
  testOutline: string[];
  _unmapped?: Record<string, unknown>;
}

export function transformIntentPacket(input: Record<string, unknown>): FoundryIntentProjection {
  return {
    objective: String(input.businessOutcome ?? input.changeSummary ?? 'Imported intent packet'),
    scope: {
      in: Array.isArray((input.scope as { in?: unknown })?.in) ? ([...(input.scope as { in: string[] }).in]) : [],
      out: Array.isArray((input.scope as { out?: unknown })?.out) ? ([...(input.scope as { out: string[] }).out]) : []
    },
    acceptanceCriteria: Array.isArray(input.acceptanceCriteria) ? [...(input.acceptanceCriteria as string[])] : [],
    risks: Array.isArray(input.risks) ? [...(input.risks as string[])] : [],
    rollback: String(input.rollback ?? ''),
    testOutline: Array.isArray(input.testOutline) ? [...(input.testOutline as string[])] : [],
    _unmapped: Object.fromEntries(
      Object.entries(input).filter(([key]) => ![
        'businessOutcome',
        'changeSummary',
        'scope',
        'acceptanceCriteria',
        'risks',
        'rollback',
        'testOutline'
      ].includes(key))
    )
  };
}
