// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing';
import { ISCNSigningClient, ISCNSignPayload } from '@likecoin/iscn-js';
import network from '@/constant/network';
import { BroadcastTxSuccess } from '@cosmjs/stargate';
import { ISCNRegisterPayload } from './iscn.type';
import { WALLET_TYPE_REPLACER } from '~/constant'

let client: ISCNSigningClient | null = null;

export async function getSigningClient() {
  if (!client) {
    const c = new ISCNSigningClient();
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
      const url: string = likerIds[i]
        ? `https://like.co/${likerIds[i]}`
        : authorUrls[i][0] || authorName

      const identifiers = authorWallets[i].map((a: any) => {
        if (a.type === 'cosmos') {
          return {
            '@type': 'PropertyValue',
            propertyID: WALLET_TYPE_REPLACER[a.type],
            value: `did:cosmos:${a.address.slice(6)}`,
          }
        }
        return {
          '@type': 'PropertyValue',
          propertyID: WALLET_TYPE_REPLACER[a.type],
          value: `did:${a.type}:${a.address}`,
        }
      })

      const sameAsArray = authorUrls[i].filter(a => !!a)
      const isNonEmpty = url || authorName || identifiers.length
      if (isNonEmpty) {
        stakeholders.push({
          entity: {
            '@id': identifiers.length ? identifiers[0].value : url,
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
  return res as BroadcastTxSuccess;
}
