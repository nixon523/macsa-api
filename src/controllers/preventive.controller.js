import asyncHandler from '../utils/asyncHandler.js';
import * as preventiveService from '../services/preventive.service.js';

export const listPreventiveSchedules = asyncHandler(async (req, res) => {
  res.json(await preventiveService.getAllPreventiveSchedules(req.query));
});

export const createPreventiveSchedule = asyncHandler(async (req, res) => {
  const result = await preventiveService.createPreventiveSchedule(req.body, req.user);
  res.status(201).json(result[0] ?? result);
});

export const amendPreventiveSchedule = asyncHandler(async (req, res) => {
  await preventiveService.amendPreventiveSchedule(Number(req.params.id), req.body, req.user);
  res.json({ message: 'Plan preventivo modificado correctamente.' });
});

export const recordExecution = asyncHandler(async (req, res) => {
  await preventiveService.recordPreventiveExecution(
    Number(req.params.id),
    Number(req.body.workOrderId),
    req.user,
  );
  res.json({ message: 'Ejecución registrada correctamente.' });
});

export const toggleStatus = asyncHandler(async (req, res) => {
  await preventiveService.togglePreventiveScheduleStatus(
    Number(req.params.id),
    req.body,
    req.user,
  );
  res.json({ message: 'Estado del plan preventivo actualizado correctamente.' });
});
