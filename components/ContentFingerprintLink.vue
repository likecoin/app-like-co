<template>
  <Link :href="href">
    {{ item }}
  </Link>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

export enum ContentFirgerprints {
  arweave = 'ar',
  ipfs = 'ipfs',
}

@Component
export default class ContentFingerprintLink extends Vue {
  @Prop(String) readonly item: string | undefined

  get prefix() {
    return this.item && this.item.substr(0, this.item.indexOf(':'))
  }

  get href() {
    if (this.item) {
      switch (this.prefix) {
        case ContentFirgerprints.arweave:
          return this.item

        case ContentFirgerprints.ipfs:
          return `https://cloudflare-ipfs.com/ipfs/${this.item.slice(7)}`

        default:
          return this.item
      }
    }
    return null
  }
}
</script>
