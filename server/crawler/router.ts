import { Router } from "express";

import { getCralwerData as crawlData, crawlImage } from ".";

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { url } = req.query
    if (!url) {
      res.status(400).send('MISSING_ASSET_ID')
      return
    }
    const data = await crawlData(url as string)
    res.send(data)
  } catch (error) {
    next(error)
  }
})

router.get('/image', async (req, res, next) => {
  try {
    const { url } = req.query
    if (!url) {
      res.status(400).send('MISSING_IMAGE_URL')
      return
    }
    const data = await crawlImage(url as string)
    res.send(data)
  } catch (error) {
    next(error)
  }
})

export default router