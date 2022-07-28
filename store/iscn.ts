/* eslint-disable import/no-extraneous-dependencies */
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
/* eslint-disable import/no-extraneous-dependencies */
import Vue from 'vue';
import { ISCNRecord } from '@likecoin/iscn-js';
import axios from 'axios';
import _ from 'lodash';
import axios from 'axios';
import getQueryClient from '~/utils/cosmos/iscn/query';
import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type';
import network from '~/constant/network'

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

  records: ISCNRecordWithID[] = [];
  isLoading = false;
  errorMessage = ''

  @Mutation
  appendRecords(records: ISCNRecord[]) {
    records.forEach((r) => {
      const id = r.data['@id'] as string;
      Vue.set(this.recordsById, id, { id, ...r })
      this.records.push({ id, ...r })
    })
  }

  @Mutation
  clearRecords() {
    this.recordsById = {}
    this.records = []
  }

  @Mutation
  setIsLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  }

  @Mutation
  setErrorMessage(errorMessage: any) {
    this.errorMessage = errorMessage.message;
  }

  @Action
  async fetchISCNByTx(iscnId: string): Promise<{
    records: ISCNRecord[];
} | null> {
    this.context.commit('clearRecords');
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
    this.context.commit('appendRecords', txRecords);
    return { records: addIDToRecords(txRecords) };
  }

  @Action
  async fetchISCNById(iscnId: string): Promise<{
    records: ISCNRecordWithID[];
    owner: string;
    latestVersion: Long.Long;
} | null> {
    this.context.commit('clearRecords');
    const client = await getQueryClient();
    const res = await client.queryRecordsById(iscnId).catch(() => null);
    if (!res) return null;
    const records = res ? res.records : [];
    this.context.commit('appendRecords', records);
    return {
      ...res,
      records: addIDToRecords(records),
    };
  }

  @Action
  async queryISCNByAddress(address: string): Promise<ISCNRecordWithID[]> {
    this.context.commit('clearRecords');
    let records: ISCNRecord[] = [];
    try {
      const client = await getQueryClient()
      let res
      let nextSequence
      do {
        this.context.commit('setIsLoading', true)
        // eslint-disable-next-line no-await-in-loop
        res = await client
          .queryRecordsByOwner(address, nextSequence)
        if (res) {
          nextSequence = res.nextSequence.toNumber()
          this.context.commit('appendRecords', res.records)
          records = records.concat(res.records)
        }
      } while (nextSequence !== 0)
    } catch (error) {
      this.context.commit('setErrorMessage', error)
    } finally {
      this.context.commit('setIsLoading', false)
    }
    return addIDToRecords(records)
  }

  @Action
  async queryISCNByKeyword(keyword: string): Promise<ISCNRecordWithID[]> {
    this.context.commit('clearRecords');
    let result: ISCNRecord[] = ([] as ISCNRecord[])
    try {
      this.context.commit('setIsLoading', true)
      const { data } = await axios.get(`${network.apiURL}/iscn/records?q=${keyword}`)
      if (data.records) result = data.records
      this.context.commit('appendRecords', result)
    } catch (error) {
      this.context.commit('setErrorMessage', error)
    } finally {
      this.context.commit('setIsLoading', false)
    }
    return addIDToRecords(result);
  }

  @Action
  async queryISCNByField({
    keyword,
  }: { keyword: string }): Promise<ISCNRecordWithID[]> {
    this.context.commit('clearRecords');
    let result: ISCNRecord[] = ([] as ISCNRecord[])
    try {
      this.context.commit('setIsLoading', true)
      const { data } = await axios.get(`${network.apiURL}/iscn/records?keyword=${encodeURIComponent(keyword)}`)
      if (data.records) result = data.records
      this.context.commit('appendRecords', result)
    } catch (error) {
      this.context.commit('setErrorMessage', error)
    } finally {
      this.context.commit('setIsLoading', false)
    }
    return addIDToRecords(result);
  }

  get getISCNById() {
    return (iscnId: string) => this.recordsById[iscnId];
  }

  get getISCNChunks() {
    // sort by latest
    return _.chunk([...this.records].reverse(), 4);
  }

  get getIsLoading() {
    return this.isLoading;
  }

  get getErrorMessage() {
    return this.errorMessage;
  }
}
