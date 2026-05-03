export interface SchemaDiffStub {
  sourceTitle: string;
  targetTitle: string;
  requiredInSourceOnly: string[];
  requiredInTargetOnly: string[];
}

function propertyKeys(schema: Record<string, unknown>): Set<string> {
  const properties = schema.properties;
  if (!properties || typeof properties !== 'object') {
    return new Set();
  }
  return new Set(Object.keys(properties as Record<string, unknown>));
}

function requiredKeys(schema: Record<string, unknown>): Set<string> {
  const required = schema.required;
  if (!Array.isArray(required)) {
    return new Set();
  }
  return new Set(required.filter((value): value is string => typeof value === 'string'));
}

export function createSchemaDiffStub(
  sourceSchema: Record<string, unknown>,
  targetSchema: Record<string, unknown>
): SchemaDiffStub {
  const sourceRequired = requiredKeys(sourceSchema);
  const targetRequired = requiredKeys(targetSchema);
  const sourceProperties = propertyKeys(sourceSchema);
  const targetProperties = propertyKeys(targetSchema);

  return {
    sourceTitle: typeof sourceSchema.title === 'string' ? sourceSchema.title : 'Source',
    targetTitle: typeof targetSchema.title === 'string' ? targetSchema.title : 'Target',
    requiredInSourceOnly: [...sourceRequired].filter((key) => !targetProperties.has(key)).sort(),
    requiredInTargetOnly: [...targetRequired].filter((key) => !sourceProperties.has(key)).sort()
  };
}
