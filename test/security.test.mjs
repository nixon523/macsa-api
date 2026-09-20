import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, generateTemporaryPassword } from '../src/security/password.js';
import { signToken, verifyToken } from '../src/security/jwt.js';
import { hasPermission, PERMISSIONS } from '../src/security/rolePermissions.js';

test('Password Security: PBKDF2 hashing, verification and minimum entropy', () => {
  const plain = 'Admin123!';
  const hashed = hashPassword(plain);

  assert.equal(typeof hashed.salt, 'string');
  assert.equal(typeof hashed.hash, 'string');
  assert.equal(hashed.iterations, 20000);

  // Correct verification
  const valid = verifyPassword(plain, hashed.salt, hashed.hash, hashed.iterations);
  assert.equal(valid, true);

  // Wrong password rejection
  const invalid = verifyPassword('WrongPassword123!', hashed.salt, hashed.hash, hashed.iterations);
  assert.equal(invalid, false);

  // Malformed salt / hash rejection
  const malformed = verifyPassword(plain, 'invalid-salt', hashed.hash, hashed.iterations);
  assert.equal(malformed, false);
});

test('Password Generator: Entropy and minimum length', () => {
  const temp1 = generateTemporaryPassword(12);
  const temp2 = generateTemporaryPassword(12);

  assert.equal(temp1.length, 12);
  assert.equal(temp2.length, 12);
  assert.notEqual(temp1, temp2);
});

test('JWT Security: Sign, verify and reject tampered tokens', () => {
  const payload = {
    sub: 1,
    username: 'admin',
    displayName: 'Administrador General',
    role: 'admin',
    permissions: ['all'],
  };

  const token = signToken(payload);
  assert.equal(typeof token, 'string');

  const decoded = verifyToken(token);
  assert.equal(decoded.sub, 1);
  assert.equal(decoded.username, 'admin');

  // Tampered token rejection
  const tamperedToken = token.slice(0, -4) + 'abcd';
  assert.throws(() => verifyToken(tamperedToken));
});

test('RBAC Matrix: Admin wildcard and granular permission enforcement', () => {
  // Admin role passes all permissions
  assert.equal(hasPermission('admin', [], PERMISSIONS.userManage), true);
  assert.equal(hasPermission('admin', [], PERMISSIONS.assetDeleteApprove), true);

  // Reportador has breakdown permissions but not user manage
  assert.equal(hasPermission('reportador', [], PERMISSIONS.breakdownReport), true);
  assert.equal(hasPermission('reportador', [], PERMISSIONS.userManage), false);

  // User with custom extra permission
  assert.equal(hasPermission('lector', [PERMISSIONS.assetCreate], PERMISSIONS.assetCreate), true);
  assert.equal(hasPermission('lector', [], PERMISSIONS.assetCreate), false);
});
