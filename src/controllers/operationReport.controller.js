import asyncHandler from '../utils/asyncHandler.js';
import * as orService from '../services/operationReport.service.js';

// POST /reportes-operacion  (crear o actualizar reporte de un día)
export const registrarReporte = asyncHandler(async (req, res) => {
  const result = await orService.registrarReporteOperacion(req.body, req.user);
  res.status(200).json(result[0] ?? result);
});

// GET /reportes-operacion/activo/:codigoActivo
export const obtenerPorActivo = asyncHandler(async (req, res) => {
  const { codigoActivo } = req.params;
  const { fechaDesde, fechaHasta, pagina, registrosPorPagina } = req.query;
  const result = await orService.obtenerReportesPorActivo(codigoActivo, {
    fechaDesde,
    fechaHasta,
    pagina:             pagina             ? parseInt(pagina, 10)             : 1,
    registrosPorPagina: registrosPorPagina ? parseInt(registrosPorPagina, 10) : 30,
  });
  res.json(result);
});

// GET /reportes-operacion/semana?areaId=A001&lunes=2026-09-01
export const obtenerPorSemana = asyncHandler(async (req, res) => {
  const { areaId, lunes } = req.query;
  if (!areaId || !lunes) {
    return res.status(400).json({ message: 'Se requieren areaId y lunes (fecha del lunes de la semana).' });
  }
  const result = await orService.obtenerReportesPorSemana(areaId, lunes);
  res.json(result);
});

// GET /reportes-operacion/metricas/:codigoActivo?desde=2026-01-01&hasta=2026-09-04
export const obtenerMetricas = asyncHandler(async (req, res) => {
  const { codigoActivo } = req.params;
  const { desde, hasta } = req.query;
  if (!desde || !hasta) {
    return res.status(400).json({ message: 'Se requieren los parámetros desde y hasta (fechas).' });
  }
  const result = await orService.obtenerMetricas(codigoActivo, desde, hasta);
  res.json(result[0] ?? result);
});

// GET /reportes-operacion/equipos?areaId=A001
export const listarEquipos = asyncHandler(async (req, res) => {
  const { areaId } = req.query;
  const result = await orService.listarEquiposProceso(areaId ?? null);
  res.json(result);
});

// PATCH /reportes-operacion/equipos/:codigoActivo/proceso
export const toggleEquipoProceso = asyncHandler(async (req, res) => {
  const { codigoActivo } = req.params;
  const { esEquipoProceso } = req.body;
  if (typeof esEquipoProceso === 'undefined') {
    return res.status(400).json({ message: 'Se requiere el campo esEquipoProceso (true/false).' });
  }
  const result = await orService.actualizarEsEquipoProceso(codigoActivo, esEquipoProceso, req.user);
  res.json(result[0] ?? result);
});
