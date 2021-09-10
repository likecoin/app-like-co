import { ISCNQueryClient } from '@likecoin/iscn-js';
import network from '@/constant/network';

let client: ISCNQueryClient | null = null;

export default async function getQueryClient() {
  if (!client) {
    const c = new ISCNQueryClient();
    await c.connect(network.rpcURL);
    client = c;
  }
  return client;
}
