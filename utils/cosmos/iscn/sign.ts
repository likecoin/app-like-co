// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing';
import { ISCNSignPayload, ISCNSigningClient } from '@likecoin/iscn-js';
import network from '@/constant/network';
import { DeliverTxResponse } from '@cosmjs/stargate';
import { BigNumber } from 'bignumber.js';
import { ISCNRegisterPayload } from './iscn.type';
import { WALLET_TYPE_REPLACER, ISCN_GAS_FEE, DEFAULT_GAS_PRICE, ISCN_GAS_MULTIPLIER } from '~/constant'
import { getPublisherISCNPayload } from '.';
import { ISCN_PUBLISHERS } from '~/constant/iscn';

let client: ISCNSigningClient | null = null;
let iscnLib: any = null;

export async function getISCNLib() {
  if (!iscnLib) {
    iscnLib = await import(/* webpackChunkName: "iscn_js" */ '@likecoin/iscn-js');
  }
  return iscnLib;
}

export async function getSigningClient() {
  if (!client) {
    const iscn = await getISCNLib();
    const c = new iscn.ISCNSigningClient() as ISCNSigningClient;
    await c.connect(network.rpcURL);
    client = c;
  }
  return client;
}

export function formatISCNTxPayload(payload: ISCNRegisterPayload): ISCNSignPayload{
  const {
    tagsString = '',
    license,
    ipfsHash,
    arweaveId,
    fileSHA256,
    author,
    authorNames,
    authorUrls,
    authorWallets,
    likerIds,
    likerIdsAddresses,
    authorDescriptions,
    numbersProtocolAssetId,
    contentFingerprints: contentFingerprintsInput = [],
    stakeholders: stakeholdersInput = [],
    recordNotes,
    publisher: publisherInput,
    ...data
  } = payload;

  const contentFingerprints = [...contentFingerprintsInput]
  const stakeholders = [...stakeholdersInput]
  let publisher = publisherInput
  if (!stakeholders.length && !publisher) {
    publisher = ISCN_PUBLISHERS.likerland
  }
  let rewardProportion = 1
  if (publisher) {
    const {
      stakeholders: publisherStakeholders = [],
      contentFingerprints: publisherContentFingerprints = [],
    } = getPublisherISCNPayload(publisher)
    stakeholders.push(...publisherStakeholders);
    contentFingerprints.push(...publisherContentFingerprints);
    if (publisherStakeholders && publisherStakeholders.length) {
      rewardProportion -= publisherStakeholders.reduce((acc, cur) => {
        if (cur.rewardProportion) return acc + cur.rewardProportion
        return acc
      }, 0)
      rewardProportion = Math.max(0, rewardProportion);
    }
  }

  const pushContentFingerprint = (value: any, prefix:string) => {
    if (Array.isArray(value)) {
      value.forEach(item => contentFingerprints.push(`${prefix}${item}`));
    } else if (typeof value === 'string' && value.length) {
      contentFingerprints.push(`${prefix}${value}`);
    }
  };
  pushContentFingerprint(fileSHA256, 'hash://sha256/');
  pushContentFingerprint(ipfsHash, 'ipfs://');
  pushContentFingerprint(arweaveId, 'ar://');
  pushContentFingerprint(numbersProtocolAssetId, 'num://');

  if (authorNames.length) {
    for (let i = 0; i < authorNames.length; i += 1) {
      const authorName: string = authorNames[i]
      const description = authorDescriptions[i]
      const url: string = (likerIds[i] && likerIdsAddresses[i])
        ? `https://like.co/${likerIds[i]}`
        : authorUrls[i][0]

      const identifiers = authorWallets[i].map((a: any) => ({
          '@type': 'PropertyValue',
          propertyID: WALLET_TYPE_REPLACER[a.type] || a.type,
          value: a.address,
        }))

      const wallet = authorWallets[i][0]?.address || likerIdsAddresses[i]

      const likerIdentifiers = {
          '@type': 'PropertyValue',
          propertyID: 'Liker ID',
          value: `https://like.co/${likerIds[i]}`,
        }

      if (likerIds[i] && likerIdsAddresses[i]) {
        identifiers.push(likerIdentifiers)
      }

      const sameAsArray = authorUrls[i].filter(a => !!a)
      const isNonEmpty = url || authorName || identifiers.length
      if (isNonEmpty) {
        stakeholders.push({
          entity: {
            '@id': wallet || url,
            name: authorName,
            url,
            description,
            sameAs: sameAsArray,
            identifier: identifiers,
          },
          rewardProportion:
            rewardProportion === 1
              ? rewardProportion
              : Math.floor((rewardProportion / authorNames.length) * 10000) /
                10000,
          contributionType: 'http://schema.org/author',
        })
      }
    }
  }

  return {
    ...data,
    author,
    keywords: tagsString.split(','),
    usageInfo: license,
    contentFingerprints: [...new Set(contentFingerprints)],
    stakeholders,
    recordNotes,
  }
}

export async function estimateISCNTxGasAndFee(tx: ISCNSignPayload) {
  const signingClient = await getSigningClient();
  const res = await signingClient.esimateISCNTxGasAndFee(tx);
  return res;
}

export async function signISCN(
  tx: ISCNSignPayload,
  signer: OfflineSigner,
  address: string,
  {
    iscnId,
    memo,
    gas = ISCN_GAS_FEE.toString(),
  }: { iscnId?: string, memo?: string, gas?: string } = {},
) {
  const isUpdate = !!iscnId
  const signingClient = await getSigningClient()
  await signingClient.connectWithSigner(network.rpcURL, signer)
  const signingPromise = isUpdate
    ? signingClient.updateISCNRecord(address, iscnId as string, tx, {
        memo: memo || 'app.like.co',
        fee: {
          gas: new BigNumber(gas).multipliedBy(ISCN_GAS_MULTIPLIER).toFixed(0),
          amount: [{
              denom: DEFAULT_GAS_PRICE[0].denom,
              amount: new BigNumber(gas).multipliedBy(DEFAULT_GAS_PRICE[0].amount).toFixed(0),
            }],
        },
      })
    : signingClient.createISCNRecord(address, tx, {
        memo: memo || 'app.like.co',
        fee: {
          gas,
          amount: [{
              denom: DEFAULT_GAS_PRICE[0].denom,
              amount: new BigNumber(gas).multipliedBy(DEFAULT_GAS_PRICE[0].amount).toFixed(0),
            }],
        },
      })
  const res = await signingPromise
  return res as DeliverTxResponse
}

