/* eslint-disable import/no-extraneous-dependencies */
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import { OfflineSigner, AccountData } from '@cosmjs/proto-signing';
import WalletConnect from '@walletconnect/client';
import { payloadId } from '@walletconnect/utils';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

import { timeout } from '~/utils/misc';
import { configToKeplrCoin } from '~/utils/cosmos';
import network from '~/constant/network';

const KEY_CONNECTED_WALLET_TYPE = 'KEY_CONNECTED_WALLET_TYPE';
const KEY_WALLET_CONNECT = 'walletconnect';
const KEY_WALLET_CONNECT_ACCOUNT_PREFIX = 'KEY_WALLET_CONNECT_ACCOUNT_PREFIX';
@Module({
  name: 'wallet',
  stateFactory: true,
  namespaced: true,
})
export default class Wallet extends VuexModule {
  type = '';
  signer: OfflineSigner | null = null;
  walletConnectURI = '';
  accounts: readonly AccountData[] = [];
  isShowConnectDialog = false;

  @Mutation
  setType(type: string) {
    this.type = type;
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
  setWalletConnectURI(uri: string) {
    this.walletConnectURI = uri;
  }

  @Mutation
  setIsShowConnectDialog(isShow: boolean) {
    this.isShowConnectDialog = isShow;
  }

  @Action
  toggleConnectDialog(isShow: boolean) {
    this.setIsShowConnectDialog(isShow);
  }

  @Action
  async initIfNecessary() {
    const connectedWalletType = window.localStorage?.getItem(KEY_CONNECTED_WALLET_TYPE);
    let res = false;
    if (!this.type && connectedWalletType) {
      switch (connectedWalletType) {
        case 'keplr':
          res = await this.initKeplr();
          break;

        case 'likerland_app':
          res = await this.initWalletConnect();
          break;

        default:
          break;
      }
      if (!res) {
        window.localStorage?.removeItem(KEY_CONNECTED_WALLET_TYPE);
        throw new Error('CANNOT_INIT_WALLET');
      }
    }
    return res;
  }

  @Action
  async initKeplr(): Promise<boolean> {
    if (this.type === 'keplr') return true;
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
            low: 1,
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
        this.context.commit('setType', 'keplr')
        this.context.commit('setSigner', offlineSigner)
        this.context.commit('setAccounts', accounts)
        window.localStorage?.setItem(KEY_CONNECTED_WALLET_TYPE, 'keplr')
        return true;
      } catch (error) {
        console.error(error);
      }
    }
    return false;
  }

  @Action({ rawError: true })
  async initWalletConnect(): Promise<boolean> {
    if (this.type === 'likerland_app') return true;
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
      connector.on('disconnect', () => {
        window.localStorage?.removeItem(`${KEY_WALLET_CONNECT_ACCOUNT_PREFIX}_${connector.peerId}`);
        connector.killSession();
        this.reset();
      });

      let account: any
      if (!connector.connected) {
        await connector.connect();
        ([account] = await connector.sendCustomRequest({
          id: payloadId(),
          jsonrpc: '2.0',
          method: 'cosmos_getAccounts',
          params: ['likecoin-mainnet-2'],
        }));
        window.localStorage?.setItem(`${KEY_WALLET_CONNECT_ACCOUNT_PREFIX}_${connector.peerId}`, JSON.stringify(account));
      } else {
        const serializedAccount = window.localStorage?.getItem(`${KEY_WALLET_CONNECT_ACCOUNT_PREFIX}_${connector.peerId}`);
        if (serializedAccount) {
          account = JSON.parse(serializedAccount);
        }
      }
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
      this.context.commit('setType', 'likerland_app');
      this.context.commit('setSigner', offlineSigner);
      this.context.commit('setAccounts', accounts);
      this.context.commit('setWalletConnector', connector);
      window.localStorage?.setItem(KEY_CONNECTED_WALLET_TYPE, 'likerland_app');
      return true
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
    return false
  }

  @Action
  reset() {
    this.context.commit('setType', '');
    this.context.commit('setSigner', null);
    this.context.commit('setAccounts', []);
    window.localStorage?.removeItem(KEY_CONNECTED_WALLET_TYPE);
    // HACK: Force remove WalletConnect session
    window.localStorage?.removeItem(KEY_WALLET_CONNECT);
  }

  get getType() {
    return this.type;
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
}
