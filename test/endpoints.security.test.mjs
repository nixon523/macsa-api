import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import http from 'node:http';
import { signToken } from '../src/security/jwt.js';

let server;
let baseUrl;

test.before((_, done) => {
  server = http.createServer(app);
  server.listen(0, '127.0.0.1', () => {
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}/api`;
    done();
  });
});

test.after((_, done) => {
  server.close(done);
});

test('Endpoint Security: Health Check returns 200 OK', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
});

test('Endpoint Security: 404 handler returns clean JSON for non-existing route', async () => {
  const res = await fetch(`${baseUrl}/ruta-inexistente-12345`);
  assert.equal(res.status, 404);
  const data = await res.json();
  assert.match(data.message, /Ruta no encontrada/);
});

test('Endpoint Security: Unauthenticated request to protected endpoint returns 401 Unauthorized', async () => {
  const res = await fetch(`${baseUrl}/autenticacion/yo`);
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.match(data.message, /Token no proporcionado/);
});

test('Endpoint Security: Login validator rejects empty username or password with 422 Unprocessable', async () => {
  const res = await fetch(`${baseUrl}/autenticacion/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: '', password: '' }),
  });
  assert.equal(res.status, 422);
  const data = await res.json();
  assert.ok(data.errores || data.message);
});

test('Endpoint Security: Password reset request requires valid username', async () => {
  const res = await fetch(`${baseUrl}/autenticacion/solicitudes-reinicio-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: '' }),
  });
  assert.equal(res.status, 422);
});

test('Endpoint Security: Change password rejects passwords shorter than 8 characters', async () => {
  const testToken = signToken({
    sub: 1,
    username: 'admin',
    displayName: 'Administrador',
    role: 'admin',
    permissions: ['all'],
  });

  const res = await fetch(`${baseUrl}/autenticacion/yo/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${testToken}`,
    },
    body: JSON.stringify({
      currentPassword: 'OldPassword123!',
      newPassword: 'short', // Only 5 chars, less than 8
    }),
  });

  assert.equal(res.status, 422);
  const data = await res.json();
  assert.ok(data.errores.some((e) => e.msg.includes('8 caracteres')));
});

test('Endpoint Security: Security Headers (Helmet) are present', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.headers.get('x-dns-prefetch-control'), 'off');
  assert.equal(res.headers.get('x-frame-options'), 'SAMEORIGIN');
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
});
