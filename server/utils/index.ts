import { NextFunction, Request, Response } from "express";

import { ArweaveFile } from '../arweave/types';

export function checkFileValid(req: Request, res: Response, next: NextFunction) {
  if (!(req.files && req.files.length)) {
    res.status(400).send('MISSING_FILE');
    return;
  }
  const files = req.files as Express.Multer.File[];
  if (files.length > 1 && !files.find(f => f.fieldname === 'index.html')) {
    res.status(400).send('MISSING_INDEX_FILE');
    return;
  }
  next();
}

export function convertMulterFiles(files: Express.Multer.File[]): ArweaveFile[] {
  return files.map(f => {
    const {
      mimetype,
      buffer,
      originalname: filename,
    } = f;
    return {
      key: f.fieldname,
      mimetype,
      buffer,
      filename,
    };
  })
}
