/* eslint-disable import/no-mutable-exports */
// eslint-disable-next-line import/no-extraneous-dependencies
import { Store } from 'vuex'
// eslint-disable-next-line import/no-extraneous-dependencies
import { getModule } from 'vuex-module-decorators'

import keplr from '~/store/keplr'
import signer from '~/store/signer'

let keplrStore: keplr
let signerStore: signer

function initialiseStores(store: Store<any>): void {
  keplrStore = getModule(keplr, store)
  signerStore = getModule(signer, store)
}

export { initialiseStores, keplrStore, signerStore }
