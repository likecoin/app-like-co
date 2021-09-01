import BigNumber from 'bignumber.js'
import { OfflineSigner, Registry } from '@cosmjs/proto-signing'
import {
  defaultRegistryTypes,
  assertIsBroadcastTxSuccess,
  SigningStargateClient,
} from '@cosmjs/stargate'
import { MsgCreateIscnRecord } from '@likecoin/iscn-message-types/dist/iscn/tx'
import jsonStringify from 'fast-json-stable-stringify'

import {
  ISCN_REGISTRY_NAME,
  GAS_ESTIMATOR_INTERCEPT,
  GAS_ESTIMATOR_BUFFER,
  GAS_ESTIMATOR_SLOP,
  DEFAULT_GAS_PRICE_NUMBER,
  COSMOS_DENOM,
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

export async function estimateISCNTxGas(tx: ISCNSignPayload) {
  const record = await formatISCNPayload(tx);
  const msg = {
    type: Buffer.from('likecoin-chain/MsgCreateIscnRecord', 'utf-8'),
    value: {
      from: Buffer.from(tx.cosmosWallet, 'utf-8'),
      record,
    },
  };
  const value = {
    msg: [msg],
    fee: {
      amount: [{
          denom: 'nanolike',
          amount: '200000', // temp number here for estimation
      }],
      gas: '200000', // temp number here for estimation
    },
  };
  const obj = {
    type: 'cosmos-sdk/StdTx',
    value: Buffer.from(jsonStringify(value), 'utf-8'),
  };
  const interceptWithBuffer = new BigNumber(GAS_ESTIMATOR_INTERCEPT).plus(GAS_ESTIMATOR_BUFFER);
  const txBytes = Buffer.from(jsonStringify(obj), 'utf-8');
  const byteSize = new BigNumber(txBytes.length);
  const gasUsedEstimation = byteSize.multipliedBy(GAS_ESTIMATOR_SLOP).plus(interceptWithBuffer);
  return {
    fee: {
      amount: [{ amount: gasUsedEstimation.multipliedBy(DEFAULT_GAS_PRICE_NUMBER).toFixed(0,0), denom: COSMOS_DENOM }],
      gas: gasUsedEstimation.toFixed(0,0),
    },
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
  const { fee } = await estimateISCNTxGas(tx)
  const memo = 'app.like.co'
  const response = await client.signAndBroadcast(address, [message], fee, memo)
  assertIsBroadcastTxSuccess(response)
  return response
}

export default signISCNTx
