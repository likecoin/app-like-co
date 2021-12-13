/* eslint-disable import/no-extraneous-dependencies */
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { OfflineSigner, AccountData } from '@cosmjs/proto-signing';
import WalletConnect from '@walletconnect/client';
import { payloadId } from '@walletconnect/utils';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

import { timeout } from '~/utils/misc';
import { configToKeplrCoin } from '~/utils/cosmos';
import network from '~/constant/network';

@Module({
  name: 'keplr',
  stateFactory: true,
  namespaced: true,
})
export default class Keplr extends VuexModule {
  isInited = false;
  signer: OfflineSigner | null = null;
  walletConnector: WalletConnect | null = null;
  walletConnectURI = '';
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

  @Mutation
  setWalletConnector(connector: WalletConnect) {
    this.walletConnector = connector;
  }

  @Mutation
  setWalletConnectURI(uri: string) {
    this.walletConnectURI = uri;
  }

  async checkIfInited() {
    if (!this.isInited) {
      const res = await this.initKeplr();
      if (!res) throw new Error('CANNOT_INIT_KEPLR');
    }
  }

  @Action
  async initKeplr(): Promise<boolean> {
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
            low: 0.01,
            average: 10,
            high: 1000,
          },
          features: [
            'stargate',
            'ibc-transfer',
          ],
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

  @Action
  handleWalletConnectDisconnect() {
    if (this.walletConnector?.connected) {
      this.walletConnector.killSession();
      this.context.commit('setWalletConnector', null);
    }
  }

  @Action({ rawError: true })
  async initWalletConnect(): Promise<boolean> {
    if (this.isInited) return true;
    try {
      const connector = new WalletConnect({
        bridge: 'https://bridge.walletconnect.org',
        qrcodeModal: {
          open: (uri: string) => {
            this.context.commit('setWalletConnectURI', uri);
          },
          close: () => {
            this.context.commit('setWalletConnectURI', '');
          },
        },
      });
      connector.on('disconnect', this.handleWalletConnectDisconnect);

      // Kill any previous session until we implement session management
      if (connector.connected) {
        await connector.killSession()
      }

      await connector.connect();

      this.context.commit('setWalletConnector', connector);

      const [account] = await connector.sendCustomRequest({
        id: payloadId(),
        jsonrpc: '2.0',
        method: 'cosmos_getAccounts',
        params: ['likecoin-mainnet-2'],
      });
      if (!account) return false;

      const {
        bech32Address: address,
        algo,
        pubKey: pubKeyInHex,
      } = account;
      if (!address || !algo || !pubKeyInHex) return false;
      const pubkey = new Uint8Array(Buffer.from(pubKeyInHex, "hex"));
      const accounts: readonly AccountData[] = [{ address, pubkey, algo }];
      const offlineSigner: OfflineSigner = {
        getAccounts: () => Promise.resolve(accounts),
        signDirect: async (signerAddress, signDoc) => {
          const signDocInJSON = SignDoc.toJSON(signDoc);
          const resInJSON = await connector.sendCustomRequest({
            id: payloadId(),
            jsonrpc: '2.0',
            method: 'cosmos_signDirect',
            params: [
              signerAddress,
              signDocInJSON,
            ],
          });
          return {
            signed: SignDoc.fromJSON(resInJSON.signed),
            signature: resInJSON.signature,
          };
        },
      }
      this.context.commit('setInited', true);
      this.context.commit('setSigner', offlineSigner);
      this.context.commit('setAccounts', accounts);
      return true
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
    return false
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

  get getWalletConnectURI() {
    return this.walletConnectURI;
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
