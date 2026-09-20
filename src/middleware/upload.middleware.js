import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { ApiError } from '../utils/ApiError.js';

const uploadDir = path.join(process.cwd(), 'src', 'image');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/pjpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    let ext = path.extname(file.originalname).toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
      if (file.mimetype === 'image/png') ext = '.png';
      else if (file.mimetype === 'image/webp') ext = '.webp';
      else if (file.mimetype === 'image/gif') ext = '.gif';
      else ext = '.jpg';
    }
    const randomHex = crypto.randomBytes(6).toString('hex');
    const filename = `img_${Date.now()}_${randomHex}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isMimeOk = ALLOWED_MIME_TYPES.has(file.mimetype);
  const isExtOk = ALLOWED_EXTENSIONS.has(ext);

  if (isMimeOk || isExtOk || file.mimetype === 'application/octet-stream') {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Formato de imagen inválido. Solo se admiten JPEG, PNG, WebP o GIF.'));
  }
};

export const uploadAssetImageMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB máximo
  },
}).single('image');
