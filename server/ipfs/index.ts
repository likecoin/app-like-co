import { create, IPFSHTTPClient } from 'ipfs-http-client';
import { CarReader } from '@ipld/car';
import { Web3Storage } from 'web3.storage';
import { ArweaveFile } from '../arweave/types';

const hash = require('ipfs-only-hash');

const config = require('../config/config');

const {
  IPFS_ENDPOINT,
  REPLICA_IPFS_ENDPOINTS = [],
  WEB3_STORAGE_API_TOKEN,
} = config;

const IPFS_TIMEOUT = 60000;

const getInstance = (() => {
  let instances: { primary: IPFSHTTPClient, replicas: IPFSHTTPClient[] } | null = null;
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

const getWeb3StorageClient = (() => {
  let client: Web3Storage | null = null;
  return () => {
    if (!client && WEB3_STORAGE_API_TOKEN) {
      client = new Web3Storage({ token: WEB3_STORAGE_API_TOKEN });
    }
    return client
  };
})();

async function uploadCARToIPFSByWeb3Storage(car: AsyncIterable<Uint8Array>) {
  try {
    const web3StorageClient = getWeb3StorageClient();
    if (web3StorageClient) {
      const reader = await CarReader.fromIterable(car);
      await web3StorageClient.putCar(reader);
    }
  } catch (error) {
    // no-op
  }
}

export async function uploadFileToIPFS(file: ArweaveFile, { onlyHash = false } = {}) {
  const ipfsHttpClient = getInstance();
  const fileBlob = file.buffer;
  // eslint-disable-next-line no-console
  if (!onlyHash) ipfsHttpClient.replicas.map(c => c.add(fileBlob).catch((e) => console.error(e)));
  const res = await ipfsHttpClient.primary.add(fileBlob, { onlyHash });
  const out = ipfsHttpClient.primary.dag.export(res.cid);
  await uploadCARToIPFSByWeb3Storage(out);
  return res.cid.toString();
}

async function internalUploadAll(client: IPFSHTTPClient, files: ArweaveFile[], { directoryName = 'tmp', onlyHash = false } = {}) {
  const promises = client.addAll(
    files.map(f => ({
      content: f.buffer,
      path: `/${directoryName}/${f.key}`,
    })), { onlyHash },
  );
  const results = [];
  // eslint-disable-next-line no-restricted-syntax
  for await (const result of promises) {
    const out = client.dag.export(result.cid);
    await uploadCARToIPFSByWeb3Storage(out);
    results.push(result);
  }
  return results;
}

export async function uploadFilesToIPFS(files: ArweaveFile[], { onlyHash = false } = {}) {
  if (files.length === 1) return uploadFileToIPFS(files[0]);
  const client = getInstance();
  const directoryName = 'tmp';
  if (!onlyHash) {
    // eslint-disable-next-line no-console
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
