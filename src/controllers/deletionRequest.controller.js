import asyncHandler from '../utils/asyncHandler.js';
import * as deletionRequestService from '../services/deletionRequest.service.js';

export const listPending = asyncHandler(async (req, res) => {
  res.json(await deletionRequestService.getPendingDeletionRequests(req.query));
});

export const listAll = asyncHandler(async (req, res) => {
  res.json(await deletionRequestService.getAllDeletionRequests(req.query));
});

export const listPendingByAsset = asyncHandler(async (req, res) => {
  res.json(await deletionRequestService.getPendingDeletionRequestsByAsset(req.params.assetCode));
});

export const createDeletionRequest = asyncHandler(async (req, res) => {
  const result = await deletionRequestService.createDeletionRequest(req.body, req.user);
  res.status(201).json(result[0] ?? result);
});

export const approveDeletionRequest = asyncHandler(async (req, res) => {
  await deletionRequestService.approveDeletionRequest(
    Number(req.params.id),
    req.body?.reason,
    req.user,
  );
  res.json({ message: 'Baja aprobada. El activo y su subárbol fueron marcados como eliminados.' });
});

export const rejectDeletionRequest = asyncHandler(async (req, res) => {
  await deletionRequestService.rejectDeletionRequest(
    Number(req.params.id),
    req.body?.reason,
    req.user,
  );
  res.json({ message: 'Solicitud de baja rechazada.' });
});
