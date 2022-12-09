// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing';
import { ISCNSignPayload, ISCNSigningClient } from '@likecoin/iscn-js';
import network from '@/constant/network';
import { DeliverTxResponse } from '@cosmjs/stargate';
import { ISCNRegisterPayload } from './iscn.type';
import { WALLET_TYPE_REPLACER } from '~/constant'

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
    descriptions,
    numbersProtocolAssetId,
    ...data
  } = payload;

  const contentFingerprints = []
  if (fileSHA256) contentFingerprints.push(`hash://sha256/${fileSHA256}`)
  if (ipfsHash) contentFingerprints.push(`ipfs://${ipfsHash}`)
  if (arweaveId) contentFingerprints.push(`ar://${arweaveId}`);
  if (numbersProtocolAssetId) contentFingerprints.push(`num://${numbersProtocolAssetId}`);
  const stakeholders: any = []
  if (authorNames.length) {
    for (let i = 0; i < authorNames.length; i += 1) {
      const authorName: string = authorNames[i]
      const description = descriptions[i]
      const url: string = (likerIds[i] && likerIdsAddresses[i])
        ? `https://like.co/${likerIds[i]}`
        : authorUrls[i][0] || authorName

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
          rewardProportion: 1,
          contributionType: 'http://schema.org/author',
        })
      }
    }
  }

  return {
    ...data,
    keywords: tagsString.split(','),
    usageInfo: license,
    contentFingerprints,
    stakeholders,
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
) {
  const signingClient = await getSigningClient();
  await signingClient.connectWithSigner(network.rpcURL, signer);
  const res = await signingClient.createISCNRecord(address, tx, { memo: 'app.like.co' });
  return res as DeliverTxResponse;
}
