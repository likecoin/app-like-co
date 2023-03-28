import Arweave from 'arweave/node';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import stringify from 'fast-json-stable-stringify';
import {
  getFileIPFSHash,
  getFolderIPFSHash,
  uploadFileToIPFS,
} from '../ipfs';
import { COINGECKO_PRICE_API, IS_TESTNET } from '../constant';
import { ArweaveFile, Manifest, ArweavePrice, ArweavePriceWithLIKE } from './types';

const IPFS_KEY = 'IPFS-Add'

const IPFS_CONSTRAINT_KEY = 'standard'
const IPFS_CONSTRAINT = 'v0.1'

const jwk = require('../config/arweave-key.json')

const arweaveGraphQL = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
  timeout: 5000,
});

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
  timeout: 60000,
})

export async function getArweaveIdFromHashes(ipfsHash: string) {
  try {
    const res = await arweaveGraphQL.api.post('/graphql', {
      query: `
    {
      transactions(
        tags: [
          { name: "${IPFS_KEY}", values: ["${ipfsHash}"] },
          { name: "${IPFS_CONSTRAINT_KEY}", values: ["${IPFS_CONSTRAINT}"] }
        ]
      ) {
        edges {
          node {
            id
          }
        }
      }
    }`,
    });
    const ids = res?.data?.data?.transactions?.edges;
    if (ids && ids[0]) return ids[0].node.id;
    return undefined;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return undefined;
  }
}

async function generateManifest(files: ArweaveFile[], { stub = false } = {}) {
  const isIndexExists = !!files.find(f => f.key === 'index.html');
  let list = files;
  if (stub) {
    // stub some string as arweave id for estimation
    list = await Promise.all(list.map(async (p) => {
      let { arweaveId } = p;
      if (!arweaveId) {
        if (p.buffer) {
          arweaveId = await getFileIPFSHash(p);
        } else {
          arweaveId = 'fzassxeg7cCmOp6-sVkvDV3l5GVfDqL_pF_VOQHHBGo';
        }
      }
      return {
        ...p,
        arweaveId,
      };
    }));
  }
  const filePaths = list
    .filter(p => p.key && p.arweaveId)
    .reduce((acc, p) => {
      acc[p.key] = {
        id: p.arweaveId as string,
      };
      return acc;
    }, {} as { [key: string]: { id: string } });
  const manifest: Manifest = {
    manifest: 'arweave/paths',
    version: '0.1.0',
    index: isIndexExists ? {
      path: 'index.html',
    } : undefined,
    paths: filePaths,
  };
  return manifest;
}

async function generateManifestFile(files: ArweaveFile[], { stub = false } = {}): Promise<ArweaveFile> {
  const manifest = await generateManifest(files, { stub });
  return {
    key: 'manifest',
    mimetype: 'application/x.arweave-manifest+json',
    buffer: Buffer.from(stringify(manifest), 'utf-8'),
  };
}

async function uploadManifestFile(filesWithId: ArweaveFile[]) {
  const manifest = await generateManifestFile(filesWithId);
  const manifestIPFSHash = await getFileIPFSHash(manifest);
  let arweaveId = await getArweaveIdFromHashes(manifestIPFSHash);
  if (!arweaveId) {
    [arweaveId] = await Promise.all([
      submitToArweave(manifest, manifestIPFSHash),
      uploadFileToIPFS(manifest),
    ])
  }
  manifest.arweaveId = arweaveId;
  return { manifest, ipfsHash: manifestIPFSHash, arweaveId };
}

export async function estimateARPrice(data: ArweaveFile) {
  const { buffer, key } = data;
  const ipfsHash = await getFileIPFSHash(data);
  const id = await getArweaveIdFromHashes(ipfsHash);
  if (id) return {
    key,
    arweaveId: id,
    AR: '0',
  }
  const transaction = await arweave.createTransaction({ data: buffer }, jwk)
  const { reward } = transaction;
  return {
    key,
    AR: arweave.ar.winstonToAr(reward),
  };
}

export async function estimateARPrices(files: ArweaveFile[]): Promise<ArweavePrice> {
  if (files.length === 1) {
    return estimateARPrice(files[0]);
  }
  const prices = await Promise.all(files.map(f => estimateARPrice(f)));
  const filesWithPrice = files.map((f, i) => ({ ...f, arweaveId: prices[i].arweaveId }));
  const manifest = await generateManifestFile(filesWithPrice, { stub: true });
  const manifestPrice = await estimateARPrice(manifest);

  prices.unshift(manifestPrice);
  const totalAR = prices.reduce((acc, cur) => acc.plus(cur.AR), new BigNumber(0));
  return {
    arweaveId: manifestPrice.arweaveId,
    AR: totalAR.toFixed(),
    list: prices,
  }
}

async function getPriceRatioBigNumber () {
  const { data } = await axios.get(COINGECKO_PRICE_API);
  const { likecoin, arweave: arweavePrice } = data;
  const priceRatio = new BigNumber(arweavePrice.usd).dividedBy(likecoin.usd).toFixed();
  const priceRatioBigNumber = BigNumber.max(priceRatio, 1);
  return priceRatioBigNumber;
}

export function convertARPriceToLIKE(ar: ArweavePrice, {
  priceRatioBigNumber, margin = 0.05, decimal = 0,
}:any ): any {
  const res = new BigNumber(ar.AR)
    .multipliedBy(priceRatioBigNumber)
    .multipliedBy(1 + margin)
    .toFixed(decimal, BigNumber.ROUND_UP);
  // list should be empty, but make ts happy
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { list, ...payload } = ar;
  return {
    ...payload,
    LIKE: res,
  };
}

export async function convertARPricesToLIKE(ar: ArweavePrice,
  { margin = 0.05, decimal = 0 } = {},
): Promise<ArweavePriceWithLIKE> {
  const priceRatioBigNumber = await getPriceRatioBigNumber()
  if (!(ar.list && ar.list.length)) {
    return convertARPriceToLIKE(ar, { priceRatioBigNumber, margin, decimal });
  }
  const newList = (ar.list.map(a => convertARPriceToLIKE(a, { priceRatioBigNumber, margin, decimal })));
  const totalLIKE = newList.reduce((acc, cur) => acc.plus(cur.LIKE), new BigNumber(0));
  return {
    ...ar,
    LIKE: totalLIKE.toFixed(),
    list: newList,
  }
}

export async function submitToArweave(data: ArweaveFile, ipfsHash: string) {
  const anchorId = (await arweave.api.get('/tx_anchor')).data
  const { mimetype, buffer } = data;
  const transaction = await arweave.createTransaction({ data: buffer, last_tx: anchorId }, jwk)
  transaction.addTag('User-Agent', 'app.like.co');
  transaction.addTag(IPFS_KEY, ipfsHash)
  transaction.addTag(IPFS_CONSTRAINT_KEY, IPFS_CONSTRAINT)
  transaction.addTag('Content-Type', mimetype)
  const { reward } = transaction;

  if (!IS_TESTNET) {
    const balance = await arweave.wallets.getBalance(await arweave.wallets.jwkToAddress(jwk));
    if (arweave.ar.isLessThan(balance, reward)) throw new Error('INSUFFICIENT_AR_IN_PROXY');
  }

  await arweave.transactions.sign(transaction, jwk)
  await arweave.transactions.post(transaction)
  return transaction.id;
}

export async function uploadFileToArweave(data: ArweaveFile) {
  const ipfsHash = await getFileIPFSHash(data)
  const id = await getArweaveIdFromHashes(ipfsHash)
  if (id) return {
    arweaveId: id,
    ipfsHash,
    list: undefined,
  }
  const [res] = await Promise.all([
    submitToArweave(data, ipfsHash),
    uploadFileToIPFS(data),
  ])
  return {
    arweaveId: res,
    ipfsHash,
    list: undefined,
  }
}

export async function uploadFilesToArweave(files: ArweaveFile[]) {
  if (files.length === 1) {
    return uploadFileToArweave(files[0]);
  }

  const [
    folderIpfsHash,
    ipfsHashes,
  ] = await Promise.all([
    getFolderIPFSHash(files),
    Promise.all(files.map(f => getFileIPFSHash(f))),
  ]);
  const arweaveIds = await Promise.all(ipfsHashes.map(h => getArweaveIdFromHashes(h)));
  if (!arweaveIds.some(id => !id)) {
    const filesWithId = files.map((f, i) => ({ ...f, arweaveId: arweaveIds[i] }))
    const { manifest, ipfsHash: manifestIPFSHash } = await uploadManifestFile(filesWithId);
    const list = filesWithId.map((f, index) => ({
      key: f.key,
      arweaveId: arweaveIds[index],
      ipfsHash: ipfsHashes[index],
    }));
    list.unshift({
      key: manifest.key,
      arweaveId: manifest.arweaveId,
      ipfsHash: manifestIPFSHash,
    });
    return {
      arweaveId: manifest.arweaveId,
      ipfsHash: folderIpfsHash,
      list,
    }
  }

  const list = [];
  const filesWithId = [];
  for (let i = 0; i < files.length; i += 1) {
    /* eslint-disable no-await-in-loop */
    const f = files[i];
    const ipfsHash = await getFileIPFSHash(f);
    const [arweaveId] = await Promise.all([
      submitToArweave(f, ipfsHash),
      uploadFileToIPFS(f),
    ])
    list.push({
      key: f.key,
      arweaveId,
      ipfsHash,
    })
    filesWithId.push({ ...f, arweaveId });
    /* eslint-enable no-await-in-loop */
  }
  const { manifest, ipfsHash } = await uploadManifestFile(filesWithId);
  list.unshift({
    key: manifest.key,
    arweaveId: manifest.arweaveId,
    ipfsHash,
  })
  return {
    arweaveId: manifest.arweaveId,
    ipfsHash: folderIpfsHash,
    list,
  }
}

