import asyncHandler from '../utils/asyncHandler.js';
import * as employeeService from '../services/employee.service.js';
import { parsePagination } from '../utils/pagination.js';

export const listEmployees = asyncHandler(async (req, res) => {
  const onlyActive = req.query.onlyActive !== 'false' && req.query.onlyActive !== false;
  const isMaintenance = req.query.isMaintenance !== undefined ? req.query.isMaintenance === 'true' : null;
  const areaId = req.query.areaId || null;
  const searchQuery = req.query.searchQuery || null;
  const { limit, offset } = parsePagination(req.query);

  const employees = await employeeService.getEmployees({
    onlyActive,
    isMaintenance,
    areaId,
    searchQuery,
    limit,
    offset,
  });
  res.json(employees);
});

export const createEmployee = asyncHandler(async (req, res) => {
  const result = await employeeService.createEmployee(req.body, req.user);
  res.status(201).json(result[0] ?? result);
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const result = await employeeService.updateEmployee(req.params.id, req.body, req.user);
  res.json(result[0] ?? result);
});

export const toggleEmployeeStatus = asyncHandler(async (req, res) => {
  const active = req.body.active !== false;
  await employeeService.toggleEmployeeStatus(req.params.id, active, req.user);
  res.json({ message: active ? 'Empleado reactivado con éxito.' : 'Empleado dado de baja con éxito.' });
});

export const listPositions = asyncHandler(async (req, res) => {
  const onlyActive = req.query.onlyActive !== 'false';
  const positions = await employeeService.getPositions({ onlyActive });
  res.json(positions);
});

export const createPosition = asyncHandler(async (req, res) => {
  const result = await employeeService.createPosition(req.body, req.user);
  res.status(201).json(result[0] ?? result);
});

export const updatePosition = asyncHandler(async (req, res) => {
  const result = await employeeService.updatePosition(req.params.id, req.body, req.user);
  res.json(result[0] ?? result);
});

export const deletePosition = asyncHandler(async (req, res) => {
  await employeeService.deletePosition(req.params.id, req.user);
  res.json({ message: 'Puesto eliminado del catálogo correctamente.' });
});
