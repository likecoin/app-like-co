import {
  BroadcastTxSuccess,
  IndexedTx,
} from '@cosmjs/stargate';
import { decodeTxRaw } from '@cosmjs/proto-signing';
import { IscnRecord, MsgCreateIscnRecord, MsgUpdateIscnRecord, MsgChangeIscnRecordOwnership } from "~/constant/codec/iscn/tx";

function parseISCNRecordFields(record: IscnRecord) {
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
  const { tx: txBytes } = tx;
  const decodedTx = decodeTxRaw(txBytes);
  const messages = decodedTx.body.messages.map((m) => {
    if (m.typeUrl === '/likechain.iscn.MsgCreateIscnRecord') {
      const msg = MsgCreateIscnRecord.decode(m.value);
      console.log(msg)
      if (msg.record) msg.record = parseISCNRecordFields(msg.record);
      return msg.record;
    }
    return m
  });
  return {
    ...tx,
    messages,
  }
}

// export function parseISCNTxInfoFromIndexedTx(tx: IndexedTx) {
//   const { tx: txBytes } = tx;
//   const decodedTx = decodeTxRaw(txBytes);
//   const messages = decodedTx.body.messages.map((m) => {
//     if (m.typeUrl === '/likechain.iscn.MsgCreateIscnRecord') {
//       return MsgCreateIscnRecord.decode(m.value);
//     }
//     return m
//   });
//   return {
//     ...tx,
//     messages,
//   }
// }
