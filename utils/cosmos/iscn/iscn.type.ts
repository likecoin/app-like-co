export interface ISCNSignPayload {
  name: string;
  description: string;
  tagsString: string;
  url: string;
  license: string;
  ipfsHash: string;
  fileSHA256: string;
  type: string;
  authorNames: string[];
  authorUrls: string[];
  authorWallets:string[];
}