import crypto from 'node:crypto';

import asyncHandler from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';
import { signToken } from '../security/jwt.js';
import { rolePermissions } from '../security/rolePermissions.js';

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await authService.login(username, password);

  const effectivePermissions = (user.permissions && user.permissions.length > 0)
    ? user.permissions
    : rolePermissions(user.roleCode);

  const sessionId = crypto.randomUUID();
  const ip = req.ip || req.connection?.remoteAddress || null;
  const userAgent = req.headers['user-agent'] ? String(req.headers['user-agent']).substring(0, 255) : null;

  try {
    await authService.registerSession(user.userId, sessionId, ip, userAgent);
  } catch (err) {
    console.error('[auth] Error al registrar sesion concurrente:', err);
  }

  const token = signToken({
    sub: user.userId,
    jti: sessionId,
    username: user.username,
    displayName: user.displayName,
    role: user.roleCode,
    permissions: effectivePermissions,
  });

  res.json({ token, user: { ...user, permissions: effectivePermissions } });
});

export const logout = asyncHandler(async (req, res) => {
  if (req.user?.userId && req.sessionTokenId) {
    try {
      await authService.closeSession(req.user.userId, req.sessionTokenId);
    } catch (err) {
      console.error('[auth] Error al cerrar sesion:', err);
    }
  }
  res.json({ message: 'Sesión cerrada exitosamente.' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.userId, currentPassword, newPassword);
  res.json({ message: 'Contraseña actualizada correctamente.' });
});

export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { username } = req.body;
  await authService.requestPasswordReset(username);
  res.json({
    message:
      'Si el usuario existe, la solicitud fue registrada. Un administrador atenderá tu petición.',
  });
});

export const pendingPasswordResets = asyncHandler(async (_req, res) => {
  const solicitudes = await authService.pendingPasswordResets();
  res.json(solicitudes);
});

export const resolvePasswordReset = asyncHandler(async (req, res) => {
  const requestId = Number(req.params.id);
  const targetUserId = Number(req.body.userId);
  const result = await authService.resolvePasswordReset(requestId, targetUserId);
  res.json({
    message: 'Contraseña temporal generada. Comuníquela al usuario de forma segura.',
    ...result,
  });
});
