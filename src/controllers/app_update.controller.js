import path from 'path';
import fs from 'fs';
import asyncHandler from '../utils/asyncHandler.js';
import * as appUpdateService from '../services/app_update.service.js';
import { ApiError } from '../utils/ApiError.js';

export const getLatestAndroidVersion = asyncHandler(async (_req, res) => {
  const versionInfo = await appUpdateService.getLatestAndroidVersion();
  res.json(versionInfo);
});

export const registerAndroidVersion = asyncHandler(async (req, res) => {
  const { version, mandatory } = req.body;
  const result = await appUpdateService.registerAndroidVersion({
    version,
    mandatory,
  });
  res.status(201).json({ message: 'Versión registrada exitosamente.', ...result });
});

export const downloadApk = asyncHandler(async (_req, res) => {
  const apkDir = path.join(process.cwd(), 'files', 'apk');
  if (!fs.existsSync(apkDir)) {
    throw ApiError.notFound('El directorio de instaladores APK no existe en el servidor.');
  }

  const files = fs.readdirSync(apkDir).filter((f) => f.toLowerCase().endsWith('.apk'));
  if (files.length === 0) {
    throw ApiError.notFound('No se encontró ningún archivo APK disponible en files/apk.');
  }

  // Buscar preferentemente app-release.apk o el primer archivo .apk disponible
  const apkFile = files.find((f) => f === 'app-release.apk') || files[0];
  const fullPath = path.join(apkDir, apkFile);

  res.download(fullPath, apkFile);
});
