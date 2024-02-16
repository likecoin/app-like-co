<template>
  <IconCoinLike v-if="type === 'like'" />
  <IconCoinBitcoin v-else-if="type === 'btc'" />
  <IconCoinCosmos v-else-if="type === 'cosmos'" />
  <IconCoinEthereum v-else-if="type === 'eth'" />
  <IconCoinOther v-else />
</template>


<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class IconCoin extends Vue {
  // Type of the coin
  @Prop(String) readonly type!: string | undefined
}
</script>
