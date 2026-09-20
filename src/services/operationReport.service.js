import { execProc } from '../config/db.js';

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
