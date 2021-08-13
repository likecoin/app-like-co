import Arweave from 'arweave/node';
import BigNumber from 'bignumber.js';
import { uploadToIPFS } from '../ipfs';

const hash = require('ipfs-only-hash');

const IPFS_KEY = 'IPFS-Add'

const IPFS_CONSTRAINT_KEY = 'standard'
const IPFS_CONSTRAINT = 'v0.1'

const jwk = require('../config/arweave-key.json')

const arweave = Arweave.init({ host: 'arweave.net', port: 443, protocol: 'https' })

function winstonToAR(winston: string) {
  return new BigNumber(winston).shiftedBy(-12).toFixed();
}

export async function getArIdFromHashes(ipfsHash: string) {
  const res = await arweave.arql(
  {
    op: "and",
    expr1: {
      op: 'equals',
      expr1: IPFS_KEY,
      expr2: ipfsHash,
    },
    expr2: {
      op: 'equals',
      expr1: IPFS_CONSTRAINT_KEY,
      expr2: IPFS_CONSTRAINT
    }
  })
  return res[0] || null;
}

export async function estimatePrice(data: { mimetype: string; buffer: Buffer; }) {
  const { buffer } = data;
  const ipfsHash = await hash.of(buffer)
  const id = await getArIdFromHashes(ipfsHash)
  if (id) return {
    AR: 0,
  }
  const transaction = await arweave.createTransaction({ data: buffer }, jwk)
  const { reward } = transaction;
  return {
    AR: winstonToAR(reward),
  }
}

export async function submitToArweave(data: { mimetype: string; buffer: Buffer; }, ipfsHash: string) {
  const anchorId = (await arweave.api.get('/tx_anchor')).data
  const { mimetype, buffer } = data;
  const transaction = await arweave.createTransaction({ data: buffer, last_tx: anchorId }, jwk)
  transaction.addTag(IPFS_KEY, ipfsHash)
  transaction.addTag(IPFS_CONSTRAINT_KEY, IPFS_CONSTRAINT)
  transaction.addTag('Content-Type', mimetype)

  await arweave.transactions.sign(transaction, jwk)
  await arweave.transactions.post(transaction)
  return transaction.id;
}

export async function getAreweaveIdFromFile(data: { mimetype: string; buffer: Buffer; }) {
  const { buffer } = data
  const ipfsHash = await hash.of(buffer)
  const id = await getArIdFromHashes(ipfsHash)
  if (id) return {
    arweaveId: id,
    ipfsHash,
  }
  const [res] = await Promise.all([
    submitToArweave(data, ipfsHash),
    uploadToIPFS(data.buffer),
  ])
  return {
    arweaveId: res,
    ipfsHash,
  }
}
