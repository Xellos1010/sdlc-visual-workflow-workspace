import test from 'node:test';
import assert from 'node:assert/strict';
import { addContextCartItem, createContextCart, loadContextCart, saveContextCart } from '../packages/core/src/context-cart.mjs';
import { canGeneratePlanFromRefinement, createRefinementSession, loadRefinementSession, saveRefinementSession } from '../packages/core/src/requirement-refinement.mjs';

test('context carts retain traceable selected artifacts and refinement sessions surface DoR posture', async () => {
  const ecosystemId = `test-context-cart-${Date.now()}`;
  let cart = createContextCart({
    workspaceTargetId: 'target:workspace',
    title: 'Operator context'
  });
  cart = addContextCartItem(cart, {
    kind: 'file',
    label: 'README',
    authority: 'workspace',
    path: '/tmp/README.md'
  });
  cart = addContextCartItem(cart, {
    kind: 'note',
    label: 'Goal',
    authority: 'manual',
    content: 'Turn the extension into an operator cockpit.'
  });
  await saveContextCart(ecosystemId, cart);

  const savedCart = await loadContextCart(ecosystemId, cart.cartId);
  assert.equal(savedCart.items.length, 2);
  assert.equal(savedCart.items[0].authority, 'workspace');

  const readySession = createRefinementSession({
    workspaceTargetId: 'target:workspace',
    contextCart: savedCart,
    objective: 'Build the operator cockpit',
    acceptanceCriteria: ['Workspace target is explicit before planning']
  });
  await saveRefinementSession(ecosystemId, readySession);

  const loaded = await loadRefinementSession(ecosystemId, readySession.sessionId);
  assert.equal(loaded.definitionOfReady.status, 'ready');
  assert.equal(canGeneratePlanFromRefinement(loaded), true);
});
