import { ISCNRecord } from "@likecoin/iscn-js";

export interface ISCNRegisterPayload {
  name: string;
  description: string;
  tagsString: string;
  url: string;
  exifInfo: any;
  license: string;
  ipfsHash: string | string[];
  arweaveId: string | string[];
  numbersProtocolAssetId: string | string[];
  fileSHA256: string | string[];
  type: string;
  publisher?: string,
  author: string;
  authorNames: string[];
  authorUrls: string[][];
  authorWallets: any[][];
  authorDescriptions: string[];
  likerIds: string[];
  likerIdsAddresses: (string | void)[];
  contentFingerprints?: string[];
  stakeholders?: any[];
  recordNotes?: string;
  memo?: string;
}
export interface ISCNRecordWithID extends ISCNRecord {
  id: string;
}
