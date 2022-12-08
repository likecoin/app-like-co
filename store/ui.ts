/* eslint-disable import/no-extraneous-dependencies */
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'

const CURRENT_VIEW_MODE_KEY = 'CURRENT_VIEW_MODE_KEY';

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
    let mode: any = ''
    mode =
      window.sessionStorage?.getItem(CURRENT_VIEW_MODE_KEY) === ViewMode.Desktop ||
      ViewMode.Mobile
        ? window.sessionStorage?.getItem(CURRENT_VIEW_MODE_KEY)
        : ViewMode.Mobile
    this.setViewMode(mode)
  }

  @Action
  changeViewMode(mode: ViewMode) {
    window.sessionStorage?.setItem(CURRENT_VIEW_MODE_KEY, mode)
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
