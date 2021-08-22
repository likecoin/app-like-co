<template>
  <div>
    <div class="font-normal text-[16px] leading-[22px]">
      <div v-if="address">
        {{ `cosmos${address.slice(11)}` }}
      </div>
      <div v-else-if="isAddress">
        {{ isAddress }}
      </div>
    </div>
    <div class="font-semibold">
      <Link v-if="url" :href="url">
        {{ name }}
      </Link>
      <Link v-else-if="isLink" :href="isLink">
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

  get isAddress() {
    if (this.id && this.id.includes('cosmos'))
      return `cosmos${this.id.slice(11)}`
    return false
  }

  get isLink() {
    if (this.id && this.id.includes('http'))
      return this.id
    return false
  }
}
</script>
