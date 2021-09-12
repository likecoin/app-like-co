import { Router } from 'express';
import multer from 'multer';
import { estimateARPrice, converARPriceToLIKE, getAreweaveIdFromFile } from '.';

const router = Router();

router.post('/estimate', multer().single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.sendStatus(400);
      return
    }
    const AR = await estimateARPrice(req.file);
    const LIKE = await converARPriceToLIKE(AR);
    res.json({ AR, LIKE });
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
