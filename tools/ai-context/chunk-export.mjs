#!/usr/bin/env node
/**
 * Split a minified AI export (one line per file record after header) into N parts.
 * Loads all lines into memory first: awaiting writes inside a readline `for await` loop
 * can backpressure the stream and drop lines on huge exports.
 *
 * Byte-split (sub-chunk a chunk file to a max UTF-8 size; use sibling parts 1–3 as reference):
 *   node tools/ai-context/chunk-export.mjs <chunk-file.txt> --byte-split --max-bytes-from-parts
 *   node tools/ai-context/chunk-export.mjs <chunk-file.txt> --byte-split --max-bytes-from-parts max
 *   node tools/ai-context/chunk-export.mjs <chunk-file.txt> --byte-split --max-bytes 8000000
 *
 * Usage:
 *   node tools/ai-context/chunk-export.mjs <path-to-export.txt> [--parts 4]
 */
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function parseArgs(argv) {
  const args = {
    input: null,
    parts: 4,
    byteSplit: false,
    maxBytes: null,
    maxBytesFromParts: false,
    referencePartsAgg: 'min'
  };
  const rest = argv.filter((t) => t !== '--');
  if (rest[0] && !rest[0].startsWith('--')) {
    args.input = rest[0];
  }
  for (let i = 0; i < rest.length; i += 1) {
    if (rest[i] === '--parts' && rest[i + 1]) {
      const n = Number(rest[i + 1]);
      if (!Number.isInteger(n) || n < 2) {
        throw new Error('--parts must be an integer >= 2');
      }
      args.parts = n;
      i += 1;
    } else if (rest[i] === '--byte-split') {
      args.byteSplit = true;
    } else if (rest[i] === '--max-bytes' && rest[i + 1]) {
      const n = Number(rest[i + 1]);
      if (!Number.isFinite(n) || n < 1024) {
        throw new Error('--max-bytes must be a number >= 1024');
      }
      args.maxBytes = Math.floor(n);
      i += 1;
    } else if (rest[i] === '--max-bytes-from-parts') {
      args.maxBytesFromParts = true;
      if (rest[i + 1] === 'min' || rest[i + 1] === 'max') {
        args.referencePartsAgg = rest[i + 1];
        i += 1;
      }
    }
  }
  if (!args.input) {
    throw new Error(
      'Usage: node chunk-export.mjs <export.txt> [--parts 4] | [--byte-split (--max-bytes N | --max-bytes-from-parts [min|max])]'
    );
  }
  return args;
}

/**
 * Read every line (readline semantics, CRLF-safe) without mixing in slow consumers.
 * @param {string} filePath
 * @returns {Promise<string[]>}
 */
async function readAllLines(filePath) {
  const lines = [];
  const rl = createInterface({
    input: createReadStream(filePath, { encoding: 'utf8' }),
    crlfDelay: Infinity
  });
  for await (const line of rl) {
    lines.push(line);
  }
  return lines;
}

function computeChunkSizes(totalDataLines, parts) {
  const base = Math.floor(totalDataLines / parts);
  const rem = totalDataLines % parts;
  const sizes = [];
  for (let i = 0; i < parts; i += 1) {
    sizes.push(base + (i < rem ? 1 : 0));
  }
  return sizes;
}

/**
 * @param {string} baseName basename without ext, e.g. export-part-04-of-04
 * @param {string} ext
 * @param {string} dir
 * @param {'min' | 'max'} agg
 */
async function resolveMaxBytesFromReferenceParts(baseName, ext, dir, agg) {
  const re = /^export-part-(\d+)-of-(\d+)$/;
  const m = re.exec(baseName);
  if (!m) {
    throw new Error(
      '--max-bytes-from-parts requires input basename like export-part-NN-of-TT (e.g. export-part-04-of-04.txt)'
    );
  }
  const totalParts = m[2];
  const sizes = [];
  for (let i = 1; i <= 3; i += 1) {
    const name = `export-part-${String(i).padStart(2, '0')}-of-${totalParts}${ext}`;
    const p = path.join(dir, name);
    const st = await fs.stat(p);
    sizes.push(st.size);
  }
  return agg === 'min' ? Math.min(...sizes) : Math.max(...sizes);
}

/**
 * @param {number} subIdx
 * @param {number} subTotal
 * @param {string} baseName
 * @param {string} sourcePathRel
 * @param {string} exportHeaderLine
 */
function buildSubchunkHeader(subIdx, subTotal, baseName, sourcePathRel, exportHeaderLine) {
  return [
    `# SUBCHUNK ${String(subIdx).padStart(2, '0')}/${String(subTotal).padStart(2, '0')} — split from ${baseName}`,
    `# source_path=${sourcePathRel}`,
    exportHeaderLine
  ].join('\n') + '\n';
}

/**
 * @param {string[]} dataLines
 * @param {number} maxBodyBytes
 * @returns {string[][]}
 */
function packGroupsByBodyBudget(dataLines, maxBodyBytes) {
  const groups = [];
  let cur = [];
  let body = 0;
  for (const line of dataLines) {
    const lineB = Buffer.byteLength(`${line}\n`, 'utf8');
    if (cur.length > 0 && body + lineB > maxBodyBytes) {
      groups.push(cur);
      cur = [];
      body = 0;
    }
    cur.push(line);
    body += lineB;
  }
  if (cur.length) {
    groups.push(cur);
  }
  return groups;
}

/**
 * @param {string[]} dataLines
 * @param {number} maxBytes
 * @param {string} baseName
 * @param {string} sourcePathRel
 * @param {string} exportHeaderLine
 */
function packSubchunksWithinBudget(dataLines, maxBytes, baseName, sourcePathRel, exportHeaderLine) {
  const worstHeader = Buffer.byteLength(
    buildSubchunkHeader(99, 99, baseName, sourcePathRel, exportHeaderLine),
    'utf8'
  );
  let maxBodyBytes = maxBytes - worstHeader;
  if (maxBodyBytes < 512) {
    throw new Error('--max-bytes is too small to fit the subchunk header');
  }
  for (let iter = 0; iter < 80; iter += 1) {
    const groups = packGroupsByBodyBudget(dataLines, maxBodyBytes);
    const subTotal = groups.length;
    let allOk = true;
    for (let i = 0; i < groups.length; i += 1) {
      const h = buildSubchunkHeader(i + 1, subTotal, baseName, sourcePathRel, exportHeaderLine);
      const b = groups[i].map((l) => `${l}\n`).join('');
      if (Buffer.byteLength(h + b, 'utf8') > maxBytes) {
        allOk = false;
        break;
      }
    }
    if (allOk) {
      return { groups, maxBodyBytes };
    }
    maxBodyBytes -= 8192;
  }
  throw new Error(
    'Could not pack subchunks within --max-bytes. Increase the limit, or a single data line may exceed the budget.'
  );
}

/**
 * @param {{ input: string, maxBytes: number | null, maxBytesFromParts: boolean, referencePartsAgg: 'min' | 'max' }} args
 */
async function byteSplitMain(args) {
  if (!args.maxBytes && !args.maxBytesFromParts) {
    throw new Error('byte-split requires --max-bytes <n> or --max-bytes-from-parts [min|max]');
  }

  const abs = path.resolve(args.input);
  const dir = path.dirname(abs);
  const baseName = path.basename(abs, path.extname(abs));
  const ext = path.extname(abs) || '.txt';

  let maxBytes = args.maxBytes;
  if (args.maxBytesFromParts) {
    maxBytes = await resolveMaxBytesFromReferenceParts(baseName, ext, dir, args.referencePartsAgg);
  }
  if (maxBytes == null || maxBytes < 2048) {
    throw new Error('Resolved max-bytes is invalid');
  }

  const lines = await readAllLines(abs);
  if (lines.length < 4 || !lines[0].startsWith('# CHUNK')) {
    throw new Error(
      'byte-split expects a chunk file: line 1 # CHUNK …, line 2 # source_path=…, line 3 # AI_CONTEXT_EXPORT …, then data lines'
    );
  }

  const sourcePathRel = lines[1].replace(/^#\s*source_path=/, '').trim();
  const exportHeaderLine = lines[2];
  const dataLines = lines.slice(3);

  const { groups } = packSubchunksWithinBudget(
    dataLines,
    maxBytes,
    baseName,
    sourcePathRel,
    exportHeaderLine
  );

  const subTotal = groups.length;
  const outputs = [];

  for (let i = 0; i < groups.length; i += 1) {
    const subIdx = i + 1;
    const header = buildSubchunkHeader(subIdx, subTotal, baseName, sourcePathRel, exportHeaderLine);
    const body = groups[i].map((l) => `${l}\n`).join('');
    const outName = `${baseName}-sub-${String(subIdx).padStart(2, '0')}-of-${String(subTotal).padStart(2, '0')}${ext}`;
    const outPath = path.join(dir, outName);
    await fs.writeFile(outPath, header + body, 'utf8');
    outputs.push(outName);
  }

  const byteSizes = await Promise.all(outputs.map((n) => fs.stat(path.join(dir, n)).then((s) => s.size)));

  console.log(
    JSON.stringify(
      {
        mode: 'byte-split',
        input: path.relative(process.cwd(), abs).split(path.sep).join('/'),
        maxBytes,
        referencePartsAgg: args.maxBytesFromParts ? args.referencePartsAgg : undefined,
        dataLines: dataLines.length,
        subchunks: subTotal,
        outputs,
        outputBytes: byteSizes
      },
      null,
      2
    )
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.byteSplit) {
    await byteSplitMain(args);
    return;
  }

  const { input, parts } = args;
  const abs = path.resolve(input);
  const dir = path.dirname(abs);
  const baseName = path.basename(abs, path.extname(abs));
  const ext = path.extname(abs) || '.txt';

  const lines = await readAllLines(abs);
  const totalLines = lines.length;
  if (totalLines < 2) {
    throw new Error('Export file must have a header line and at least one data line');
  }

  const headerLine = lines[0];
  const dataLines = lines.slice(1);
  const dataLineCount = dataLines.length;
  const sizes = computeChunkSizes(dataLineCount, parts);
  const sumSizes = sizes.reduce((a, b) => a + b, 0);
  if (sumSizes !== dataLineCount) {
    throw new Error(`Internal chunk size mismatch: ${sumSizes} !== ${dataLineCount}`);
  }

  let offset = 0;
  for (let chunkIdx = 0; chunkIdx < parts; chunkIdx += 1) {
    const chunkSize = sizes[chunkIdx];
    const slice = dataLines.slice(offset, offset + chunkSize);
    offset += chunkSize;
    if (slice.length !== chunkSize) {
      throw new Error(
        `Chunk ${chunkIdx + 1}: expected ${chunkSize} data lines, got ${slice.length}`
      );
    }

    const part = String(chunkIdx + 1).padStart(2, '0');
    const outName = `${baseName}-part-${part}-of-${String(parts).padStart(2, '0')}${ext}`;
    const outPath = path.join(dir, outName);
    const header = [
      `# CHUNK ${chunkIdx + 1}/${parts} — split from ${path.basename(abs)}`,
      `# source_path=${path.relative(process.cwd(), abs).split(path.sep).join('/')}`,
      headerLine
    ].join('\n') + '\n';
    const body = slice.map((l) => `${l}\n`).join('');
    await fs.writeFile(outPath, header + body, 'utf8');
  }

  if (offset !== dataLineCount) {
    throw new Error(`Offset after writes ${offset} !== data lines ${dataLineCount}`);
  }

  console.log(
    JSON.stringify(
      {
        input: path.relative(process.cwd(), abs).split(path.sep).join('/'),
        totalLines,
        dataLines: dataLineCount,
        parts,
        chunkSizes: sizes,
        outputs: sizes.map((_, i) => {
          const part = String(i + 1).padStart(2, '0');
          return `${baseName}-part-${part}-of-${String(parts).padStart(2, '0')}${ext}`;
        })
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(`[chunk-export] ${e.message}`);
  process.exitCode = 1;
});
