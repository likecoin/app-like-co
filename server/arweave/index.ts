import Arweave from 'arweave/node';

const hash = require('ipfs-only-hash');

const IPFS_KEY = 'IPFS-Add'

const IPFS_CONSTRAINT_KEY = 'standard'
const IPFS_CONSTRAINT = 'v0.1'

const jwk = require('../config/arweave-key.json')

const arweave = Arweave.init({ host: 'arweave.net', port: 443, protocol: 'https' })

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

export async function submitToArweave(data: Buffer, ipfsHash: string) {
  const anchorId = (await arweave.api.get('/tx_anchor')).data
  const transaction = await arweave.createTransaction({ data, last_tx: anchorId }, jwk)
  transaction.addTag(IPFS_KEY, ipfsHash)
  transaction.addTag(IPFS_CONSTRAINT_KEY, IPFS_CONSTRAINT)

  await arweave.transactions.sign(transaction, jwk)
  await arweave.transactions.post(transaction)
  return transaction.id;
}

export async function getAreweaveIdFromFile(data: Buffer) {
  const ipfsHash = await hash.of(data)
  const id = await getArIdFromHashes(ipfsHash)
  if (id) return {
    arweaveId: id,
    ipfsHash,
  }
  const res = await submitToArweave(data, ipfsHash);
  return {
    arweaveId: res,
    ipfsHash,
  }
}
