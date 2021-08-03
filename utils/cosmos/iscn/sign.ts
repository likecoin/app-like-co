import { OfflineSigner, Registry } from '@cosmjs/proto-signing';
import {
  defaultRegistryTypes,
  assertIsBroadcastTxSuccess,
  SigningStargateClient,
} from '@cosmjs/stargate';
import { MsgCreateIscnRecord } from '@likecoin/iscn-message-types/dist/iscn/tx';
import  jsonStringify from 'fast-json-stable-stringify';

import { DEFAULT_GAS_PRICE_NUMBER, ISCN_REGISTRY_NAME, ISCN_GAS_FEE } from '~/constant';
import config from '~/constant/network';
import { ISCNSignPayload } from './iscn.type'
import { queryFeePerByte } from './query';

const registry = new Registry([
  ...defaultRegistryTypes,
  ['/likechain.iscn.MsgCreateIscnRecord', MsgCreateIscnRecord], // Replace with your own type URL and Msg class
]);

export async function estimateISCNTxGas(tx: ISCNSignPayload, {
  version = 1,
} = {}) {
  const record = formatISCNPayload(tx);
  const feePerByte = await queryFeePerByte();
  const feePerByteAmount = feePerByte ? parseInt(feePerByte.amount, 10) : 1;
  const {
    recordNotes,
    contentFingerprints,
    stakeholders,
    contentMetadata,
  } = record;
  const now = new Date();
  const obj = {
    '@context': {
      '@vocab': 'http://iscn.io/',
      recordParentIPLD: {
        '@container': '@index'
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
        '@context': null
      }
    },
    '@type': 'Record',
    '@id': `iscn://${ISCN_REGISTRY_NAME}/btC7CJvMm4WLj9Tau9LAPTfGK7sfymTJW7ORcFdruCU/1`,
    recordTimestamp: now.toISOString(),
    recordVersion: version,
    recordNotes,
    contentFingerprints,
    stakeholders,
    contentMetadata,
    recordParentIPLD: {},
  };
  if (version > 1) {
    obj.recordParentIPLD = {
      '/': 'bahuaierav3bfvm4ytx7gvn4yqeu4piiocuvtvdpyyb5f6moxniwemae4tjyq'
    };
  }
  let gas = Buffer.from(jsonStringify(obj), 'utf-8').length * feePerByteAmount;
  gas += ISCN_GAS_FEE;

  return {
    amount: [{ amount: (DEFAULT_GAS_PRICE_NUMBER * gas).toFixed(), denom: 'nanolike' }],
    gas: gas.toFixed(),
  };
}

function formatISCNPayload(payload: ISCNSignPayload, version = 1) {
  const {
    title,
    description,
    tagsString,
    url,
    license,
    ipfsHash,
    fileSHA256,
    type,
    authorNames,
    authorUrls,
  } = payload;

  const contentFingerprints = [];
  if (fileSHA256) contentFingerprints.push(`hash://sha256/${fileSHA256}`);
  if (ipfsHash) contentFingerprints.push(`ipfs://${ipfsHash}`);
  const stakeholders = [];
  if (authorNames.length) {
    for (let i = 0; i < authorNames.length; i += 1) {
      const authorName = authorNames[i];
      const authorUrl = authorUrls[i];
      const isNonEmpty = authorUrl || authorName;
      if (isNonEmpty) {
        stakeholders.push(Buffer.from(JSON.stringify({
          entity: {
            id: authorUrl || undefined,
            name: authorName,
          },
          rewardProportion: 1,
          contributionType: 'http://schema.org/author',
        }), 'utf8'))
      }
    }
  }
  const contentMetadata = {
    '@context': 'http://schema.org/',
    '@type': type,
    title,
    description,
    version,
    url,
    keywords: tagsString,
    usageInfo: license,
  };
  return {
    recordNotes: '',
    contentFingerprints,
    stakeholders,
    contentMetadata: Buffer.from(JSON.stringify(contentMetadata), 'utf8'),
  };
}

export async function signISCNTx(tx: ISCNSignPayload, signer: OfflineSigner, address: string) {
  const record = formatISCNPayload(tx);
  const client = await SigningStargateClient.connectWithSigner(
    config.rpcURL,
    signer,
    { registry }
  );

  const message = {
    typeUrl: '/likechain.iscn.MsgCreateIscnRecord',
    value: {
      from: address,
      record,
    },
  };
  const memo = 'app.like.co';
  const fee = {
    amount: [{ amount: (DEFAULT_GAS_PRICE_NUMBER * ISCN_GAS_FEE).toFixed(), denom: 'nanolike' }],
    gas: ISCN_GAS_FEE.toFixed(),
  };
  const response = await client.signAndBroadcast(address, [message], fee, memo);
  assertIsBroadcastTxSuccess(response);
  return response;
}

export default signISCNTx;
