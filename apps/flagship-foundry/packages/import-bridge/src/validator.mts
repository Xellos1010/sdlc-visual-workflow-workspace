import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import type { ErrorObject } from 'ajv';
import type { NormalizedManifest } from './types.mjs';
import { toSchemaManifest } from './transforms/import-manifest.transform.mjs';
import { transformWorkOrderBatch } from './transforms/work-order-batch.transform.mjs';

export interface ValidationFailure {
  artifact: string;
  schema: string;
  fieldPath: string;
  message: string;
}

export class ValidationError extends Error {
  readonly failure: ValidationFailure;

  constructor(failure: ValidationFailure) {
    super(`${failure.artifact} failed validation at ${failure.fieldPath}: ${failure.message}`);
    this.name = 'ValidationError';
    this.failure = failure;
  }
}

function createAjv() {
  const AjvConstructor = Ajv2020 as unknown as new (options?: Record<string, unknown>) => {
    compile: (schema: Record<string, unknown>) => {
      (value: unknown): boolean;
      errors?: ErrorObject[] | null;
    };
  };
  return new AjvConstructor({ allErrors: true, strict: false });
}

function toFailure(artifact: string, schema: string, error: ErrorObject | undefined): ValidationFailure {
  return {
    artifact,
    schema,
    fieldPath: error?.instancePath || '/',
    message: error?.message || 'Unknown validation error'
  };
}

export async function loadSchema(schemaPath: string): Promise<Record<string, unknown>> {
  const raw = await readFile(schemaPath, 'utf8');
  return JSON.parse(raw) as Record<string, unknown>;
}

export async function validateWithSchema(
  artifactName: string,
  value: unknown,
  schemaPath: string
): Promise<void> {
  const ajv = createAjv();
  const schema = await loadSchema(schemaPath);
  const validate = ajv.compile(schema);
  if (!validate(value)) {
    throw new ValidationError(toFailure(artifactName, schemaPath, validate.errors?.[0]));
  }
}

export async function validateNormalizedManifest(
  manifest: NormalizedManifest,
  schemaRoot: string
): Promise<void> {
  const schemaPath = path.join(schemaRoot, 'foundry-import-manifest.schema.json');
  await validateWithSchema('foundry-import-manifest', toSchemaManifest(manifest), schemaPath);
}

export async function validateWorkOrderBatch(
  input: Record<string, unknown>,
  schemaRoot: string,
  foundrySchemaRoot: string
): Promise<void> {
  await validateWithSchema('work-order-batch', input, path.join(schemaRoot, 'work-order-batch.schema.json'));
  const transformed = transformWorkOrderBatch(input as never);
  const foundrySchemaPath = path.join(foundrySchemaRoot, 'agent-work-order.schema.json');
  for (const workOrder of transformed.workOrders) {
    await validateWithSchema(`agent-work-order:${workOrder.id}`, workOrder, foundrySchemaPath);
  }
}
