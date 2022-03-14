export type ArweaveFile = {
  key: string;
  mimetype: string;
  buffer: Buffer;
  arweaveId?: string;
  filename?: string;
}

interface Manifest {
  manifest: 'arweave/paths',
  version: '0.1.0',
  index?: {
    path?: string;
  }
  paths: {
    [key: string]: {
      id: string;
    }
  },
}

export type ArweavePrice = {
  key?: string;
  arweaveId?: string;
  AR: string;
  list?: ArweavePrice[];
}

export type ArweavePriceWithLIKE = {
  key?: string;
  arweaveId?: string;
  AR: string;
  LIKE: string;
  list?: ArweavePriceWithLIKE[];
}

