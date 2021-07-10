import { StargateClient, QueryClient } from "@cosmjs/stargate";
// eslint-disable-next-line import/no-extraneous-dependencies
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { ISCNExtension, setupISCNExtension } from "./ISCNQueryExtension";
import config from "~/constant/network";
import { parseISCNTxInfoFromIndexedTx, parseISCNTxRecordFromQuery, parsedISCNRecord } from '.';
import { MsgCreateIscnRecord } from "~/constant/codec/iscn/tx";

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
  if (res) {
    const parsed = parseISCNTxInfoFromIndexedTx(res);
    const messages: parsedISCNRecord[] = [];
    parsed.tx.body.messages.forEach((m, index) => {
      if (!m || !m.typeUrl.includes('/likechain.iscn')) return;
      const data = (m.value as MsgCreateIscnRecord).record;
      if (!data) return;
      const log = parsed.logs[index];
      const event = log.events.find((e: any) => e.type === 'iscn_record');
      if (!event) return;
      const { attributes } = event;
      const ipldAttr = attributes.find((a: any) => a.key === 'ipld');
      const ipld = ipldAttr && ipldAttr.value;
      const iscnIdAttr = attributes.find((a: any) => a.key === 'iscn_id');
      const iscnId = iscnIdAttr && iscnIdAttr.value;
      if (!ipld || !iscnId) return;
      messages.push({
        ipld,
        id: iscnId,
        data,
      })
    });
    return messages;
  }
  return null;
}

export async function queryRecordsById(iscnId: string, fromVersion?: number, toVersion?: number) {
  if (!queryClient) await initQueryClient();
  const res = await queryClient.iscn.recordsById(iscnId, fromVersion, toVersion);
  if (res && res.records) {
    const records = parseISCNTxRecordFromQuery(res.records);
    return {
      ...res,
      records,
    };
  }
  return null;
}

export async function queryRecordsByFingerprint(fingerprint: string, fromSequence?: number) {
  if (!queryClient) await initQueryClient();
  const res = await queryClient.iscn.recordsByFingerprint(fingerprint, fromSequence);
  if (res && res.records) {
    const records = parseISCNTxRecordFromQuery(res.records);
    return {
      ...res,
      records,
    };
  }
  return null;
}

export async function queryRecordsByOwner(owner: string, fromSequence?: number) {
  if (!queryClient) await initQueryClient();
  const res = await queryClient.iscn.recordsByOwner(owner, fromSequence);
  if (res && res.records) {
    const records = parseISCNTxRecordFromQuery(res.records);
    return {
      ...res,
      records,
    };
  }
  return null;
}

export async function queryISCNByAll(keyword: string) {
  const [txRes, idRes, fingerprintRes, ownerRes] = await Promise.all([
    queryRecordsByTx(keyword).catch(() => {}),
    queryRecordsById(keyword).catch(() => {}),
    queryRecordsByFingerprint(keyword).catch(() => {}),
    queryRecordsByOwner(keyword).catch(() => {}),
  ]);
  let txRecords: parsedISCNRecord[] = [];
  if (txRes) {
    txRecords = (await Promise.all(txRes.map(async (t) => {
      if (typeof t ==='string') {
        const res = await queryRecordsById(t);
        return res?.records[0]
      }
      return t;
    }))).filter(t => t) as parsedISCNRecord[];
  }
  const result: parsedISCNRecord[] = ([] as parsedISCNRecord[])
    .concat(txRecords)
    .concat(idRes ? idRes.records : [])
    .concat(fingerprintRes ? fingerprintRes.records : [])
    .concat(ownerRes ? ownerRes.records : []);
  return result;
}