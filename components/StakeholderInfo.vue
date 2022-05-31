<template>
  <div>
    <div class="font-normal text-[16px] leading-[22px]">
      <div v-if="address">
        {{ `cosmos${address.slice(11)}` }}
      </div>
      <div v-else-if="walletAddress">
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

@Component
export default class StakeholderInfo extends Vue {
  @Prop(String) readonly id: string | undefined
  @Prop(String) readonly address: string | undefined
  @Prop(String) readonly name: string | undefined
  @Prop(String) readonly url: string | undefined

  get walletAddress() {
    if (this.id && this.id.includes('cosmos'))
      return `cosmos${this.id.slice('did:cosmos:'.length)}`
    if (this.id && this.id.includes('like'))
      return `like${this.id.slice('did:like:'.length)}`
    return ''
  }

  get hrefLink() {
    if (this.id && this.id.includes('http')) return this.id
    return ''
  }
}
</script>
