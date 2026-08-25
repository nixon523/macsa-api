import { execProc } from '../config/db.js';

export async function getDashboardStats() {
  const rows = await execProc('uspDashboardObtenerEstadisticas');
  return rows[0] ?? {};
}
