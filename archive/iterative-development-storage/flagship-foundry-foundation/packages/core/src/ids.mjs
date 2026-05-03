let sequence = 0;

export function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'item';
}

export function makeId(prefix, seed) {
  sequence += 1;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${prefix}:${slugify(seed)}:${stamp}:${String(sequence).padStart(4, '0')}`;
}
