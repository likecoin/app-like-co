/* eslint-disable import/no-extraneous-dependencies */
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { OfflineSigner } from '@cosmjs/proto-signing';

@Module({
  name: 'signer',
  stateFactory: true,
  namespaced: true,
})
export default class Keplr extends VuexModule {
  address: string = '';
  signer: OfflineSigner | null = null;

  @Mutation
  setSigner(signer: OfflineSigner | null) {
    this.signer = signer;
  }

  @Mutation
  setAddress(address: string) {
    this.address = address;
  }

  @Action
  updateSignerInfo({ signer, address } : { signer: OfflineSigner | null, address: string}) {
    this.context.commit('setSigner', signer)
    this.context.commit('setAddress', address)
  }

  get getAddress() {
    return this.address;
  }

  get getSigner() {
    return this.signer;
  }
}
