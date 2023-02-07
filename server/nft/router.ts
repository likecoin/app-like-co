import { Router } from 'express'

const { NFT_WHITELIST_ADDRESSES = [] } = require('../config/config')

const router = Router()

router.get('/whitelist', (req, res) => {
  const { wallet = '' } = req.query;
  if (!wallet) {
    res.status(400).send('MISSING_WALLET');
    return;
  }
  res.json({
    isWhitelisted: !NFT_WHITELIST_ADDRESSES.length || NFT_WHITELIST_ADDRESSES.includes(wallet),
  })
})

export default router
