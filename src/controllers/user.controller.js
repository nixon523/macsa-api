import asyncHandler from '../utils/asyncHandler.js';
import * as userService from '../services/user.service.js';
import { ApiError } from '../utils/ApiError.js';

export const listUsers = asyncHandler(async (_req, res) => {
  res.json(await userService.getAllUsers());
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(Number(req.params.id));
  if (!user) {
    throw ApiError.notFound('Usuario no encontrado.');
  }
  res.json(user);
});

export const createUser = asyncHandler(async (req, res) => {
  const result = await userService.createUser(req.body);
  res.status(201).json(result[0] ?? result);
});

export const updateUser = asyncHandler(async (req, res) => {
  await userService.updateUser(Number(req.params.id), req.body);
  res.json({ message: 'Usuario actualizado correctamente.' });
});

export const toggleUserDisabled = asyncHandler(async (req, res) => {
  await userService.toggleUserDisabled(Number(req.params.id), Boolean(req.body.disabled));
  res.json({ message: 'Estado del usuario actualizado correctamente.' });
});
