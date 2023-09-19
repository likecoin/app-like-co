import WebBundlr from '@bundlr-network/client'
import axios from 'axios'

import { IS_TESTNET } from '~/constant'
import {
  API_POST_ARWEAVE_V2_SIGN,
  API_GET_ARWEAVE_V2_PUBLIC_KEY,
  API_POST_ARWEAVE_V2_ESTIMATE,
} from '~/constant/api'

class Provider {
  pubKey: Buffer | null = null
  fileSize = 0
  ipfsHash = ''
  txHash = ''

  constructor({
    publicKey,
    fileSize,
    ipfsHash,
    txHash,
  }: {
    publicKey: string
    fileSize: number
    ipfsHash: string
    txHash: string
  }) {
    this.pubKey = Buffer.from(publicKey, 'hex');
    this.fileSize = fileSize
    this.ipfsHash = ipfsHash
    this.txHash = txHash
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
    this.pubKey = Buffer.from(newPubKey, 'hex');
  }

  getPublicKey() {
    return this.pubKey
  }

  getSigner = () => ({
    getAddress: () => this.pubKey?.toString(),
    _signTypedData: async (
      _domain: never,
      _types: never,
      message: { address: string; 'Transaction hash': Uint8Array },
    ) => {
      const convertedMsg = Buffer.from(message['Transaction hash']).toString(
        'hex',
      )
      const res = await axios.post(API_POST_ARWEAVE_V2_SIGN, {
        signatureData: convertedMsg,
        fileSize: this.fileSize,
        ipfsHash: this.ipfsHash,
        txHash: this.txHash,
      })
      const { signature } = await res.data
      const bSig = Buffer.from(signature, 'hex')
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

async function getProvider({
  fileSize,
  ipfsHash,
  txHash,
}: {
  fileSize: number
  ipfsHash: string
  txHash: string
}) {
  const { data } = await axios.get(API_GET_ARWEAVE_V2_PUBLIC_KEY)
  const { publicKey } = data
  const provider = new Provider({ publicKey, fileSize, ipfsHash, txHash })
  return provider
}

async function getBundler({
  fileSize,
  ipfsHash,
  txHash,
}: {
  fileSize: number
  ipfsHash: string
  txHash: string
}) {
  const p = await getProvider({ fileSize, ipfsHash, txHash })
  const bundlr = new WebBundlr(
    IS_TESTNET
      ? 'https://devnet.bundlr.network'
      : 'https://node1.bundlr.network',
    'matic',
    p,
  )
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
  }: { fileSize: number; fileType?: string, ipfsHash: string; txHash: string },
) {
  const bundler = await getBundler({ fileSize, ipfsHash, txHash })
  const response = await bundler.upload(file, {
    tags: fileType ? [{ name: 'Content-Type', value: fileType }] : [],
  })
  return response.id
}
