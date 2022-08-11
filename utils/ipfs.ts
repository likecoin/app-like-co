import { IPFS_VIEW_GATEWAY_URL } from '~/constant';

export default function getIPFSURLFromHash(ipfsHash: string): string{
  if (!ipfsHash) return '';
  return `${IPFS_VIEW_GATEWAY_URL}/${ipfsHash}`;
}
