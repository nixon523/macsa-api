import asyncHandler from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';
import { signToken } from '../security/jwt.js';
import { rolePermissions } from '../security/rolePermissions.js';

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await authService.login(username, password);

  const token = signToken({
    sub: user.userId,
    username: user.username,
    displayName: user.displayName,
    role: user.roleCode,
    permissions: rolePermissions(user.roleCode),
  });

  res.json({ token, user });
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
