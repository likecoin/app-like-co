<template>
  <Link v-if="href" :href="href" :nofollow="true">
    {{ item }}
  </Link>
  <div v-else>
    {{ item }}
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { IPFS_VIEW_GATEWAY_URL } from '~/constant'; 

export enum ContentFirgerprints {
  arweave = 'ar',
  ipfs = 'ipfs',
  hash = 'hash',
  num = 'num',
}

@Component
export default class ContentFingerprintLink extends Vue {
  @Prop(String) readonly item: string | undefined

  get prefix() {
    return this.item && this.item.substr(0, this.item.indexOf(':'))
  }

  get href() {
    if (!this.item) return null
    switch (this.prefix) {
      case ContentFirgerprints.arweave:
        return `https://arweave.net/${this.item.slice(5)}`

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
}
</script>
