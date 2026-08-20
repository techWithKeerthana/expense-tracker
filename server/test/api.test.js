const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { createApp } = require('../src/app');

process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';

let mongod;
let server;
let baseUrl;

async function request(method, path, body, token) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

test.before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  const app = createApp();
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
  await new Promise((resolve) => server.close(resolve));
});

test('health check responds', async () => {
  const { status, body } = await request('GET', '/health');
  assert.equal(status, 200);
  assert.equal(body.status, 'ok');
});

test('rejects registration with weak password', async () => {
  const { status } = await request('POST', '/api/auth/register', {
    name: 'Test User',
    email: 'weak@example.com',
    password: '123',
  });
  assert.equal(status, 400);
});

test('rejects registration with a password missing required character classes', async () => {
  const { status, body } = await request('POST', '/api/auth/register', {
    name: 'Test User',
    email: 'weak2@example.com',
    password: 'alllowercase1', // no uppercase, no special character
  });
  assert.equal(status, 400);
  assert.match(body.message, /uppercase|special/);
});

test('registers, logs in, and fetches profile', async () => {
  const reg = await request('POST', '/api/auth/register', {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'Supersecret1!',
  });
  assert.equal(reg.status, 201);
  assert.ok(reg.body.token);
  assert.equal(reg.body.user.email, 'ada@example.com');
  assert.equal(reg.body.user.passwordHash, undefined);

  const login = await request('POST', '/api/auth/login', {
    email: 'ada@example.com',
    password: 'Supersecret1!',
  });
  assert.equal(login.status, 200);
  assert.ok(login.body.token);

  const me = await request('GET', '/api/auth/me', undefined, login.body.token);
  assert.equal(me.status, 200);
  assert.equal(me.body.user.name, 'Ada Lovelace');
});

test('rejects duplicate email registration', async () => {
  const { status } = await request('POST', '/api/auth/register', {
    name: 'Duplicate',
    email: 'ada@example.com',
    password: 'Supersecret1!',
  });
  assert.equal(status, 409);
});

test('rejects wrong password', async () => {
  const { status } = await request('POST', '/api/auth/login', {
    email: 'ada@example.com',
    password: 'wrongpassword',
  });
  assert.equal(status, 401);
});

test('blocks transaction access without a token', async () => {
  const { status } = await request('GET', '/api/transactions');
  assert.equal(status, 401);
});

test('syncs transactions and scopes them per user', async () => {
  const userA = await request('POST', '/api/auth/register', {
    name: 'User A',
    email: 'a@example.com',
    password: 'PasswordA1!',
  });
  const userB = await request('POST', '/api/auth/register', {
    name: 'User B',
    email: 'b@example.com',
    password: 'PasswordB1!',
  });

  const sync = await request(
    'POST',
    '/api/transactions/sync',
    {
      transactions: [
        {
          clientId: 'tx-1',
          title: 'Groceries',
          amount: 500,
          type: 'expense',
          category: 'Food',
          date: '2026-08-01T00:00:00.000Z',
          clientUpdatedAt: '2026-08-01T00:00:00.000Z',
        },
      ],
    },
    userA.body.token
  );
  assert.equal(sync.status, 200);
  assert.equal(sync.body.transactions.length, 1);

  const listA = await request('GET', '/api/transactions', undefined, userA.body.token);
  assert.equal(listA.body.transactions.length, 1);

  const listB = await request('GET', '/api/transactions', undefined, userB.body.token);
  assert.equal(listB.body.transactions.length, 0, 'user B must not see user A transactions');
});

test('last-write-wins: older update is ignored, newer update applies', async () => {
  const user = await request('POST', '/api/auth/register', {
    name: 'LWW User',
    email: 'lww@example.com',
    password: 'PasswordLWW1!',
  });
  const token = user.body.token;

  await request(
    'POST',
    '/api/transactions/sync',
    {
      transactions: [
        {
          clientId: 'tx-lww',
          title: 'Original',
          amount: 100,
          type: 'expense',
          category: 'Food',
          date: '2026-08-01T00:00:00.000Z',
          clientUpdatedAt: '2026-08-01T10:00:00.000Z',
        },
      ],
    },
    token
  );

  // Older write should be ignored.
  const olderWrite = await request(
    'POST',
    '/api/transactions/sync',
    {
      transactions: [
        {
          clientId: 'tx-lww',
          title: 'Stale',
          amount: 999,
          type: 'expense',
          category: 'Food',
          date: '2026-08-01T00:00:00.000Z',
          clientUpdatedAt: '2026-08-01T09:00:00.000Z',
        },
      ],
    },
    token
  );
  assert.equal(olderWrite.body.transactions[0].title, 'Original');

  // Newer write should apply.
  const newerWrite = await request(
    'POST',
    '/api/transactions/sync',
    {
      transactions: [
        {
          clientId: 'tx-lww',
          title: 'Updated',
          amount: 200,
          type: 'expense',
          category: 'Food',
          date: '2026-08-01T00:00:00.000Z',
          clientUpdatedAt: '2026-08-01T11:00:00.000Z',
        },
      ],
    },
    token
  );
  assert.equal(newerWrite.body.transactions[0].title, 'Updated');
});

test('budget sync upserts and returns authoritative document', async () => {
  const user = await request('POST', '/api/auth/register', {
    name: 'Budget User',
    email: 'budget@example.com',
    password: 'PasswordBudget1!',
  });
  const token = user.body.token;

  const sync = await request(
    'POST',
    '/api/budgets/sync',
    {
      monthlyLimit: 20000,
      categoryBudgets: [{ category: 'Food', limit: 5000 }],
      clientUpdatedAt: '2026-08-01T00:00:00.000Z',
    },
    token
  );
  assert.equal(sync.status, 200);
  assert.equal(sync.body.budget.monthlyLimit, 20000);

  const get = await request('GET', '/api/budgets', undefined, token);
  assert.equal(get.body.budget.monthlyLimit, 20000);
});
