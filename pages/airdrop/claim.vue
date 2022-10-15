<template>
  <Page
    :class="[
      'flex',
      'flex-col',
      'w-full',
      'items-center',
      'justify-center',
      'md:px-0',
    ]"
  >
    <img
      :class="[
        'mt-[32px]',
        'w-[300px]',
        'mx-auto',
      ]"
      src="~assets/images/title_Claim.png"
    />
    <ClientOnly>
      <AirdropDashboard
        :total-airdrop="totalAirdrop"
        :total-claimed-amount="totalClaimedAmount"
        :decay="decay"
        :countdown-date="countdownDate"
      />
      <AirdropProgress
        :error-message="errorMessage"
      />
      <AirdropMission
        :missions-overview="missionsOverview"
        @handleMissionOpen="handleMissionOpen"
      />
      <AirdropMissionDialog
        :is-open="isOpenMissionDialog"
        :step="step"
        :mission="currentMission"
        @close="handleMissionClose"
        @step="changeStep"
      />
    </ClientOnly>
  </Page>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class AirdropClaimPage extends Vue {
  isOpenMissionDialog = false
  currentMission: any = {}

  step = 1
  errorMessage = this.$t('AirDrop.errorMessage.end')
  shouldCloseAirdrop: boolean = true

  countdownDate = { days: '0', hours: '0', minutes: '0' }
  decay: any = { factor: 1, started: true }

  totalAirdrop = '-'
  totalClaimedAmount = '-'
  missionsOverview = [
    {
      name: this.$t('AirDrop.mission.name.keplr'),
    },
    {
      name: this.$t('AirDrop.mission.name.iscn'),
    },
    {
      name: this.$t('AirDrop.mission.name.stake'),
    },
    {
      name: this.$t('AirDrop.mission.name.vote'),
    },
  ]

  changeStep(step: number) {
    this.step = step
  }

  handleMissionOpen(name: string) {
    this.isOpenMissionDialog = true
    const newArr = this.missionsOverview.filter((arr) => arr.name === name)
    // eslint-disable-next-line prefer-destructuring
    this.currentMission = newArr[0]
  }

  handleMissionClose() {
    this.isOpenMissionDialog = false
    this.step = 1
  }
}
</script>
