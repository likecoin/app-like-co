import { ISCNRecord } from "@likecoin/iscn-js";

export interface ISCNRegisterPayload {
  name: string;
  description: string;
  tagsString: string;
  url: string;
  exifInfo: any;
  license: string;
  ipfsHash: any;
  arweaveId: any;
  numbersProtocolAssetId: string;
  fileSHA256: any;
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
