import { StargateClient, QueryClient } from "@cosmjs/stargate";
// eslint-disable-next-line import/no-extraneous-dependencies
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { ISCNExtension, setupISCNExtension } from "./ISCNQueryExtension";
import config from "~/constant/network";
import { parseISCNTxInfoFromIndexedTx } from '.';

let stargateClient: StargateClient;
let queryClient: QueryClient & ISCNExtension;

async function initQueryClient() {
  const tendermintClient = await Tendermint34Client.connect(config.rpcURL);
  queryClient = QueryClient.withExtensions(
    tendermintClient,
    setupISCNExtension,
  );
}

export async function queryRecordsByTx(txId: string) {
  if (!stargateClient) stargateClient = await StargateClient.connect(config.rpcURL);
  const res = await stargateClient.getTx(txId);
  if (res) return parseISCNTxInfoFromIndexedTx(res);
  return null;
}

export async function queryRecordsById(iscnId: string, fromVersion?: number, toVersion?: number) {
  if (!queryClient) await initQueryClient();
  return queryClient.iscn.recordsById(iscnId, fromVersion, toVersion);
}

export async function queryRecordsByFingerprint(fingerprint: string, fromSequence?: number) {
  if (!queryClient) await initQueryClient();
  return queryClient.iscn.recordsByFingerprint(fingerprint, fromSequence);
}

export async function queryRecordsByOwner(owner: string, fromSequence?: number) {
  if (!queryClient) await initQueryClient();
  return queryClient.iscn.recordsByOwner(owner, fromSequence)
}
