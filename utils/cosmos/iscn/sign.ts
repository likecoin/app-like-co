import { OfflineSigner, Registry } from '@cosmjs/proto-signing'
import {
  defaultRegistryTypes,
  assertIsBroadcastTxSuccess,
  SigningStargateClient,
} from '@cosmjs/stargate'
import { MsgCreateIscnRecord } from '@likecoin/iscn-message-types/dist/iscn/tx'
import jsonStringify from 'fast-json-stable-stringify'

import {
  DEFAULT_GAS_PRICE_NUMBER,
  ISCN_REGISTRY_NAME,
  ISCN_GAS_FEE,
} from '~/constant'
import config from '~/constant/network'
import { ISCNSignPayload } from './iscn.type'
import { queryFeePerByte } from './query'

const registry = new Registry([
  ...defaultRegistryTypes,
  [
    '/likechain.iscn.MsgCreateIscnRecord',
    MsgCreateIscnRecord,
  ], // Replace with your own type URL and Msg class
])

export function estimateISCNTxGas() {
  return {
    amount: [{
      amount: (DEFAULT_GAS_PRICE_NUMBER * ISCN_GAS_FEE).toFixed(),
      denom: 'nanolike',
    }],
    gas: ISCN_GAS_FEE.toFixed(),
  }
}

export async function estimateISCNTxFee(
  tx: ISCNSignPayload,
  { version = 1 } = {},
) {
  const record = formatISCNPayload(tx)
  const feePerByte = await queryFeePerByte()
  const feePerByteAmount = feePerByte ? parseInt(feePerByte.amount, 10) : 1
  const {
    recordNotes,
    contentFingerprints,
    stakeholders,
    contentMetadata,
  } = record
  const now = new Date()
  const obj = {
    '@context': {
      '@vocab': 'http://iscn.io/',
      recordParentIPLD: {
        '@container': '@index',
      },
      stakeholders: {
        '@context': {
          '@vocab': 'http://schema.org/',
          entity: 'http://iscn.io/entity',
          rewardProportion: 'http://iscn.io/rewardProportion',
          contributionType: 'http://iscn.io/contributionType',
          footprint: 'http://iscn.io/footprint',
        },
      },
      contentMetadata: {
        '@context': null,
      },
    },
    '@type': 'Record',
    '@id': `iscn://${ISCN_REGISTRY_NAME}/btC7CJvMm4WLj9Tau9LAPTfGK7sfymTJW7ORcFdruCU/1`,
    recordTimestamp: now.toISOString(),
    recordVersion: version,
    recordNotes,
    contentFingerprints,
    recordParentIPLD: {},
  }
  if (version > 1) {
    obj.recordParentIPLD = {
      '/': 'bahuaierav3bfvm4ytx7gvn4yqeu4piiocuvtvdpyyb5f6moxniwemae4tjyq',
    }
  }
  const byteSize =
    Buffer.from(jsonStringify(obj), 'utf-8').length +
    stakeholders.reduce((acc, s) => acc + s.length, 0) +
    contentMetadata.length
  const feeAmount = byteSize * feePerByteAmount
  return feeAmount
}

function formatISCNPayload(payload: ISCNSignPayload, version = 1) {
  const {
    name,
    description,
    tagsString,
    url,
    license,
    ipfsHash,
    fileSHA256,
    type,
    authorNames,
    authorUrls,
    authorWallets,
  } = payload

  const contentFingerprints = []
  if (fileSHA256) contentFingerprints.push(`hash://sha256/${fileSHA256}`)
  if (ipfsHash) contentFingerprints.push(`ipfs://${ipfsHash}`)
  const stakeholders = []
  if (authorNames.length) {
    for (let i = 0; i < authorNames.length; i += 1) {
      const authorName = authorNames[i]
      const authorUrl = authorUrls[i]
      const authorId = authorWallets[i]
      const isNonEmpty = authorUrl || authorName || authorId
      if (isNonEmpty) {
        stakeholders.push(
          Buffer.from(
            JSON.stringify({
              entity: {
                '@id': authorId ? `did:cosmos:${authorId.slice(6)}` : authorUrl || authorName,
                name: authorName,
                url: authorUrl,
              },
              rewardProportion: 1,
              contributionType: 'http://schema.org/author',
            }),
            'utf8',
          ),
        )
      }
    }
  }
  const contentMetadata = {
    '@context': 'http://schema.org/',
    '@type': type,
    name,
    description,
    version,
    url,
    keywords: tagsString,
    usageInfo: license,
  }
  return {
    recordNotes: '',
    contentFingerprints,
    stakeholders,
    contentMetadata: Buffer.from(JSON.stringify(contentMetadata), 'utf8'),
  }
}

export async function signISCNTx(
  tx: ISCNSignPayload,
  signer: OfflineSigner,
  address: string,
) {
  const record = formatISCNPayload(tx)
  const client = await SigningStargateClient.connectWithSigner(
    config.rpcURL,
    signer,
    { registry },
  )

  const message = {
    typeUrl: '/likechain.iscn.MsgCreateIscnRecord',
    value: {
      from: address,
      record,
    },
  }
  const fee = estimateISCNTxGas()
  const memo = 'app.like.co'
  const response = await client.signAndBroadcast(address, [message], fee, memo)
  assertIsBroadcastTxSuccess(response)
  return response
}

export default signISCNTx
