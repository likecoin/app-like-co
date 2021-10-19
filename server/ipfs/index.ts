import { IPFS } from 'ipfs-core-types';
import { create } from 'ipfs-http-client';
import { ArweaveFile } from '../arweave/types';

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

export async function uploadFileToIPFS(fileBlob: Buffer) {
  const client = getInstance()
  const res = await client.add(fileBlob);
  return res;
}

export async function uploadFilesToIPFS(files: ArweaveFile[], { onlyHash = false } = {}) {
  const client = getInstance()
  const directoryName = 'tmp';
  const promises = client.addAll(
    files.map(f => ({
      content: f.buffer,
      path: `/${directoryName}/${f.key}`,
    })), { onlyHash },
  );
  const results = [];
  // eslint-disable-next-line no-restricted-syntax
  for await (const result of promises) {
    results.push(result);
  }
  let entry = results.find(r => r.path === directoryName);
  if (!entry) {
    entry = results.find((r => r.path.endsWith('index.html')));
  }
  if (!entry) return '';
  const contentHash = entry.cid.toString();
  return contentHash;
}

export async function getFileIPFSHash(file: ArweaveFile) {
  const ipfsHash = await hash.of(file.buffer);
  return ipfsHash;
}

export async function getFolderIPFSHash(files: ArweaveFile[]) {
  const dagHash = await uploadFilesToIPFS(files, { onlyHash: true });
  return dagHash;
}

export function getIPFSHash(files: ArweaveFile[]) {
  if (files.length === 1) return getFileIPFSHash(files[0]);
  return getFolderIPFSHash(files);
}

export const IPFS_ENDPOINT = 'https://ipfs.infura.io:5001/api/v0';