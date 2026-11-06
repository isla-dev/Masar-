import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { storage } from '../utils/storage';
import { env } from './env';

function makeDiskStorage(subfolder: string) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, storage.destinationFor(subfolder)),
    filename: (_req, file, cb) => {
      const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });
}

const MAX_SIZE_BYTES = env.MAX_UPLOAD_SIZE_MB * 1024 * 1024;

export const thumbnailUpload = multer({
  storage: makeDiskStorage('thumbnails'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB, thumbnails don't need more
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Thumbnail must be an image file'));
    }
    cb(null, true);
  },
});

export const avatarUpload = multer({
  storage: makeDiskStorage('avatars'),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Avatar must be an image file'));
    }
    cb(null, true);
  },
});

export const lectureContentUpload = multer({
  storage: makeDiskStorage('lectures'),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    const allowed = ['video/', 'application/pdf', 'image/'];
    if (!allowed.some((prefix) => file.mimetype.startsWith(prefix))) {
      return cb(new Error('Unsupported file type for lecture content'));
    }
    cb(null, true);
  },
});

export const submissionUpload = multer({
  storage: makeDiskStorage('submissions'),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB — assignment submissions are documents/images, not video
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/', 'application/msword', 'application/vnd.openxmlformats'];
    if (!allowed.some((prefix) => file.mimetype.startsWith(prefix))) {
      return cb(new Error('Unsupported file type for assignment submission'));
    }
    cb(null, true);
  },
});
