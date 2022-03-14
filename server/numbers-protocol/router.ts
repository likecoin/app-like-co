import { Router } from "express";

import { getAssetFromId } from ".";

const router = Router();

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
