// eslint-disable-next-line import/no-extraneous-dependencies
import { Plugin } from '@nuxt/types'
import Vue from 'vue'; // eslint-disable-line import/no-extraneous-dependencies
import VueGtag from 'vue-gtag';

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $gtag(message: string): void
  }
  interface Context {
    $gtag(message: string): void
  }
}

declare module 'vuex/types/index' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Store<S> {
    $gtag(message: string): void
  }
}

const gTagPlugin: Plugin = (ctx, inject) => {
  const {
    app: { router },
  } = ctx;
  if (process.env.GA_TRACKING_ID) {
    Vue.use(
      VueGtag,
      {
        config: { id: process.env.GA_TRACKING_ID },
        bootstrap: !(window.doNotTrack || navigator.doNotTrack),
      },
      router,
    );
    ctx.$gtag = Vue.prototype.$gtag;
    inject('gtag', Vue.prototype.$gtag);
  }
};

export default gTagPlugin;
