// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing';
import { ISCNSigningClient, ISCNSignPayload } from '@likecoin/iscn-js';
import network from '@/constant/network';
import { BroadcastTxSuccess } from '@cosmjs/stargate';
import { ISCNRegisterPayload } from './iscn.type';

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
    fileSHA256,
    authorNames,
    authorUrls,
    authorWallets,
    likerIds,
    descriptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    cosmosWallet,
    ...data
  } = payload;

  const contentFingerprints = []
  if (fileSHA256) contentFingerprints.push(`hash://sha256/${fileSHA256}`)
  if (ipfsHash) contentFingerprints.push(`ipfs://${ipfsHash}`)
  const stakeholders:any = []
  if (authorNames.length) {
    for (let i = 0; i < authorNames.length; i += 1) {
      const authorName = authorNames[i]
      const authorUrl = authorUrls[i]
      let authorId = ''
      const authorWalletAddress:any = []
      const sameAs:any = []
      authorWallets[i].forEach((a: any) => {
        if (a.type === 'cosmos') {
          authorId = `did:cosmos:${a.address.slice(6)}`
          authorWalletAddress.push({ address: authorId, type: a.type })
          sameAs.push(authorId)
        } else if (a.type === 'eth') {
          authorId = `did:eth:${a.address}`
          authorWalletAddress.push({ address: authorId, type: a.type })
          sameAs.push(authorId)
        }
      })
      const likerId = `https://like.co/${likerIds[i]}`
      const description = descriptions[i]
      const isNonEmpty = authorUrl || authorName || authorId
      if (isNonEmpty) {
        stakeholders.push({
            entity: {
              '@id': authorId || authorUrl || authorName,
              name: authorName,
              url: authorUrl,
              walletAddress: authorWalletAddress,
              likerId,
              description,
              sameAs,
            },
            rewardProportion: 1,
            contributionType: 'http://schema.org/author',
          },
        )
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
