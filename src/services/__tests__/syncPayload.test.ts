import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGoalSyncPayload, buildTransactionSyncPayload } from '../syncPayload';
import { Goal, Transaction } from '../../types';

function tx(overrides: Partial<Transaction> & Pick<Transaction, 'id' | 'amount' | 'type' | 'category'>): Transaction {
  const now = new Date().toISOString();
  return {
    title: `Transaction ${overrides.id}`,
    date: now,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function goal(overrides: Partial<Goal> & Pick<Goal, 'id' | 'targetAmount' | 'savedAmount'>): Goal {
  const now = new Date().toISOString();
  return {
    name: `Goal ${overrides.id}`,
    icon: 'flag-outline',
    targetDate: now,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

test('active transactions are included in the payload as not deleted', () => {
  const local = [tx({ id: 'a', amount: 100, type: 'expense', category: 'Food' })];
  const payload = buildTransactionSyncPayload(local, []);
  assert.equal(payload.length, 1);
  assert.equal(payload[0].clientId, 'a');
  assert.equal(payload[0].deleted, false);
});

test('a deleted transaction (tombstone) is still included in the payload, marked deleted — regression test for the resurrection bug', () => {
  // Before the fix, `transactionStorage.remove()` dropped the record entirely and the sync payload
  // was built only from what's still in local storage — so a deletion was never actually sent to
  // the server, and the next sync response (still `deleted: false` server-side) brought it back.
  const local: Transaction[] = [];
  const tombstones = [tx({ id: 'a', amount: 100, type: 'expense', category: 'Food' })];
  const payload = buildTransactionSyncPayload(local, tombstones);
  assert.equal(payload.length, 1);
  assert.equal(payload[0].clientId, 'a');
  assert.equal(payload[0].deleted, true);
});

test('active and tombstoned transactions can both be present in one payload without dropping either', () => {
  const local = [tx({ id: 'active', amount: 50, type: 'income', category: 'Salary' })];
  const tombstones = [tx({ id: 'deleted', amount: 20, type: 'expense', category: 'Travel' })];
  const payload = buildTransactionSyncPayload(local, tombstones);
  assert.equal(payload.length, 2);
  assert.equal(payload.find((p) => p.clientId === 'active')?.deleted, false);
  assert.equal(payload.find((p) => p.clientId === 'deleted')?.deleted, true);
});

test('a deleted goal (tombstone) is included in the goal payload, marked deleted', () => {
  const tombstones = [goal({ id: 'g1', targetAmount: 1000, savedAmount: 200 })];
  const payload = buildGoalSyncPayload([], tombstones);
  assert.equal(payload.length, 1);
  assert.equal(payload[0].clientId, 'g1');
  assert.equal(payload[0].deleted, true);
});

test('active goals are included in the goal payload as not deleted', () => {
  const local = [goal({ id: 'g1', targetAmount: 1000, savedAmount: 200 })];
  const payload = buildGoalSyncPayload(local, []);
  assert.equal(payload.length, 1);
  assert.equal(payload[0].deleted, false);
});
