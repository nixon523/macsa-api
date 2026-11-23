import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';
import * as authService from '../src/services/auth.service.js';

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

test('Session Concurrency: limits to 2 simultaneous sessions per user (FIFO displacement)', async () => {
  const userId = 1;
  const suffix = Date.now();
  const session1 = `test-token-uuid-1-${suffix}`;
  const session2 = `test-token-uuid-2-${suffix}`;
  const session3 = `test-token-uuid-3-${suffix}`;

  // Registrar sesión 1
  await authService.registerSession(userId, session1);
  assert.equal(await authService.isSessionActive(userId, session1), true);

  // Registrar sesión 2 -> ambas activas
  await authService.registerSession(userId, session2);
  assert.equal(await authService.isSessionActive(userId, session1), true);
  assert.equal(await authService.isSessionActive(userId, session2), true);

  // Registrar sesión 3 -> desplaza la sesión 1 (más antigua)
  await authService.registerSession(userId, session3);
  assert.equal(await authService.isSessionActive(userId, session1), false, 'Sesión 1 debió ser invalidada');
  assert.equal(await authService.isSessionActive(userId, session2), true, 'Sesión 2 debe seguir activa');
  assert.equal(await authService.isSessionActive(userId, session3), true, 'Sesión 3 debe estar activa');

  // Cerrar sesión 3 explícitamente (Logout)
  await authService.closeSession(userId, session3);
  assert.equal(await authService.isSessionActive(userId, session3), false, 'Sesión 3 debió cerrarse');
});
