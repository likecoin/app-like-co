import { Router } from "express";

import getCralwerData from ".";

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { url } = req.query
    if (!url) {
      res.status(400).send('MISSING_ASSET_ID')
      return 
    }
    const data = await getCralwerData(url as string)
      res.send(data)
  } catch (error) {
    next(error)
  }
})

export default router