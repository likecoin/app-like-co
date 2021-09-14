import { Router } from 'express';
import multer from 'multer';
import { estimatePrice, getAreweaveIdFromFile } from '.';

const router = Router();

router.post('/estimate', multer().single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.sendStatus(400);
      return
    }
    const price = await estimatePrice(req.file);
    res.json(price);
  } catch (error) {
    next(error);
  }
});

router.post('/', multer().single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.sendStatus(400);
      return
    }
    const { arweaveId, ipfsHash } = await getAreweaveIdFromFile(req.file);
    res.json({ arweaveId, ipfsHash });
  } catch (error) {
    next(error);
  }
});

export default router;
