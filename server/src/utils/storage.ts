import path from 'path';
import fs from 'fs';
import { env } from '../config/env';

/**
 * Abstraction over "where uploaded files live". The rest of the app only
 * calls these functions and never touches the filesystem/bucket directly,
 * so swapping to S3/Cloudinary later means rewriting this file only.
 */
export interface StorageDriver {
  /** Returns the public URL (relative or absolute) for a stored file. */
  urlFor(relativePath: string): string;
  /** Absolute filesystem/bucket destination for multer (or an upload SDK) to write to. */
  destinationFor(subfolder: string): string;
}

class LocalDiskStorage implements StorageDriver {
  private readonly root = path.resolve(process.cwd(), env.UPLOAD_DIR);

  destinationFor(subfolder: string): string {
    const dir = path.join(this.root, subfolder);
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  urlFor(relativePath: string): string {
    // Served statically by Express at /uploads — see app.ts.
    // Absolute, not relative: the frontend runs on a different origin/port
    // in development, so a relative "/uploads/..." URL would resolve against
    // the frontend's own origin and 404.
    return `${env.API_BASE_URL}/uploads/${relativePath.replace(/\\/g, '/')}`;
  }
}

// Swap this export for an S3Storage/CloudinaryStorage implementation later —
// no other file in the app needs to change.
export const storage: StorageDriver = new LocalDiskStorage();
