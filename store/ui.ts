/* eslint-disable import/no-extraneous-dependencies */
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'

const CURRENT_VIEW_MODE = 'CURRENT_VIEW_MODE';

export enum ViewMode {
  Desktop = 'desktop',
  Mobile = 'mobile'
}

@Module({
  name: 'ui',
  stateFactory: true,
  namespaced: true,
})
export default class UIStore extends VuexModule {
  viewMode = ViewMode.Mobile

  get isDesktopViewMode() {
    return this.viewMode === ViewMode.Desktop
  }

  get isMobileViewMode() {
    return this.viewMode === ViewMode.Mobile
  }

  @Mutation
  setViewMode(mode: ViewMode) {
    this.viewMode = mode
  }

  @Action
  init() {
    const mode = window.localStorage?.getItem(CURRENT_VIEW_MODE) || ViewMode.Mobile
    this.context.commit('setViewMode', mode)
  }

  @Action
  changeViewMode(mode: ViewMode) {
    window.localStorage?.setItem(CURRENT_VIEW_MODE, mode)
    this.setViewMode(mode)
  }

  @Action
  enableDesktopViewMode() {
    this.changeViewMode(ViewMode.Desktop)
  }

  @Action
  enableMobileViewMode() {
    this.changeViewMode(ViewMode.Mobile)
  }
}
