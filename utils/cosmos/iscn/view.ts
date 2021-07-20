import { parsedISCNRecord } from '.';
import { getIPFSURLFromHash } from '../../ipfs';

export function getIPFSUrlFromISCN(record: parsedISCNRecord): string{
  if (!record) return '';
  const ipfsUrl = record.data.contentFingerprints.find(f => f.startsWith('ipfs://'));
  if (!ipfsUrl) return '';
  const ipfsHash = ipfsUrl.replace('ipfs://','');
  return getIPFSURLFromHash(ipfsHash);
}

export default getIPFSUrlFromISCN;