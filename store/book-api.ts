/* eslint-disable import/no-extraneous-dependencies */
import { Module, VuexModule,Mutation, Action } from 'vuex-module-decorators'

import axios from 'axios'

import { saveAuthSession, clearAuthSession, loadAuthSession} from '~/utils/auth'
import { API_POST_AUTHORIZE } from '~/constant/api'

@Module({
  name: 'book-api',
  stateFactory: true,
  namespaced: true,
})
export default class BookAPI extends VuexModule {
  token = ''
  sessionWallet = ''
  isRestoringSession = false

  @Mutation
  setToken(inputToken: string) {
    this.token = inputToken
  }

  @Mutation
  setSessionWallet(inputWallet: string) {
    this.sessionWallet = inputWallet
  }

  @Mutation
  setIsRestoringSession(inputIsRestoringSession: boolean) {
    this.isRestoringSession = inputIsRestoringSession
  }

  @Action
  async authenticate({inputWallet = '', signature = {}}: {inputWallet?: string, signature?: any}) {
    try {
      const { data } = await axios.post(
        API_POST_AUTHORIZE,
        signature,
      )
      const token = (data as any)?.token
      if (!token) {
        throw new Error('INVALID_SIGNATURE')
      }
      this.context.commit('setToken', token)
      this.context.commit('setSessionWallet', inputWallet)
      saveAuthSession({ wallet: inputWallet, token})
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      throw new Error('AUTHENTICATION_FAILED')
    }
  }

  @Action
  clearSession () {
    this.context.commit('setToken','')
    this.context.commit('setSessionWallet', '')
    clearAuthSession()
  }

  @Action
  async restoreSession () {
    try {
      this.context.commit('setIsRestoringSession', true)
      const session = loadAuthSession()
      if (session) {
        this.context.commit('setToken', session.token)
        this.context.commit('setSessionWallet', session.wallet)
        if (session.wallet) {
          await this.context.dispatch('wallet/restoreSessionIfNecessary', null, { root: true })
        }
      }
    } finally {
      this.context.commit('setIsRestoringSession', false)
    }
  }

  get getToken() {
    return this.token
  }

  get getSessionWallet() {
    return this.sessionWallet
  }

  get getIsRestoringSession() {
    return this.isRestoringSession
  }
}
