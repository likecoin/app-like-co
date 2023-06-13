// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing';
import { ISCNSignPayload, ISCNSigningClient } from '@likecoin/iscn-js';
import network from '@/constant/network';
import { DeliverTxResponse } from '@cosmjs/stargate';
import { ISCNRegisterPayload } from './iscn.type';
import { WALLET_TYPE_REPLACER } from '~/constant'
import { getPublisherISCNPayload } from '.';

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
    publisher,
    ...data
  } = payload;

  const contentFingerprints = [...contentFingerprintsInput]
  const stakeholders = [...stakeholdersInput]
  let rewardProportion = 1
  if (publisher) {
    const {
      stakeholders: publisherStakeholders = [],
      contentFingerprints: publisherContentFingerprints = [],
    } = getPublisherISCNPayload(publisher)
    stakeholders.push(...publisherStakeholders);
    contentFingerprints.push(...publisherContentFingerprints);
    if (publisherStakeholders && publisherStakeholders.length) {
      rewardProportion = publisherStakeholders.reduce((acc, cur) => {
        if (cur.rewardProportion) return acc + cur.rewardProportion
        return acc
      }, 0)
    }
  }
  if (fileSHA256) contentFingerprints.push(`hash://sha256/${fileSHA256}`)
  if (ipfsHash) contentFingerprints.push(`ipfs://${ipfsHash}`)
  if (arweaveId) contentFingerprints.push(`ar://${arweaveId}`);
  if (numbersProtocolAssetId) contentFingerprints.push(`num://${numbersProtocolAssetId}`);
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

      if(likerIds[i] && likerIdsAddresses[i]) identifiers.push(likerIdentifiers)

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
    keywords: tagsString.split(','),
    usageInfo: license,
    contentFingerprints: [...new Set(contentFingerprints)],
    stakeholders,
    recordNotes,
  }
}

export async function esimateISCNTxGasAndFee(tx: ISCNSignPayload) {
  const signingClient = await getSigningClient();
  const res = await signingClient.esimateISCNTxGasAndFee(tx);
  return res;
}

export async function signISCN(
  tx: ISCNSignPayload,
  signer: OfflineSigner,
  address: string,
  { iscnId, memo }: { iscnId?: string, memo?: string } = {},
) {
  const isUpdate = !!iscnId;
  const signingClient = await getSigningClient();
  await signingClient.connectWithSigner(network.rpcURL, signer);
  const signingPromise = isUpdate ? signingClient.updateISCNRecord(address, iscnId as string, tx, { memo: memo || 'app.like.co' })
    : signingClient.createISCNRecord(address, tx, { memo: memo || 'app.like.co' });
  const res = await signingPromise;
  return res as DeliverTxResponse;
}
