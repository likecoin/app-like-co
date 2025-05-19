import path from 'path';
import { getSitemapRoutes } from './config/sitemap';
import { SITE_URL } from './constant';

const siteDefaultDescription =
  'Mint Writing NFT for your content. Turn your stories into collectibles.'

const {
  IS_TESTNET,
  CI,
  GA_TRACKING_ID,
  SENTRY_DSN,
  RELEASE,
} = process.env;

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'LikeCoin Creator Portal - LikeCoin',
    meta: [
      { charset: 'utf-8' },
      { hid: 'viewport', name: 'viewport', content: 'width=device-width' },
      { hid: 'description', name: 'description', content: siteDefaultDescription },
      { hid: 'theme-color', name: 'theme-color', content: '#28646e' },
      { hid: 'og:site_name', property: 'og:site_name', content: 'LikeCoin Creator Portal - LikeCoin'},
      { hid: 'og:title', property: 'og:title', content: 'LikeCoin Creator Portal - LikeCoin' },
      { hid: 'og:image', property: 'og:image', content: 'https://app.like.co/images/og/default.png' },
      { hid: 'og:description', property: 'og:description', content: siteDefaultDescription },
      { hid: 'og:image_alt', property: 'og:image:alt', content: '#DePub' },
      { hid: 'og:image_width', property: 'og:image:width', content: '1200' },
      { hid: 'og:image_height', property: 'og:image:height', content: '630' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [
      { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com' },
      { rel: 'preload', href: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&family=PT+Mono&display=swap', as: 'style' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&family=PT+Mono&display=swap' },
    ],
    script: [{
      hid: 'schema',
      innerHTML: JSON.stringify([
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'LikeCoin Creator Portal',
          url: 'https://app.like.co/',
        },
        {
          '@context': 'http://www.schema.org',
          '@type': 'Project',
          name: 'LikeCoin',
          url: 'https://like.co',
          logo: 'https://like.co/logo.png',
        },
      ]),
      type: 'application/ld+json',
    }],
    __dangerouslyDisableSanitizersByTagID: { schema: ['innerHTML'] },
  },

  env: {
    IS_TESTNET,
    CI,
    GA_TRACKING_ID,
    SENTRY_DSN,
  },
  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '@likecoin/wallet-connector/dist/style.css',
    '~/assets/css/global.css',
  ],

  render: {
    csp: {
      enabled: true,
      unsafeInlineCompatibility: true,
      hashAlgorithm: 'sha256',
      policies: {
        'default-src': [
          "'self'",
          'data:',
          'blob:',
          '*',
        ],
        'script-src': [
          "'self'",
          "'unsafe-inline'", // ignored by browser with sha support
          "'wasm-unsafe-eval'",
          "www.googletagmanager.com",
          "https://unpkg.com/@google/model-viewer@3.0.2/",
        ],
        'connect-src': [
          "'self'",
          'blob:',
          'data:',
          '*',
        ],
        'frame-src': [
          'verify.walletconnect.com',
          'authcore.like.co',
          'likecoin-integration-test.authcore.io',
        ],
        'style-src': [
          "'self'",
          "'unsafe-inline'",
          'fonts.googleapis.com',
        ],
        'worker-src': [
          "'self'",
          'blob:',
        ],
        'child-src': [
          "'self'",
          'blob:',
        ],
      },
    },
  },
  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [{ src: '~/plugins/gtag.client.ts', mode: 'client' }],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/stylelint
    '@nuxtjs/stylelint-module',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',

    'nuxt-helmet',

    // https://i18n.nuxtjs.org
    '@nuxtjs/i18n',

    // https://sentry.nuxtjs.org
    '@nuxtjs/sentry',

    '@nuxtjs/sitemap',

    // https://portal-vue.linusb.org/guide/installation.html#nuxt-module
    'portal-vue/nuxt',
  ],

  helmet: {
    referrerPolicy: { policy: 'strict-origin' },
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    browserBaseURL: '/api',
    retry: { retries: 1 },
  },

  i18n: {
    locales: [{
        code: 'en',
        file: 'en.json',
      }],
    defaultLocale: 'en',
    langDir: '~/locales/',
    vuex: false,
  },

  sentry: {
    config: {
      release: RELEASE,
    },
    tracing: {
      // TODO: remove health check http calls from tracing
      tracesSampleRate: IS_TESTNET ? 0.01 : 0.01,
      browserTracing: {},
      vueOptions: {
        trackComponents: true,
      },
      vueRouterInstrumentationOptions: {
        routeLabel: 'name',
      },
    },
    publishRelease: !!RELEASE,
    clientIntegrations: {
      /* default integrations will still be added due to deep-merge */
      ReportingObserver: false, // reporting is very noisy on CSP violation.
      Replay: {},
    },
    clientConfig: {
      ignoreErrors: [
        'WebAssembly.instantiate',
        '["@context"].toLowerCase',
      ],
      replaysSessionSampleRate: 0.0,
      replaysOnErrorSampleRate: 1.0,
    },
  },
  sitemap: {
    hostname: SITE_URL,
    routes: getSitemapRoutes,
  },

  serverMiddleware: [{ path: '/api', handler: '~/server/index.ts' }],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [
      'cosmjs-type',
      '@cosmjs',
      '@likecoin/iscn-js',
      '@likecoin/wallet-connector',
      '@walletconnect',
      '@noble/curves',
      '@irys',
      '@aptos-labs',
      '@supercharge',
      'arbundle',
      ({ isLegacy }) => (isLegacy ? 'axios' : undefined),
    ],
    extend(config, ctx) {
      /* eslint-disable no-param-reassign */
      if (!ctx.isDev) {
        config.resolve.alias['bn.js'] = path.join(__dirname, './node_modules/bn.js');
      }
      if (ctx.isClient) {
        config.resolve.alias['arbundles/web'] = path.join(__dirname, './node_modules/arbundles/build/web/esm/webIndex');
        config.resolve.alias['@irys/arweave'] = path.join(__dirname, './node_modules/@irys/arweave/build/esm');
      } else {
        config.externals = {
          '@irys/sdk': '@irys/sdk',
        }
      }

      config.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      });
      /* eslint-enable no-param-reassign */
    },
  },
  server: {
    host: process.env.NODE_ENV === 'production' ? '0' : 'localhost',
  },
}
