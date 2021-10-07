import { IPFS } from 'ipfs-core-types';
import { create } from 'ipfs-http-client';

const hash = require('ipfs-only-hash');

const config = require('../config/config');

const getInstance = (() => {
  let instance: IPFS | null = null;
  return () => {
    if (!instance) {
      instance = create({ url: config.IPFS_ENDPOINT });
    }
    return instance;
  };
})();

export async function uploadToIPFS(fileBlob: Buffer) {
  const client = getInstance()
  const res = await client.add(fileBlob);
  return res;
}

export async function getIPFSHash(fileBlob: Buffer) {
  const ipfsHash = await hash.of(fileBlob);
  return ipfsHash;
}

export const IPFS_ENDPOINT = 'https://ipfs.infura.io:5001/api/v0';