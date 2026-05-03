import path from 'node:path';
import { makeId, nowIso, readJson, stateRoot, writeJson } from './io.mjs';

function cartDir(ecosystemId) {
  return path.join(stateRoot, 'ecosystems', ecosystemId, 'operator', 'context-carts');
}

function cartPath(ecosystemId, cartId) {
  return path.join(cartDir(ecosystemId), `${cartId.replace(/[:/]+/g, '-')}.json`);
}

export function createContextCart(input = {}) {
  const timestamp = nowIso();
  return {
    cartId: input.cartId ?? makeId('cart', input.title ?? input.workspaceTargetId ?? timestamp),
    workspaceTargetId: input.workspaceTargetId,
    title: input.title ?? 'Operator context cart',
    objective: input.objective ?? null,
    summary: input.summary ?? null,
    status: input.status ?? 'draft',
    items: Array.isArray(input.items) ? input.items : [],
    createdAt: input.createdAt ?? timestamp,
    updatedAt: input.updatedAt ?? timestamp
  };
}

export function addContextCartItem(cart, item) {
  const itemId = item.itemId ?? makeId('item', `${item.kind ?? 'note'}-${item.label ?? item.path ?? nowIso()}`);
  const nextItem = {
    itemId,
    kind: item.kind ?? 'note',
    label: item.label ?? item.path ?? item.content ?? itemId,
    authority: item.authority ?? 'manual',
    path: item.path ?? null,
    nodeId: item.nodeId ?? null,
    artifactPath: item.artifactPath ?? null,
    sourceUri: item.sourceUri ?? null,
    content: item.content ?? null,
    excerpt: item.excerpt ?? null,
    rationale: item.rationale ?? null,
    metadata: item.metadata ?? {},
    selectedBy: item.selectedBy ?? 'cursor-companion',
    selectedAt: item.selectedAt ?? nowIso(),
    provenance: item.provenance ?? null,
    score: item.score ?? null,
    pinned: Boolean(item.pinned)
  };

  const items = [...(cart.items ?? []).filter((existing) => existing.itemId !== nextItem.itemId), nextItem];
  return {
    ...cart,
    items,
    updatedAt: nowIso()
  };
}

export async function saveContextCart(ecosystemId, cart) {
  const payload = {
    ...cart,
    updatedAt: nowIso()
  };
  await writeJson(cartPath(ecosystemId, payload.cartId), payload);
  return payload;
}

export async function loadContextCart(ecosystemId, cartId) {
  return readJson(cartPath(ecosystemId, cartId), null);
}

export async function listContextCarts(ecosystemId) {
  const directory = cartDir(ecosystemId);
  const fs = await import('node:fs/promises');
  try {
    const entries = await fs.readdir(directory);
    const carts = await Promise.all(entries.filter((entry) => entry.endsWith('.json')).map((entry) => readJson(path.join(directory, entry))));
    return carts.sort((left, right) => (right.updatedAt ?? '').localeCompare(left.updatedAt ?? ''));
  } catch {
    return [];
  }
}
