import { StargateClient } from "@cosmjs/stargate";
import { MsgCreateIscnRecord } from "@likecoin/iscn-message-types/dist/iscn/tx";
import config from "~/constant/network";
import { parseISCNTxInfoFromIndexedTx, parseISCNTxRecordFromQuery, parsedISCNRecord } from '.';
import { getQueryClient } from "..";

let stargateClient: StargateClient;

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
  const queryClient = await getQueryClient();
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
  const queryClient = await getQueryClient();
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
  const queryClient = await getQueryClient();
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
