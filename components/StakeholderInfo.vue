<template>
  <div>
    <div class="font-normal text-[16px] leading-[22px]">
      <div v-if="walletAddress">
        {{ walletAddress }}
      </div>
    </div>
    <div class="font-semibold">
      <Link v-if="url" :href="url">
        {{ name }}
      </Link>
      <Link v-else-if="hrefLink" :href="hrefLink">
        {{ name }}
      </Link>
      <div v-else>
        {{ name }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { getLikeWalletAddress } from '@likecoin/iscn-js/dist/iscn/addressParsing'

@Component
export default class StakeholderInfo extends Vue {
  @Prop(String) readonly id: string | undefined
  @Prop(String) readonly name: string | undefined
  @Prop(String) readonly url: string | undefined

  get walletAddress() {
    if (this.id) {
      return getLikeWalletAddress(this.id)
    }
    return ''
  }

  get hrefLink() {
    if (this.id && this.id.includes('http')) return this.id
    return ''
  }
}
</script>
