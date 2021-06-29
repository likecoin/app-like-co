/* eslint-disable import/no-extraneous-dependencies */
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { OfflineSigner, AccountData } from '@cosmjs/proto-signing';

import { timeout } from '~/utils/misc';
import { configToKeplrCoin } from '~/utils/cosmos';
import { DEFAULT_GAS_PRICE_NUMBER } from '~/constant';
import network from '~/constant/network';

@Module({
  name: 'keplr',
  stateFactory: true,
  namespaced: true,
})
export default class Keplr extends VuexModule {
  isInited = false;
  signer: OfflineSigner | null = null;
  accounts: readonly AccountData[] = [];

  @Mutation
  setInited(isInited: boolean) {
    this.isInited = isInited;
  }

  @Mutation
  setSigner(signer: any) {
    this.signer = signer;
  }

  @Mutation
  setAccounts(accounts: readonly AccountData[]) {
    this.accounts = accounts;
  }

  async checkIfInited() {
    if (!this.isInited) {
      const res = await this.initKeplr();
      if (!res) throw new Error('CANNOT_INIT_KEPLR');
    }
  }

  @Action
  async initKeplr() {
    if (this.isInited) return true;
    if (!window.keplr) {
      let tries = 0;
      const TRY_COUNT = 3;
      while (TRY_COUNT > tries) {
        // eslint-disable-next-line no-await-in-loop
        await timeout(1000);
        tries += 1;
      }
    }
    if (window.keplr && window.keplr.experimentalSuggestChain) {
      try {
        await window.keplr.experimentalSuggestChain({
          chainId: network.id,
          chainName: network.name,
          rpc: network.rpcURL,
          rest: network.apiURL,
          stakeCurrency: configToKeplrCoin(network.stakingDenom),
          walletUrlForStaking: network.stakingWalletURL,
          bip44: {
            coinType: 118,
          },
          bech32Config: {
            bech32PrefixAccAddr: network.addressPrefix,
            bech32PrefixAccPub: `${network.addressPrefix}pub`,
            bech32PrefixValAddr: `${network.addressPrefix}valoper`,
            bech32PrefixValPub: `${network.addressPrefix}valoperpub`,
            bech32PrefixConsAddr: `${network.addressPrefix}valcons`,
            bech32PrefixConsPub: `${network.addressPrefix}valconspub`,
          },
          currencies: network.coinLookup.map(({ viewDenom }) => configToKeplrCoin(viewDenom)),
          feeCurrencies: network.coinLookup.map(({ viewDenom }) => configToKeplrCoin(viewDenom)),
          coinType: 118,
          gasPriceStep: {
            low: DEFAULT_GAS_PRICE_NUMBER,
            average: DEFAULT_GAS_PRICE_NUMBER,
            high: DEFAULT_GAS_PRICE_NUMBER,
          },
        });
        await window.keplr.enable(network.id);

        const offlineSigner = window.getOfflineSigner(network.id);
        const accounts = await offlineSigner.getAccounts();
        this.context.commit('setInited', true)
        this.context.commit('setSigner', offlineSigner)
        this.context.commit('setAccounts', accounts)
        return true;
      } catch (error) {
        console.error(error);
      }
    }
    return false;
  }

  get getIsInited() {
    return this.isInited;
  }

  get getSigner() {
    return this.signer;
  }

  get getWalletAddress() {
    const [wallet] = this.accounts;
    if (!wallet) return '';
    return wallet.address;
  }

  @Action
  async fetchKeplrSigner() {
    await this.checkIfInited();
    return this.signer;
  }

  @Action
  async fetchWalletAddress() {
    await this.checkIfInited();
    const address = this.context.getters.getWalletAddress;
    return address;
  }

}
