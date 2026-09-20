import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { ApiError } from '../utils/ApiError.js';

const uploadDir = path.join(process.cwd(), 'src', 'image');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const randomHex = crypto.randomBytes(4).toString('hex');
    const filename = `img_${Date.now()}_${randomHex}${ext}`;
    cb(null, filename);
  },
});

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Formato de imagen inválido. Solo se admiten JPEG, PNG, WebP o GIF.'));
  }
};

export const uploadAssetImageMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB máximo
  },
}).single('image');
