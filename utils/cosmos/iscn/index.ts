import {
  BroadcastTxSuccess,
  IndexedTx,
} from '@cosmjs/stargate';
import { decodeTxRaw } from '@cosmjs/proto-signing';
import { IscnRecord, MsgCreateIscnRecord } from "~/constant/codec/iscn/tx";
import { QueryResponseRecord } from "~/constant/codec/iscn/query";

export interface parsedISCNData {
  stakeholders: any[];
  contentMetadata: any;
  recordNotes: string;
  contentFingerprints: string[];
}
export interface parsedISCNRecord {
  ipld: string;
  id: string;
  data: parsedISCNData
}

function parseISCNRecordFields(record: IscnRecord): parsedISCNData {
  const {
    stakeholders,
    contentMetadata,
  } = record;
  return {
    ...record,
    stakeholders: stakeholders.map((s: Uint8Array) => {
      if (s) {
        const sString = Buffer.from(s).toString('utf-8');
        if (sString) return JSON.parse(sString);
      }
      return s;
    }),
    contentMetadata: JSON.parse(Buffer.from(contentMetadata).toString('utf-8')),
  }
}

export function parseISCNTxInfoFromTxSuccess(tx: BroadcastTxSuccess) {
  const { transactionHash } = tx;
  let iscnId;
  if (tx.rawLog) {
    const [log] = JSON.parse(tx.rawLog)
    if (log) {
      const ev = log.events.find((e: { type: string; }) => e.type === 'iscn_record');
      if (ev) iscnId = ev.attributes[0].value;
    }
  }
  return {
    txHash: transactionHash,
    iscnId,
  }
}

export function parseISCNTxInfoFromIndexedTx(tx: IndexedTx) {
  const { tx: txBytes, rawLog } = tx;
  const decodedTx = decodeTxRaw(txBytes);
  const messages = decodedTx.body.messages.map((m) => {
    if (m.typeUrl === '/likechain.iscn.MsgCreateIscnRecord') {
      const msg = MsgCreateIscnRecord.decode(m.value);
      if (msg.record) {
        msg.record = parseISCNRecordFields(msg.record);
      }
      return {
        ...m,
        value: msg,
      };
    }
    /* Do not handle msg except creat for now */
    // if (m.typeUrl === '/likechain.iscn.MsgUpdateIscnRecord') {
    //   const msg = MsgUpdateIscnRecord.decode(m.value);
    //   if (msg.record) {
    //     msg.record = parseISCNRecordFields(msg.record);
    //   }
    //   return {
    //     ...m,
    //     value: msg,
    //   };
    // }
    // if (m.typeUrl === '/likechain.iscn.MsgChangeIscnRecordOwnership') {
    //   const msg = MsgChangeIscnRecordOwnership.decode(m.value);
    //   return {
    //     ...m,
    //     value: msg,
    //   };
    // }
    return null;
  });

  return {
    ...tx,
    logs: JSON.parse(rawLog),
    tx : {
      ...decodedTx,
      body: {
        ...decodedTx.body,
        messages: messages.filter(m => m),
      },
    },
  };
}

export function parseISCNTxRecordFromQuery(records: QueryResponseRecord[]) {
  return records.map((r): parsedISCNRecord => {
    const { data, ipld } = r;
    const parsedData = JSON.parse(Buffer.from(data).toString('utf-8'));
    return {
      ipld,
      id: parsedData['@id'],
      data: parsedData,
    }
  });
}
