import asyncHandler from '../utils/asyncHandler.js';
import * as appUpdateService from '../services/app_update.service.js';

export const getLatestAndroidVersion = asyncHandler(async (_req, res) => {
  const versionInfo = await appUpdateService.getLatestAndroidVersion();
  res.json(versionInfo);
});

export const registerAndroidVersion = asyncHandler(async (req, res) => {
  const { version, downloadUrl, releaseNotes, mandatory } = req.body;
  const result = await appUpdateService.registerAndroidVersion({
    version,
    downloadUrl,
    releaseNotes,
    mandatory,
  });
  res.status(201).json({ message: 'Versión registrada exitosamente.', ...result });
});
