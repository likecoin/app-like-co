import { ISCNRecord } from "@likecoin/iscn-js";

export interface ISCNRegisterPayload {
  name: string;
  description: string;
  tagsString: string;
  url: string;
  exifInfo: any;
  license: string;
  ipfsHash: string;
  arweaveId: string;
  numbersProtocolAssetId: string;
  fileSHA256: string;
  type: string;
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
