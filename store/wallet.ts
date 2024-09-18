/* eslint-disable import/no-extraneous-dependencies */
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import axios from 'axios'
import { OfflineSigner } from '@cosmjs/proto-signing'
import { catchAxiosError } from '~/utils/misc'
import { LIKECOIN_WALLET_CONNECTOR_CONFIG } from '~/constant/network'
import { getUserInfoMinByAddress } from '~/constant/api'

let likecoinWalletLib: any = null
let connectorInstance: any = null
let restoreSessionPromise: any = null

async function getLikeCoinWalletLib() {
  if (!likecoinWalletLib) {
    likecoinWalletLib = await import(/* webpackChunkName: "likecoin_wallet" */ '@likecoin/wallet-connector')
  }
  return likecoinWalletLib
}

async function getConnector() {
  if (connectorInstance) {
    return connectorInstance
  }
  const lib = await getLikeCoinWalletLib()
  connectorInstance = new lib.LikeCoinWalletConnector({
    ...LIKECOIN_WALLET_CONNECTOR_CONFIG,
  })
  return connectorInstance
}

@Module({
  name: 'wallet',
  stateFactory: true,
  namespaced: true,
})
export default class Wallet extends VuexModule {
  type = ''
  address = ''
  signer: OfflineSigner | null = null
  isShowKeplrWarning = false
  isOpenSnackbar = false
  likerInfo = null
  errorType = ''
  hasSubmittedEmail = false

  @Mutation
  setType(type: string) {
    this.type = type
  }

  @Mutation
  setLikerInfo(info: any) {
    this.likerInfo = info
  }

  @Mutation
  setAddress(address: string) {
    this.address = address
  }

  @Mutation
  setSigner(signer: any) {
    this.signer = signer
  }

  @Mutation
  setKeplrWarning(isShow: boolean) {
    this.isShowKeplrWarning = isShow
  }

  @Mutation
  setOpenSnackbar(error: string) {
    this.isOpenSnackbar = true
    this.errorType = error
  }

  @Mutation
  setCloseSnackbar() {
    this.isOpenSnackbar = false
  }

  @Mutation
  setMessageSigningMode(enabled: boolean) {
    if ((this.signer as any)?.keplr) {
      (this.signer as any).keplr.defaultOptions = {
        sign: {
            preferNoSetFee: enabled,
            preferNoSetMemo: enabled,
        },
      }
    };
  }

  @Mutation
  setHasSubmittedEmail(hasSubmittedEmail: boolean) {
    this.hasSubmittedEmail = hasSubmittedEmail
  }

  @Action
  toggleKeplrWarning(isShow: boolean) {
    this.setKeplrWarning(isShow)
  }

  @Action
  toggleSnackbar(error: string = '') {
    this.setOpenSnackbar(error)
  }

  @Action
  closeSnackbar() {
    this.setCloseSnackbar()
  }

  @Action
  async initIfNecessary() {
    const connector = await getConnector()
    const connection = await connector.initIfNecessary()
    if (connection) {
      const { accounts, offlineSigner, method } = connection
      await this.initWallet({ accounts, offlineSigner, method })
    }
  }

  @Action
  async initWallet({
    method,
    accounts,
    offlineSigner,
  }: {
    method: any
    accounts: any
    offlineSigner?: any
  }) {
    if (!accounts[0]) return false
    const connector = await getConnector()
    // Listen once per account
    connector.once('account_change', async (currentMethod: any) => {
      const connection = await connector.init(currentMethod)
      this.disconnectWallet()
      this.initWallet(connection)
    })
    this.context.commit('setType', method)
    this.context.commit('setLikerInfo', null)

    const { address, bech32Address } = accounts[0]
    const walletAddress = bech32Address || address
    this.context.commit('setAddress', walletAddress)
    this.context.commit('setSigner', offlineSigner)

    catchAxiosError(axios.get(getUserInfoMinByAddress(walletAddress)))
      .then((userInfo) => {
        if (userInfo) {
          this.context.commit('setLikerInfo', userInfo)
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
    try {
      const url = `https://script.google.com/a/macros/like.co/s/AKfycbzNiLsX4ZD9o3tY2zPFXmSnh5cFlAFS-NV4X5XwViYObuNwtZjBlR4DBjN0b58OvVQqSQ/exec?walletAddress=${this.address}`
      const { data } = await axios.get(url)
      if (data) {
        this.context.commit('setHasSubmittedEmail', data.hasEmail)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
    return true
  }

  @Action
  async restoreSession() {
    const connector = await getConnector()
    const session = connector.restoreSession()
    if (session) {
      const { accounts, method } = session
      await this.context.dispatch('initWallet', { method, accounts })
    }
  }

  @Action
  async restoreSessionIfNecessary() {
    if (restoreSessionPromise) {
      return restoreSessionPromise
    }

    restoreSessionPromise = this.context.dispatch('restoreSession')
    const result = await restoreSessionPromise
    restoreSessionPromise = null
    return result
  }

  @Action
  // eslint-disable-next-line class-methods-use-this
  async openConnectWalletModal({ language, fullPath }: { language: string, fullPath?: string }) {
    if (window.sessionStorage && fullPath) {
      window.sessionStorage.setItem(
        'USER_POST_AUTH_ROUTE',
        fullPath,
      );
    }
    const connector = await getConnector()
    const connection = await connector.openConnectionMethodSelectionDialog({
      language,
    })
    return connection
  }

  @Action
  // eslint-disable-next-line class-methods-use-this
  async handleConnectorRedirect(
    { method, params }: { method: string, params: string },
  ) {
    const connector = await getConnector()
    const connection = await connector.handleRedirect(method, params);
    return connection;
  }

  @Action
  disconnectWallet() {
    connectorInstance.disconnect()
    this.context.commit('setAddress', '')
    this.context.commit('setLikerInfo', null)
    this.context.commit('setType', '')
    this.context.commit('setSigner', null)
  }

  get getType() {
    return this.type
  }

  get getSigner() {
    return this.signer
  }

  get getWalletAddress() {
    return this.address
  }

  get getHasSubmittedEmail() {
    return this.hasSubmittedEmail
  }
}
