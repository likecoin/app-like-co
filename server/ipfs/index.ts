import { IPFS } from 'ipfs-core-types';
import { create } from 'ipfs-http-client';
import { ArweaveFile } from '../arweave/types';

const hash = require('ipfs-only-hash');

const config = require('../config/config');

const {
  IPFS_ENDPOINT,
  REPLICA_IPFS_ENDPOINTS = [],
} = config;

const IPFS_TIMEOUT = 60000;

const getInstance = (() => {
  let instances: { primary: IPFS, replicas: IPFS[] } | null = null;
  return () => {
    if (!instances) {
      instances = {
        primary: create({ url: IPFS_ENDPOINT, timeout: IPFS_TIMEOUT }),
        replicas: REPLICA_IPFS_ENDPOINTS.map((url: string) => create({ url, timeout: IPFS_TIMEOUT })),
      };
    }
    return instances;
  };
})();

export async function uploadFileToIPFS(file: ArweaveFile, { onlyHash = false } = {}) {
  const client = getInstance()
  const fileBlob = file.buffer;
  if (!onlyHash) client.replicas.map(c => c.add(fileBlob).catch((e) => console.error(e)));
  const res = await client.primary.add(fileBlob, { onlyHash });
  return res.cid.toString();
}

async function internalUploadAll(client: IPFS, files: ArweaveFile[], { directoryName = 'tmp', onlyHash = false } = {}) {
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
  return results;
}

export async function uploadFilesToIPFS(files: ArweaveFile[], { onlyHash = false } = {}) {
  if (files.length === 1) return uploadFileToIPFS(files[0]);
  const client = getInstance()
  const directoryName = 'tmp';
  if (!onlyHash) {
    client.replicas.map(c => internalUploadAll(c, files, { directoryName, onlyHash }).catch((e) => console.error(e)));
  }
  const results = await internalUploadAll(client.primary, files, { directoryName, onlyHash });
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
