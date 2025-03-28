import axios from 'axios'

import { ARWEAVE_ENDPOINT, IS_TESTNET } from '~/constant'
import {
  API_POST_ARWEAVE_V2_SIGN,
  API_GET_ARWEAVE_V2_PUBLIC_KEY,
  API_POST_ARWEAVE_V2_ESTIMATE,
  API_POST_ARWEAVE_V2_REGISTER,
} from '~/constant/api'

class Provider {
  pubKey: Buffer | null = null
  fileSize = 0
  ipfsHash = ''
  txHash = ''
  token = ''

  constructor({
    publicKey,
    fileSize,
    ipfsHash,
    txHash,
    token,
  }: {
    publicKey: string
    fileSize: number
    ipfsHash: string
    txHash: string
    token: string
  }) {
    this.pubKey = Buffer.from(publicKey, 'base64');
    this.fileSize = fileSize
    this.ipfsHash = ipfsHash
    this.txHash = txHash
    this.token = token
  }

  setLikeCoinTxInfo({
    fileSize,
    ipfsHash,
    txHash,
  }: {
    fileSize: number
    ipfsHash: string
    txHash: string
  }) {
    this.fileSize = fileSize
    this.ipfsHash = ipfsHash
    this.txHash = txHash
  }

  setPublicKey(newPubKey: string) {
    this.pubKey = Buffer.from(newPubKey, 'base64');
  }

  getPublicKey() {
    return this.pubKey
  }

  setAuthToken(token: string) {
    this.token = token
  }

  getSigner = () => ({
    getAddress: () => this.pubKey?.toString(),
    _signTypedData: async (
      _domain: never,
      _types: never,
      message: { address: string; 'Transaction hash': Uint8Array },
    ) => {
      const convertedMsg = Buffer.from(message['Transaction hash']).toString(
        'base64',
      )
      const res = await axios.post(API_POST_ARWEAVE_V2_SIGN, {
        signatureData: convertedMsg,
        fileSize: this.fileSize,
        ipfsHash: this.ipfsHash,
        txHash: this.txHash,
      }, {
        headers: { Authorization: this.token ? `Bearer ${this.token}` : '' },
      })
      const { signature } = await res.data
      const bSig = Buffer.from(signature, 'base64')
      // pad & convert so it's in the format the signer expects to have to convert from.
      const pad = Buffer.concat([
        Buffer.from([0]),
        Buffer.from(bSig),
      ]).toString(
        'hex',
      )
      return pad
    },
  })

  // eslint-disable-next-line no-underscore-dangle, class-methods-use-this
  _ready() {}
}

let WebIrys: any = null;

async function getProvider({
  fileSize,
  ipfsHash,
  txHash,
  token,
}: {
  fileSize: number
  ipfsHash: string
  txHash: string
  token: string
}) {
  const { data } = await axios.get(API_GET_ARWEAVE_V2_PUBLIC_KEY)
  const { publicKey } = data
  const provider = new Provider({ publicKey, fileSize, ipfsHash, txHash, token })
  return provider
}

async function getBundler({
  fileSize,
  ipfsHash,
  txHash,
  token,
}: {
  fileSize: number
  ipfsHash: string
  txHash: string
  token: string
}) {
  if (!WebIrys) {
    ({ WebIrys } = (await import('@irys/sdk')));
  }
  const p = await getProvider({ fileSize, ipfsHash, txHash, token })
  const bundlr = new WebIrys({
    network: IS_TESTNET ? 'devnet' : 'mainnet',
    token: 'matic',
    wallet: {
      provider: p,
    },
  })
  await bundlr.ready()
  return bundlr
}

export async function estimateBundlrFilePrice({
  fileSize,
  ipfsHash,
}: {
  fileSize: number
  ipfsHash: string
}) {
  const { data } = await axios.post(API_POST_ARWEAVE_V2_ESTIMATE, {
    fileSize,
    ipfsHash,
  })
  return data
}

export async function uploadSingleFileToBundlr(
  file: Buffer,
  {
    fileType,
    fileSize,
    ipfsHash,
    txHash,
    token,
    key,
  }: { fileSize: number; fileType?: string, ipfsHash: string; txHash: string, token: string, key?: string },
) {
  const bundler = await getBundler({ fileSize, ipfsHash, txHash, token })
  const tags = [
    { name: 'App-Name', value: 'app.like.co' },
    { name: 'App-Version', value: '2.0' },
    { name: 'User-Agent', value: 'app.like.co' },
    { name: 'IPFS-CID', value: ipfsHash },
    { name: 'standard', value: 'v0.1'},
  ];
  if (fileType) tags.push({ name: 'Content-Type', value: fileType })
  if (key) tags.push({ name: 'Content-Encoding', value: 'aes256gcm' })
  const response = await bundler.upload(file, { tags })
  const arweaveId = response.id;
  let arweaveLink = `${ARWEAVE_ENDPOINT}/${arweaveId}`;
  if (arweaveId) {
    const { data } = await axios.post(API_POST_ARWEAVE_V2_REGISTER, {
      fileSize,
      ipfsHash,
      txHash,
      arweaveId,
      key,
    },{
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    });
    if (data.link) {
      arweaveLink = data.link;
    }
  }
  return {
    arweaveId,
    arweaveLink,
    arweaveKey: key,
  };
}
