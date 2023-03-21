// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing';
import { ISCNRecord, ISCNSignPayload } from '@likecoin/iscn-js';
import { signISCN as sign } from './sign';
import getQueryClient from './query';
import { getIPFSURLFromHash } from '../../ipfs';

export async function signISCNTx(
  tx: ISCNSignPayload,
  signer: OfflineSigner,
  address: string,
  memo?: string,
) {
  const client = await getQueryClient();
  const res = await sign(tx, signer, address, memo);
  const [iscnId] = await client.queryISCNIdsByTx(res.transactionHash);
  return {
    iscnId,
    txHash: res.transactionHash,
  };
}

export function getIPFSUrlFromISCN(record: ISCNRecord): string{
  if (!record) return '';
  const ipfsUrl = record.data.contentFingerprints.find(f => f.startsWith('ipfs://'));
  if (!ipfsUrl) return '';
  const ipfsHash = ipfsUrl.replace('ipfs://','');
  return getIPFSURLFromHash(ipfsHash);
}

export function getPublisherISCNPayload(publisher: string | any) {
  const stakeholders = [];
  let contentFingerprints = [];
  if (!publisher) return {};
  if (typeof publisher === 'object') {
    const {
      contentFingerprints: publisherContentFingerprints,
      ...actualPublisher
    } = publisher;
    contentFingerprints = publisherContentFingerprints;
    stakeholders.push({
      rewardProportion: 0.025,
      contributionType: 'http://schema.org/publisher',
      ...actualPublisher,
    });
  } else {
    stakeholders.push({
      entity: {
        '@id': publisher,
      },
      rewardProportion: 0,
      contributionType: 'http://schema.org/publisher',
    });
  }
  return {
    stakeholders,
    contentFingerprints: contentFingerprints || [],
  };
}