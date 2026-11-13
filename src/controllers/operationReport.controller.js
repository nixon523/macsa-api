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

// GET /reportes-operacion/analitica/historial-activo/:codigoActivo
export const obtenerHistorialActivo = asyncHandler(async (req, res) => {
  const { codigoActivo } = req.params;
  const { fechaDesde, fechaHasta, incluirHijos } = req.query;
  const resultSets = await orService.obtenerHistorialActivo(codigoActivo, {
    fechaDesde,
    fechaHasta,
    incluirHijos: incluirHijos !== 'false' && incluirHijos !== '0',
  });

  // Los SPs con múltiples SELECTs devuelven un array de arrays en mssql/execProc
  const resumen = Array.isArray(resultSets[0]) ? resultSets[0][0] : resultSets[0] || {};
  const timeline = Array.isArray(resultSets[1]) ? resultSets[1] : [];
  const repuestos = Array.isArray(resultSets[2]) ? resultSets[2] : [];

  res.json({
    resumen,
    timeline,
    repuestos,
  });
});

// GET /reportes-operacion/analitica/estacionalidad?areaId=A001&anio=2026
export const obtenerEstacionalidad = asyncHandler(async (req, res) => {
  const { areaId, anio } = req.query;
  const result = await orService.obtenerEstacionalidadAverias({
    areaId: areaId || null,
    anio:   anio ? parseInt(anio, 10) : null,
  });
  res.json(result);
});

// GET /reportes-operacion/analitica/top-fallas?areaId=A001&fechaDesde=2026-01-01&fechaHasta=2026-12-31&top=10
export const obtenerTopFallas = asyncHandler(async (req, res) => {
  const { areaId, fechaDesde, fechaHasta, top } = req.query;
  const result = await orService.obtenerTopEquiposFallas({
    areaId:     areaId || null,
    fechaDesde: fechaDesde || null,
    fechaHasta: fechaHasta || null,
    top:        top ? parseInt(top, 10) : 10,
  });
  res.json(result);
});

// GET /reportes-operacion/analitica/consumo-repuestos?areaId=A001&codigoActivo=A001-001&top=20
export const obtenerConsumoRepuestos = asyncHandler(async (req, res) => {
  const { areaId, codigoActivo, fechaDesde, fechaHasta, top } = req.query;
  const result = await orService.obtenerConsumoRepuestos({
    areaId:       areaId || null,
    codigoActivo: codigoActivo || null,
    fechaDesde:   fechaDesde || null,
    fechaHasta:   fechaHasta || null,
    top:          top ? parseInt(top, 10) : 20,
  });
  res.json(result);
});

// GET /reportes-operacion/analitica/oee-general?areaId=A001&fechaDesde=2026-01-01&fechaHasta=2026-12-31
export const obtenerOEEGeneral = asyncHandler(async (req, res) => {
  const { areaId, codigoActivo, fechaDesde, fechaHasta } = req.query;
  const result = await orService.obtenerOEEGeneral({
    areaId:       areaId || null,
    codigoActivo: codigoActivo || null,
    fechaDesde:   fechaDesde || null,
    fechaHasta:   fechaHasta || null,
  });
  res.json(result);
});
