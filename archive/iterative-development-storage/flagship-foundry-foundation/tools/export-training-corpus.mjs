import fs from 'node:fs';
import path from 'node:path';
import { repoRoot } from '../packages/core/src/paths.mjs';

const memoryDir = path.join(repoRoot, 'memory', 'fixes');
const outPath = path.join(repoRoot, 'memory', 'training-corpus.jsonl');

const files = fs.existsSync(memoryDir)
  ? fs.readdirSync(memoryDir).filter((file) => file.endsWith('.json'))
  : [];

const records = files.map((file) => {
  const data = JSON.parse(fs.readFileSync(path.join(memoryDir, file), 'utf8'));
  return {
    prompt: {
      problemSummary: data.problemSummary,
      environment: data.environment,
      symptoms: data.symptoms,
      rootCauseHypotheses: data.rootCauseHypotheses,
      relatedPrinciples: data.relatedPrinciples
    },
    completion: {
      validatedRootCause: data.validatedRootCause,
      solutionSummary: data.solutionSummary,
      designParadigm: data.designParadigm,
      reusablePatterns: data.reusablePatterns,
      preventionRules: data.preventionRules
    },
    label: data.trainingLabel || 'unlabeled'
  };
});

const body = records.map((record) => JSON.stringify(record)).join('\n') + (records.length ? '\n' : '');
fs.writeFileSync(outPath, body, 'utf8');
console.log(`Wrote ${records.length} records to ${outPath}`);
