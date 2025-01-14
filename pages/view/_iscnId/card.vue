<template>
  <div class="fixed inset-0 flex justify-center items-center">
    <header
      v-if="shouldShowControls"
      class="print:hidden absolute inset-x-0 top-0 flex justify-between p-4 bg-white shadow-sm z-10"
    >
      <Button
        preset="tertiary"
        :text="$t('IscnCardPage.button.back')"
        :to="localeLocation({
          name: 'view-iscnId',
          params: { iscnId },
        })"
      >
        <template #prepend>
          <IconArrowLeft />
        </template>
      </Button>

      <div class="flex gap-2">
        <Button
          preset="tertiary"
          :text="$t(isLandscape ? 'IscnCardPage.button.portrait' : 'IscnCardPage.button.landscape')"
          :to="localeLocation({
            name: 'view-iscnId-card',
            params: { iscnId },
            query: { orientation: isLandscape ? 'portrait' : 'landscape' },
          })"
          @click.native="handleClickOrientationChange"
        />
        <Button
          preset="secondary"
          :text="$t('IscnCardPage.button.print')"
          @click="handleClickPrint"
        />
      </div>
    </header>

    <IscnCard
      :key="orientation"
      :record="record"
      :is-animated="true"
      :orientation="orientation"
      :style="`width: ${width}px`"
    />

  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import { ISCN_PREFIX } from '~/constant'

import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'
import { logTrackerEvent } from '~/utils/logger'

const iscnModule = namespace('iscn')

@Component({
  layout: 'blank',
  components: { IscnCard: () => import('~/components/IscnCard.vue') },
  async asyncData({ params, store, error }) {
    try {
      const { iscnId } = params
      if (iscnId && iscnId.startsWith(ISCN_PREFIX)) {
        const res = await store.dispatch('iscn/fetchISCNById', iscnId)
        if (res) {
          return {
            iscnId: res.records[0].id,
          };
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      error(err as Error)
    }
    return {}
  },
})
export default class ISCNCardPrintPage extends Vue {
  iscnId = ''
  width = 0

  @iscnModule.Getter getISCNById!: (arg0: string) => ISCNRecordWithID

  get isLandscape() {
    return this.$route.query.orientation === 'landscape'
  }

  get shouldShowControls() {
    return this.$route.query.control !== '0'
  }

  get orientation() {
    return this.isLandscape ? 'landscape' : 'portrait'
  }

  get record() {
    return this.getISCNById(this.iscnId)
  }

  mounted() {
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
  }

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  }

  @Watch('isLandscape')
  handleResize() {
    window.requestAnimationFrame(() => {
      this.width = this.isLandscape ? Math.min(window.innerHeight * 2, 560) : Math.min(window.innerHeight / 2, 280);
    })
  }

  handleClickOrientationChange() {
    logTrackerEvent(this, 'ISCNView', `ISCNCardPageSet${this.isLandscape ? 'Landscape' : 'Portrait' }`, this.iscnId, 1)
  }

  handleClickPrint() {
    logTrackerEvent(this, 'ISCNView', 'ISCNCardPagePrint', this.iscnId, 1)
    window.print()
  }
}
</script>
