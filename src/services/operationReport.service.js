import { execProc } from '../config/db.js';

/**
 * Reporte de Operación Diaria (con soporte OEE)
 */
export async function registrarReporteOperacion(data, user = {}) {
  return execProc('uspReporteOperacionRegistrar', {
    CodigoActivo:          data.codigoActivo,
    FechaOperacion:        data.fechaOperacion,
    HorasTotalesJornada:   data.horasTotalesJornada ?? 24,
    HorasOperacion:        data.horasOperacion,
    HorasParoFalla:        data.horasParoFalla        ?? 0,
    HorasParoMantPrev:     data.horasParoMantPrev     ?? 0,
    HorasParoMantCorr:     data.horasParoMantCorr     ?? 0,
    HorasParoPlanificado:  data.horasParoPlanificado  ?? 0,
    HorasParoExterno:      data.horasParoExterno      ?? 0,
    Observaciones:         data.observaciones         ?? null,
    UsuarioId:             user.userId || null,
    NombreUsuario:         user.displayName || user.username || '',
    UnidadesProducidas:    data.unidadesProducidas    ?? null,
    UnidadesEsperadas:     data.unidadesEsperadas     ?? null,
    UnidadesConformes:     data.unidadesConformes     ?? null,
    RendimientoDirectoPct: data.rendimientoDirectoPct ?? null,
    CalidadDirectoPct:     data.calidadDirectoPct     ?? null,
  });
}

export async function obtenerReportesPorActivo(codigoActivo, { fechaDesde, fechaHasta, pagina = 1, registrosPorPagina = 30 } = {}) {
  return execProc('uspReporteOperacionObtenerPorActivo', {
    CodigoActivo:       codigoActivo,
    FechaDesde:         fechaDesde  ?? null,
    FechaHasta:         fechaHasta  ?? null,
    Pagina:             pagina,
    RegistrosPorPagina: registrosPorPagina,
  });
}

export async function obtenerReportesPorSemana(areaId, lunesDeLaSemana) {
  return execProc('uspReporteOperacionObtenerPorSemana', {
    AreaId:           areaId,
    LunesDeLaSemana:  lunesDeLaSemana,
  });
}

export async function obtenerMetricas(codigoActivo, fechaDesde, fechaHasta) {
  return execProc('uspReporteOperacionMetricas', {
    CodigoActivo: codigoActivo,
    FechaDesde:   fechaDesde,
    FechaHasta:   fechaHasta,
  });
}

export async function listarEquiposProceso(areaId = null) {
  return execProc('uspEquipoProcesoListarPorArea', {
    AreaId: areaId ?? null,
  });
}

export async function actualizarEsEquipoProceso(codigoActivo, esEquipoProceso, user = {}) {
  return execProc('uspActivoActualizarEsEquipoProceso', {
    CodigoActivo:    codigoActivo,
    EsEquipoProceso: esEquipoProceso ? 1 : 0,
    UsuarioId:       user.userId || null,
    NombreUsuario:   user.displayName || user.username || '',
  });
}

/**
 * Procedimientos de Reportería, Analítica y Hoja de Vida
 */
export async function obtenerHistorialActivo(codigoActivo, { fechaDesde = null, fechaHasta = null, incluirHijos = 1 } = {}) {
  return execProc('uspReporteHistorialActivo', {
    CodigoActivo: codigoActivo,
    FechaDesde:   fechaDesde,
    FechaHasta:   fechaHasta,
    IncluirHijos: incluirHijos ? 1 : 0,
  });
}

export async function obtenerEstacionalidadAverias({ areaId = null, anio = null } = {}) {
  return execProc('uspReporteEstacionalidadAverias', {
    AreaId: areaId,
    Anio:   anio,
  });
}

export async function obtenerTopEquiposFallas({ areaId = null, fechaDesde = null, fechaHasta = null, top = 10 } = {}) {
  return execProc('uspReporteTopEquiposFallas', {
    AreaId:     areaId,
    FechaDesde: fechaDesde,
    FechaHasta: fechaHasta,
    Top:        top,
  });
}

export async function obtenerConsumoRepuestos({ areaId = null, codigoActivo = null, fechaDesde = null, fechaHasta = null, top = 20 } = {}) {
  return execProc('uspReporteConsumoRepuestos', {
    AreaId:       areaId,
    CodigoActivo: codigoActivo,
    FechaDesde:   fechaDesde,
    FechaHasta:   fechaHasta,
    Top:          top,
  });
}

export async function obtenerOEEGeneral({ areaId = null, codigoActivo = null, fechaDesde = null, fechaHasta = null } = {}) {
  return execProc('uspReporteOEEGeneral', {
    AreaId:       areaId,
    CodigoActivo: codigoActivo,
    FechaDesde:   fechaDesde,
    FechaHasta:   fechaHasta,
  });
}
