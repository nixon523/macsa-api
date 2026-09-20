import { execProc } from '../config/db.js';

export async function getLatestAndroidVersion() {
  const rows = await execProc('uspActualizacionAndroidObtenerUltima');
  const row = rows[0];

  if (!row) {
    return {
      id: 1,
      version: '1.0.0',
      mandatory: false,
      releaseDate: new Date().toISOString().split('T')[0],
    };
  }

  return {
    id: row.IdApp,
    version: row.VersionApp,
    mandatory: Boolean(row.Obligatorio),
    releaseDate: row.Fecha ? new Date(row.Fecha).toISOString().split('T')[0] : null,
  };
}

export async function registerAndroidVersion({ version, mandatory }) {
  const rows = await execProc('uspActualizacionAndroidRegistrar', {
    VersionApp: version,
    Obligatorio: mandatory ? 1 : 0,
  });
  return rows[0];
}
