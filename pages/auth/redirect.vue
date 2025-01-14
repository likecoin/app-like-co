<template>
  <main class="redirect-page">
    <div class="flex flex-col items-center my-48">
      <h1 class="text-24">{{ $t('RedirectPage.title') }}</h1>
      <ProgressIndicator preset="thin" />
    </div>
  </main>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import logTrackerEvent, { setLoggerUser } from '~/utils/logger'
import { SIGN_AUTHORIZATION_PERMISSIONS } from '~/constant'

const walletModule = namespace('wallet')
const bookApiModule = namespace('book-api')

@Component
export default class RedirectPage extends Vue {
  @walletModule.Action('initWallet') initWallet!: (params: { method: any; accounts: any; offlineSigner?: any }) => Promise<any>
  @walletModule.Action('disconnectWallet') disconnectWallet!: () => void
  @walletModule.Action('handleConnectorRedirect') handleConnectorRedirect!: (params: { method: string; params: any }) => Promise<any>
  @walletModule.Action('signMessageMemo') signMessageMemo!: (params: { action: string; permissions: string[] }) => Promise<any>
  @walletModule.Getter('getSigner') signer!: any
  @walletModule.Getter('getWalletAddress') currentAddress!: string

  @bookApiModule.Action('authenticate') authenticate!: ({ inputWallet, signature }: { inputWallet?: string, signature?: any }) => Promise<any>
  @bookApiModule.Action('clearSession') clearSession!: () => void

  async mounted() {
    const { error, method, code } = this.$route.query;
    if (method && code) {
      try {
        const connection = await this.handleConnectorRedirect({
          method: method as string,
          params: { code },
        });
        if (connection) {
          const { accounts } = connection
          logTrackerEvent(
            this,
            'user',
            `connected_wallet_${method}`,
            'connected_wallet',
            1,
          )
          setLoggerUser(this, {
            wallet: accounts[0].address,
            method: method as string,
          })
          await this.initWallet(connection)
          if (!this.currentAddress || !this.signer) {
            throw new Error('FAILED_TO_CONNECT_WALLET')
          }
          const signature = await this.signMessageMemo({
            action: 'authorize',
            permissions: SIGN_AUTHORIZATION_PERMISSIONS,
          });
          if (!signature) {
            throw new Error('SIGNING_REJECTED')
          }
          await this.authenticate({ inputWallet: this.currentAddress, signature })
        }
        let postAuthRoute = '/';
        if (window.sessionStorage) {
          const storedRoute = window.sessionStorage.getItem(
            'USER_POST_AUTH_ROUTE',
          );
          if (storedRoute) {
            postAuthRoute = storedRoute;
            window.sessionStorage.removeItem('USER_POST_AUTH_ROUTE');
          }
        }
        this.$router.replace(postAuthRoute);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        this.$nuxt.error({
          statusCode: 400,
          message: (err as Error).toString(),
        });
        this.disconnectWallet()
        this.clearSession()
      }
    } else {
      if (window.sessionStorage) {
        window.sessionStorage.removeItem('USER_POST_AUTH_ROUTE');
      }
      this.$nuxt.error({
        statusCode: 400,
        message: error as string,
      });
    }
  }
};
</script>
