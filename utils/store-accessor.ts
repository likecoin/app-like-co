/* eslint-disable import/no-mutable-exports */
// eslint-disable-next-line import/no-extraneous-dependencies
import { Store } from 'vuex'
// eslint-disable-next-line import/no-extraneous-dependencies
import { getModule } from 'vuex-module-decorators'

import WalletStore from '~/store/wallet'
import IscnStore from '~/store/iscn'
import UIStore from '~/store/ui'

let walletStore: WalletStore
let iscnStore: IscnStore
let uiStore: UIStore

function initialiseStores(store: Store<any>): void {
  walletStore = getModule(WalletStore, store)
  iscnStore = getModule(IscnStore, store)
  uiStore = getModule(UIStore, store)
}

export {
  initialiseStores,
  walletStore,
  iscnStore,
  uiStore,
}
