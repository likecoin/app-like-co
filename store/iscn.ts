/* eslint-disable import/no-extraneous-dependencies */
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
/* eslint-disable import/no-extraneous-dependencies */
import Vue from 'vue';
import { ISCNRecord } from '@likecoin/iscn-js';
import getQueryClient from '~/utils/cosmos/iscn/query';
import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type';


function addIDToRecords(records: ISCNRecord[]): ISCNRecordWithID[] {
  return records.map(r => ({ id: r.data['@id'] as string, ...r }));
}
@Module({
  name: 'iscn',
  stateFactory: true,
  namespaced: true,
})
export default class ISCN extends VuexModule {
  recordsById: {
    [key: string]: ISCNRecordWithID;
 } = {};

  recordsByIPLD: {
    [key: string]: ISCNRecordWithID;
  } = {};

  @Mutation
  setRecords(records: ISCNRecord[]) {
    records.forEach((r) => {
      const id = r.data['@id'] as string;
      Vue.set(this.recordsById, id, { id, ...r })
      Vue.set(this.recordsByIPLD, r.ipld, { id, ...r })
    })
  }

  @Mutation
  clearRecords() {
    this.recordsById = {}
    this.recordsByIPLD = {}
  }

  @Action
  async fetchISCNByTx(iscnId: string): Promise<{
    records: ISCNRecord[];
} | null> {
    const client = await getQueryClient();
    const txRes = await client.queryISCNIdsByTx(iscnId).catch(() => null);
    let txRecords: ISCNRecord[] = [];
    if (txRes) {
      txRecords = (await Promise.all(txRes.map(async (t) => {
        if (typeof t ==='string') {
          const res = await client.queryRecordsById(t);
          return res?.records[0]
        }
        return t;
      }))).filter(t => t) as ISCNRecord[];
    }
    this.context.commit('setRecords', txRecords);
    return { records: addIDToRecords(txRecords) };
  }

  @Action
  async fetchISCNById(iscnId: string): Promise<{
    records: ISCNRecordWithID[];
    owner: string;
    latestVersion: Long.Long;
} | null> {
    const client = await getQueryClient();
    const res = await client.queryRecordsById(iscnId).catch(() => null);
    if (!res) return null;
    const records = res ? res.records : [];
    this.context.commit('setRecords', records);
    return {
      ...res,
      records: addIDToRecords(records),
    };
  }

  @Action
  async queryISCNByAddress(address: string): Promise<ISCNRecordWithID[]> {
    const client = await getQueryClient();
    const res = await client.queryRecordsByOwner(address).catch(() => {})
    const records: ISCNRecord[] = res ? res.records : [];
    this.context.commit('setRecords', records)
    return addIDToRecords(records);
  }

  @Action
  async queryISCNByKeyword(keyword: string): Promise<ISCNRecordWithID[]> {
    const client = await getQueryClient();
    const [
      txRes,
      idRes,
      fingerprintRes,
      ownerRes,
    ] = await Promise.all([
      client.queryISCNIdsByTx(keyword).catch(() => {}),
      client.queryRecordsById(keyword).catch(() => {}),
      client.queryRecordsByFingerprint(keyword).catch(() => {}),
      client.queryRecordsByOwner(keyword).catch(() => {}),
    ]);
    let txRecords: ISCNRecord[] = [];
    if (txRes) {
      txRecords = (await Promise.all(txRes.map(async (t) => {
        if (typeof t ==='string') {
          const res = await client.queryRecordsById(t);
          return res?.records[0]
        }
        return t;
      }))).filter(t => t) as ISCNRecord[];
    }
    const result: ISCNRecord[] = ([] as ISCNRecord[])
      .concat(txRecords)
      .concat(idRes ? idRes.records : [])
      .concat(fingerprintRes ? fingerprintRes.records : [])
      .concat(ownerRes ? ownerRes.records : [])
    this.context.commit('setRecords', result)
    return addIDToRecords(result);
  }

  get getISCNById() {
    return (iscnId: string) => this.recordsById[iscnId];
  }

  get getISCNByIPLD() {
    return (IPLD: string) => this.recordsByIPLD[IPLD];
  }

  get getISCNRecords() {
    return Object.values(this.recordsById);
  }
}
