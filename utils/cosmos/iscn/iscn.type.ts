import { ISCNRecord } from "@likecoin/iscn-js";

export interface ISCNRegisterPayload {
  name: string;
  description: string;
  tagsString: string;
  url: string;
  license: string;
  ipfsHash: string;
  fileSHA256: string;
  type: string;
  authorNames: string[];
  authorUrls: string[][];
  authorWallets:string[][];
  cosmosWallet: string;
  likerIds: string[];
  descriptions: string[];
}
export interface ISCNRecordWithID extends ISCNRecord {
  id: string;
}
