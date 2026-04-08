import multer from 'multer';
import path from 'path';
import { mkdirSync } from 'fs';
import { Request, Response } from 'express';

export const upload = (
  req: Request,
  res: Response,
  folderName: string
): Promise<{ fileUrl: string | null; body: any }> => {
  const destination = `uploads/${folderName}`;
  mkdirSync(destination, { recursive: true });
  const storage = multer.diskStorage({
    destination,
    filename: (_req: Request, file: Express.Multer.File, cb: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    },
  });

  const upload = multer({
    storage,
    limits: {
      fileSize: 20 * 1024 * 1024,
    },
  });

  return new Promise((resolve, reject) => {
    upload.single('file')(req, res, (err: any) => {
      if (err != null) return reject(err);

      const baseURL = req.protocol + '://' + req.get('host');
      resolve({
        fileUrl: req.file != null ? `${baseURL}/${req.file.path}` : null,
        body: req.body,
      });
    });
  });
};
