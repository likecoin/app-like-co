import { create } from 'ipfs-http-client';
import { IPFS_VIEW_GATEWAY_URL, IPFS_ENDPOINT } from '~/constant';

export function getIPFSURLFromHash(ipfsHash: string): string{
  if (!ipfsHash) return '';
  return `${IPFS_VIEW_GATEWAY_URL}/${ipfsHash}`;
}

export default create({ url: IPFS_ENDPOINT });