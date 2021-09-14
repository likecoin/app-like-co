<template>
  <div v-if="record">
    <ClientOnly>
      <IscnCard v-bind="cardProps" />
    </ClientOnly>
    <pre
      v-if="isShowAdjustableProps"
      class="p-[16px] text-[10px] font-mono"
    >{{ JSON.stringify(adjustableProps, null, ' ') }}</pre>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import { isCosmosTransactionHash } from '~/utils/cosmos'
import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'
import { ISCN_PREFIX } from '~/constant'

const iscnModule = namespace('iscn')

@Component({ layout: 'blank' })
export default class CardIscnIdPage extends Vue {
  iscnId = ''

  @iscnModule.Getter getISCNById!: (arg0: string) => ISCNRecordWithID

  @iscnModule.Action fetchISCNById!: (arg0: string) => Promise<{
    records: ISCNRecordWithID[]
    owner: string
    latestVersion: Long.Long
  } | null>

  @iscnModule.Action fetchISCNByTx!: (
    arg0: string
  ) => Promise<{ records: ISCNRecordWithID[] }>

  get record() {
    return this.getISCNById(this.iscnId)
  }

  get isShowAdjustableProps() {
    const { dev = '0' } = this.$route.query
    return dev === '1'
  }

  get adjustableProps() {
    const {
      orientation = 'portrait',
      isAnimated = '1',
      animationDuration = '500',
      shapeMorphingMagnitude = '4',
      colorMultiplier = '10',
    } = this.$route.query
    return {
      orientation,
      isAnimated: isAnimated === '1',
      animationDuration: parseInt(animationDuration as string, 10),
      shapeMorphingMagnitude: parseInt(shapeMorphingMagnitude as string, 10),
      colorMultiplier: parseInt(colorMultiplier as string, 10),
    }
  }

  get cardProps() {
    const { orientation } = this.adjustableProps
    return {
      record: this.record,
      class: orientation === 'portrait' ? 'w-[280px]' : 'w-[560px]',
      ...this.adjustableProps,
    }
  }

  created() {
    const { iscnId } = this.$route.params
    if (iscnId.startsWith(ISCN_PREFIX)) {
      this.iscnId = iscnId
    }
  }

  async mounted() {
    if (!this.iscnId) {
      const param = this.$route.params.iscnId
      if (!isCosmosTransactionHash(param)) {
        this.$nuxt.error({ statusCode: 400 })
        return
      }
      const res = await this.fetchISCNByTx(param)
      if (!res) {
        this.$nuxt.error({ statusCode: 400 })
        return
      }
      this.iscnId = res.records[0].id
      this.$router.replace({ params: { iscnId: this.iscnId } })
    }
    if (!this.getISCNById(this.iscnId)) {
      await this.fetchISCNById(this.iscnId)
    }
    if (!this.getISCNById(this.iscnId)) {
      this.$nuxt.error({ statusCode: 404 })
    }
  }
}
</script>
