/* eslint-disable import/no-mutable-exports */
// eslint-disable-next-line import/no-extraneous-dependencies
import { Store } from 'vuex'
// eslint-disable-next-line import/no-extraneous-dependencies
import { getModule } from 'vuex-module-decorators'

import keplr from '~/store/keplr'
import signer from '~/store/signer'
import iscn from '~/store/iscn'

let keplrStore: keplr
let signerStore: signer
let iscnStore: iscn

function initialiseStores(store: Store<any>): void {
  keplrStore = getModule(keplr, store)
  signerStore = getModule(signer, store)
  iscnStore = getModule(iscn, store)
}

export { initialiseStores, keplrStore, signerStore, iscnStore }
