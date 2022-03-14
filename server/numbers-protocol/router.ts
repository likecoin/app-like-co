import { Router } from "express";
import multer from "multer";

import { UPLOAD_FILESIZE_MAX } from "../constant";
import { checkFileValid, convertMulterFiles } from "../utils";

import { getAssetFromId, registerNUMAssets } from ".";

const router = Router();

router.post(
  '/assets',
  multer({ limits: { fileSize: UPLOAD_FILESIZE_MAX } }).any(),
  checkFileValid,
  async (req, res, next) => {
    try {
      const files = convertMulterFiles(req.files as Express.Multer.File[]);
      const numAssetIds = await registerNUMAssets(files.map(file => ({
        file: file.buffer,
        filename: file.filename,
      })))
      res.json({ numAssetIds })
    } catch (error) {
      next(error)
    }
  },
);

router.get('/assets/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!id) {
      res.status(400).send('MISSING_ASSET_ID')
      return;
    }
    const data = await getAssetFromId(id);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
