/* eslint-disable import/no-extraneous-dependencies */
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'

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
    const mode = ViewMode.Mobile // TODO: Read mode from Local Storage
    this.viewMode = mode
  }

  @Action
  changeViewMode(mode: ViewMode) {
    // TODO: Save mode to Local Storage
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
