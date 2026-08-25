import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

const NOT_FOUND_ERRORS = new Set([
  50003, // El usuario no existe.
  50010, // No se encontró cuenta para el reset de contraseña.
  50102, 50103, // El área no existe.
  50104, // El activo padre ya no existe.
  50108, // El activo ya no existe.
  50114, // El área destino no existe.
  50119, // El activo no existe.
  50303, // La orden de trabajo ya no existe.
  50402, // El reporte de avería ya no existe.
  50501, // El plan preventivo ya no existe.
]);

const CONFLICT_ERRORS = new Set([
  50002, // Username duplicado.
  50011, // La solicitud de reset ya fue procesada.
  50100, 50101, // Área duplicada (nombre o centro de coste).
  50105, // Padre no activo para crear hijo.
  50106, // Padre con solicitud de baja pendiente.
  50107, // Serial duplicado globalmente.
  50109, // Editar activo dado de baja.
  50110, // Editar activo con baja pendiente.
  50111, // Transferir activo no activo.
  50112, // Transferir activo con baja pendiente.
  50113, // Área destino igual al origen.
  50115, // Reactivar activo no transferido.
  50116, // Reactivar activo con baja pendiente.
  50120, // Cambiar estado con baja pendiente.
  50121, // Cambiar estado de transferido/eliminado.
  50201, // Baja de activo ya eliminado.
  50202, // Ya tiene solicitud de baja pendiente.
  50203, // Ancestro con baja pendiente.
  50204, // Solicitud resuelta por otro usuario.
  50205, // Solicitud ya no pendiente.
  50207, // Solicitud ya no pendiente de resolución.
  50301, // Activo transferido: no se pueden crear OTs.
  50302, // Activo eliminado: no se pueden crear OTs.
  50304, // OT cerrada: no se puede cambiar estado.
  50305, // Revertir OT de En Progreso a Pendiente.
  50403, // Reporte ya atendido por otra OT.
  50404, // Reporte ya resuelto.
  50406, // Solo se rechaza un reporte no atendido.
  50504, // Trigger: avería inmutable.
  50505, // Trigger: kardex_logs append-only.
]);

function statusForSpError(errorNumber) {
  if (NOT_FOUND_ERRORS.has(errorNumber)) return 404;
  if (CONFLICT_ERRORS.has(errorNumber)) return 409;
  return 400;
}

export function errorHandler(error, _req, res, _next) {
  const spErrorNumber = error?.number;

  if (typeof spErrorNumber === 'number' && spErrorNumber >= 50000 && spErrorNumber < 51000) {
    return res.status(statusForSpError(spErrorNumber)).json({
      message: error.message,
      spErrorNumber,
    });
  }

  if (error instanceof ApiError) {
    const body = { message: error.message };
    if (error.details) body.details = error.details;
    return res.status(error.statusCode).json(body);
  }

  if (error?.code === 'ELOGIN' || error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT') {
    return res.status(503).json({ message: 'Base de datos no disponible.' });
  }

  console.error('[error]', error);
  const exposeDetails = env.nodeEnv !== 'production';
  return res.status(500).json({
    message: 'Error interno del servidor.',
    ...(exposeDetails ? { detalle: String(error?.message ?? error) } : {}),
  });
}
