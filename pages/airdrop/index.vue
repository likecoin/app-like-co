<template>
  <div
    :class="[
      'flex',
      'flex-col',
      'w-full',
      'items-center',
      'justify-center',
      'px-[12px]',
      'md:px-0',
    ]"
  >
    <img
      :class="[
        'hidden',
        'my-[32px]',
        'w-[300px]',
        'lg:block',
      ]"
      src="/images/airdrop/title_Claim.png"
    />
    <Label
      :class="[
        'my-[24px]',
        'font-extrabold',
        'text-like-green',
        'lg:hidden',
        'text-center',
      ]"
      :text="$t('AirDrop.label.checker')"
      preset="h2"
      align="center"
    />
    <AirdropLogin />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

// eslint-disable-next-line import/no-extraneous-dependencies
import { MetaInfo } from 'vue-meta'

const signerModule = namespace('signer')

@Component({
  head() {
    const title = this.$t('page.airdrop.title')
    const description = this.$t('page.airdrop.description')
    return {
      title,
      meta: [
        {
          hid: 'og:title',
          property: 'og:title',
          content: title,
        },
        {
          hid: 'description',
          name: 'description',
          content: description,
        },
        {
          hid: 'og:description',
          property: 'og:description',
          content: description,
        },
      ],
    } as MetaInfo
  },
})
export default class AirdropPage extends Vue {
  @signerModule.Getter('getAddress') walletAddress!: string

  mounted() {
    this.goClaimPage()
  }

  @Watch('walletAddress')
  goClaimPage() {
    if (this.walletAddress) {
      this.$router.push(this.localeLocation({ name: 'airdrop-claim' })!)
    }
  }
}
</script>
