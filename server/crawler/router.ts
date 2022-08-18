import { Router } from "express";

import { crawlData, crawlOgImage } from ".";

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { url } = req.query
    if (!url) {
      res.status(400).send('MISSING_URL')
      return
    }
    const data = await crawlData(url as string)
    res.send(data)
  } catch (error) {
    next(error)
  }
})

router.get('/ogimage', async (req, res, next) => {
  try {
    const { url } = req.query
    if (!url) {
      res.status(400).send('MISSING_URL')
      return
    }
    const ogImageRes = await crawlOgImage(url as string)
    if (!ogImageRes) {
      res.status(404).send('OG_IMAGE_NOT_FOUND')
      return
    }
    const { data, headers } = ogImageRes
    res.setHeader('Content-Type', headers['content-type'])
    data.pipe(res)
  } catch (error) {
    next(error)
  }
})

export default router