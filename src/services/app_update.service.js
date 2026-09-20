import { execProc } from '../config/db.js';

export async function getLatestAndroidVersion() {
  const rows = await execProc('uspActualizacionAndroidObtenerUltima');
  const row = rows[0];

  if (!row) {
    return {
      id: 1,
      version: '1.0.0',
      downloadUrl: null,
      releaseNotes: 'Versión inicial.',
      mandatory: false,
      releaseDate: new Date().toISOString().split('T')[0],
    };
  }

  return {
    id: row.IdApp,
    version: row.VersionApp,
    downloadUrl: row.UrlDescarga ?? null,
    releaseNotes: row.NotasCambio ?? null,
    mandatory: Boolean(row.Obligatorio),
    releaseDate: row.Fecha ? new Date(row.Fecha).toISOString().split('T')[0] : null,
  };
}

export async function registerAndroidVersion({ version, downloadUrl, releaseNotes, mandatory }) {
  const rows = await execProc('uspActualizacionAndroidRegistrar', {
    VersionApp: version,
    UrlDescarga: downloadUrl ?? null,
    NotasCambio: releaseNotes ?? null,
    Obligatorio: mandatory ? 1 : 0,
  });
  return rows[0];
}
