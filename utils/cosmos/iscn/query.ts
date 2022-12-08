import { ISCNQueryClient } from '@likecoin/iscn-js';
import network from '@/constant/network';

let client: ISCNQueryClient | null = null;
let iscnLib: any = null;

export async function getISCNLib() {
  if (!iscnLib) {
    iscnLib = await import(/* webpackChunkName: "iscn_js" */ '@likecoin/iscn-js');
  }
  return iscnLib;
}

export default async function getQueryClient() {
  if (!client) {
    const iscn = await getISCNLib();
    const c = new iscn.ISCNQueryClient() as ISCNQueryClient;
    await c.connect(network.rpcURL);
    client = c;
  }
  return client;
}
