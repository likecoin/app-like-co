<template>
  <Link v-if="href" :href="href" :nofollow="true" @click.native="onClick">
    {{ item }}
  </Link>
  <div v-else>
    {{ item }}
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { ARWEAVE_ENDPOINT, IPFS_VIEW_GATEWAY_URL } from '~/constant'; 
import { LIKE_CO_API_ROOT } from '~/constant/api';

const bookApiModule = namespace('book-api')

export enum ContentFirgerprints {
  arweave = 'ar',
  ipfs = 'ipfs',
  hash = 'hash',
  num = 'num',
}

@Component
export default class ContentFingerprintLink extends Vue {
  @Prop(String) readonly item: string | undefined

  @bookApiModule.Getter('getToken') getToken!: string

  get prefix() {
    return this.item && this.item.substr(0, this.item.indexOf(':'))
  }

  get isArweaveApiLink() {
    return this.item?.startsWith(LIKE_CO_API_ROOT)
  }

  get href() {
    if (!this.item) return null
    switch (this.prefix) {
      case ContentFirgerprints.arweave:
        return `${ARWEAVE_ENDPOINT}/${this.item.slice(5)}`

      case ContentFirgerprints.ipfs:
        return `${IPFS_VIEW_GATEWAY_URL}/${this.item.slice(7)}`

      case ContentFirgerprints.hash:
        return null

      case ContentFirgerprints.num:
        return `/api/numbers-protocol/assets/${this.item.slice(6)}`

      default:
        return this.item
    }
  }

  async onClick(e: Event) {
    if (this.item && this.isArweaveApiLink) {
      e.stopPropagation()
      e.preventDefault()
      let link = this.item
      try {
        const { data } = await this.$axios.get(this.item, {
          headers: {
            Authorization: `Bearer ${this.getToken}`,
          },
        })
        link = data.link
      } catch (error) {
        console.error(error)
      }
      window.open(link, '_blank')
    }
  }
}
</script>
