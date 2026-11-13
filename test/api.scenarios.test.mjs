import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';
import { signToken } from '../src/security/jwt.js';
import { closePool } from '../src/config/db.js';
import { parsePagination } from '../src/utils/pagination.js';

let server;
let baseUrl;
let adminToken;
let lectorToken;

test.before((_, done) => {
  server = http.createServer(app);
  server.listen(0, '127.0.0.1', () => {
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}/api`;
    adminToken = signToken({
      userId: 1,
      username: 'admin',
      displayName: 'Administrador',
      role: 'admin',
      permissions: [],
    });
    lectorToken = signToken({
      userId: 99,
      username: 'lector_test',
      displayName: 'Gerente Test',
      role: 'lector',
      permissions: [],
    });
    done();
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await closePool();
});

test('Pagination helper: parses page/limit, offset/limit and clamps maxLimit', () => {
  assert.deepEqual(parsePagination({}), { limit: null, offset: 0 });
  assert.deepEqual(parsePagination({ page: '2', limit: '25' }), { limit: 25, offset: 25 });
  assert.deepEqual(parsePagination({ offset: '10', limit: '50' }), { limit: 50, offset: 10 });
  assert.deepEqual(parsePagination({ limit: '9999' }, { maxLimit: 500 }), { limit: 500, offset: 0 });
  assert.deepEqual(parsePagination({ page: '-3', limit: '10' }), { limit: 10, offset: 0 });
});

test('Catalogs endpoint: requires auth and returns dynamic DB catalogs when authenticated', async () => {
  const unauth = await fetch(`${baseUrl}/catalogos`);
  assert.equal(unauth.status, 401);

  const res = await fetch(`${baseUrl}/catalogos`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.roles) && data.roles.length >= 5);
  assert.ok(Array.isArray(data.permissions) && data.permissions.length >= 15);
  assert.ok(data.rolePermissions && Array.isArray(data.rolePermissions.jefe));
  assert.ok(Array.isArray(data.positions) && data.positions.length >= 1);
  assert.ok(data.enums && Array.isArray(data.enums.preventiveFrequencies));
});

test('Employees endpoint: returns normalized PuestoId & respects pagination', async () => {
  const res = await fetch(`${baseUrl}/empleados?limit=2&offset=0`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(res.status, 200);
  const rows = await res.json();
  assert.ok(Array.isArray(rows));
  assert.ok(rows.length <= 2);
  if (rows.length > 0) {
    assert.ok(rows[0].PuestoId !== undefined, 'Debe incluir PuestoId normalizado');
    assert.ok(rows[0].Puesto, 'Debe incluir Puesto');
  }
});

test('Scalability pagination: work orders, breakdowns, kardex and asset search accept limit & page', async () => {
  const headers = { Authorization: `Bearer ${adminToken}` };

  const [woRes, brRes, kxRes, asRes] = await Promise.all([
    fetch(`${baseUrl}/ordenes-trabajo?limit=3&page=1`, { headers }),
    fetch(`${baseUrl}/reportes-averia?limit=3&page=1`, { headers }),
    fetch(`${baseUrl}/kardex?limit=3&offset=0`, { headers }),
    fetch(`${baseUrl}/activos/buscar?q=&limit=3&offset=0`, { headers }),
  ]);

  assert.equal(woRes.status, 200);
  assert.equal(brRes.status, 200);
  assert.equal(kxRes.status, 200);
  assert.equal(asRes.status, 200);

  const [wos, brs, kxs, assets] = await Promise.all([
    woRes.json(),
    brRes.json(),
    kxRes.json(),
    asRes.json(),
  ]);

  assert.ok(Array.isArray(wos) && wos.length <= 3);
  assert.ok(Array.isArray(brs) && brs.length <= 3);
  assert.ok(Array.isArray(kxs) && kxs.length <= 3);
  assert.ok(Array.isArray(assets) && assets.length <= 3);
});

test('RBAC enforcement: lector cannot create work order or manage employees (403)', async () => {
  const headers = {
    Authorization: `Bearer ${lectorToken}`,
    'Content-Type': 'application/json',
  };

  const woCreate = await fetch(`${baseUrl}/ordenes-trabajo`, {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  });
  assert.equal(woCreate.status, 403);

  const empCreate = await fetch(`${baseUrl}/empleados`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ fullName: 'Test', position: 'Técnico' }),
  });
  assert.equal(empCreate.status, 403);
});
