export interface ISCNSignPayload {
  title: string;
  description: string;
  tagsString: string;
  url: string;
  license: string;
  ipfsHash: string;
  arweaveId: string;
  fileSHA256: string;
  type: string;
  authorNames: string[];
  authorUrls: string[];
}