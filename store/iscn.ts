/* eslint-disable import/no-extraneous-dependencies */
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
/* eslint-disable import/no-extraneous-dependencies */
import Vue from 'vue';
import { parsedISCNRecord } from '~/utils/cosmos/iscn';
import {
  queryRecordsByTx,
  queryRecordsById,
  queryRecordsByFingerprint,
  queryRecordsByOwner,
} from '~/utils/cosmos/iscn/query';

@Module({
  name: 'iscn',
  stateFactory: true,
  namespaced: true,
})
export default class ISCN extends VuexModule {
  recordsById: {
    [key: string]: parsedISCNRecord;
 } = {};

  recordsByIPLD: {
    [key: string]: parsedISCNRecord;
  } = {};

  @Mutation
  setRecords(records: parsedISCNRecord[]) {
    records.forEach((r) => {
      Vue.set(this.recordsById, r.id, r)
      Vue.set(this.recordsByIPLD, r.id, r)
    })
  }

  @Mutation
  clearRecords() {
    this.recordsById = {}
    this.recordsByIPLD = {}
  }

  @Action
  async fetchISCNById(iscnId: string): Promise<parsedISCNRecord[]> {
    const res = await queryRecordsById(iscnId).catch(() => {});
    const records = res ? res.records : [];
    this.context.commit('setRecords', records);
    return records;
  }

  @Action
  async queryISCNByKeyword(keyword: string): Promise<parsedISCNRecord[]> {
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
    this.context.commit('setRecords', result)
    return result;
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
