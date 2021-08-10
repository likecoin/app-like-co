import { Router } from 'express';
import multer from 'multer';
import { getAreweaveIdFromFile } from '.';

const router = Router();

router.post('/', multer().single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.sendStatus(400);
      return
    }
    const { arweaveId, ipfsHash } = await getAreweaveIdFromFile(req.file.buffer);
    res.json({ arweaveId, ipfsHash });
  } catch (error) {
    next(error);
  }
});

export default router;
