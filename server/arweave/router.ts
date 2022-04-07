import BigNumber from 'bignumber.js';
import { Router } from 'express';
import multer from 'multer';

import { UPLOAD_FILESIZE_MAX } from "../constant"
import { getIPFSHash, uploadFilesToIPFS } from '../ipfs';
import { queryLIKETransactionInfo } from '../like';
import { registerNUMAssets } from '../numbers-protocol';
import { checkFileValid, convertMulterFiles } from '../utils';

import { estimateARPrices, convertARPricesToLIKE, uploadFilesToArweave } from '.';

const { LIKE_TARGET_ADDRESS } = require('../config/config');

const router = Router();

router.post(
  '/estimate',
  multer({ limits: { fileSize: UPLOAD_FILESIZE_MAX } }).any(),
  checkFileValid,
  async (req, res, next) => {
  try {
    const files = req.files as Express.Multer.File[];
    const arFiles = convertMulterFiles(files);
    const [
      ipfsHash,
      prices,
    ] = await Promise.all([
      getIPFSHash(arFiles),
      estimateARPrices(arFiles),
    ]);
    const pricesWithLIKE = await convertARPricesToLIKE(prices);
    res.json({
      ...pricesWithLIKE,
      ipfsHash,
      memo: JSON.stringify({ ipfs: ipfsHash}),
      address: LIKE_TARGET_ADDRESS,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/upload',
  multer({ limits: { fileSize: UPLOAD_FILESIZE_MAX } }).any(),
  checkFileValid,
  async (req, res, next) => {
  try {
    const shouldRegisterNUMAssets = req.body.num && req.body.num !== '0';
    const files = req.files as Express.Multer.File[];
    const arFiles = convertMulterFiles(files);
    const [
      ipfsHash,
      prices,
    ] = await Promise.all([
      getIPFSHash(arFiles),
      estimateARPrices(arFiles),
    ]);
    const { arweaveId: existingArweaveId } = prices;

    // shortcut for existing file without checking tx
    if (existingArweaveId) {
      let numAssetsIds = [];
      if (shouldRegisterNUMAssets) {
        numAssetsIds = await registerNUMAssets(arFiles.map(file => ({
          file: file.buffer,
          filename: file.filename,
        })))
      }
      res.json({
        arweaveId: existingArweaveId,
        ipfsHash,
        numAssetsIds,
      })
      return;
    }

    const { txHash } = req.query;
    if (!txHash) {
      res.status(400).send('MISSING_TX_HASH');
      return
    }
    const tx = await queryLIKETransactionInfo(txHash as string, LIKE_TARGET_ADDRESS);
    if (!tx || !tx?.amount) {
      res.status(400).send('TX_NOT_FOUND');
      return;
    }
    const { memo, amount } = tx;
    let memoIPFS = '';
    try {
      ({ ipfs: memoIPFS } = JSON.parse(memo));
    } catch (err) {
      // ignore non-JSON memo
    }
    if (!memoIPFS || memoIPFS !== ipfsHash) {
      res.status(400).send('TX_MEMO_NOT_MATCH');
      return;
    }
    const { LIKE } = await convertARPricesToLIKE(prices, { margin: 0.03 });
    const txAmount = new BigNumber(amount.amount).shiftedBy(-9);
    if (txAmount.lt(LIKE)) {
      res.status(400).send('TX_AMOUNT_NOT_ENOUGH');
      return;
    }
    const promises: Promise<any>[] = [
      uploadFilesToArweave(arFiles),
      uploadFilesToIPFS(arFiles),
    ];
    if (shouldRegisterNUMAssets) {
      promises.push(registerNUMAssets(arFiles.map(file => ({
        file: file.buffer,
        filename: file.filename,
      }))))
    }
    const [
      {
        arweaveId,
        list,
      },
      ,
      numAssetIds,
    ] = await Promise.all(promises)
    res.json({ arweaveId, ipfsHash, list, numAssetIds });
  } catch (error) {
    next(error);
  }
});

export default router;
