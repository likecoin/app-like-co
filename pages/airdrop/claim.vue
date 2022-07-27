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
        :has-connected-wallet="!!currentAddress"
        :error-message="errorMessage"
        :progress="progress"
        :should-close-airdrop="shouldCloseAirdrop"
        :is-finished-loading="isFinishedLoading"
        @handleConnectWallet="handleConnectWalletButtonClick"
      />
      <AirdropMission
        :has-connected-wallet="!!currentAddress"
        :error-message="errorMessage"
        :missions-overview="missionsOverview"
        @handleMissionOpen="handleMissionOpen"
      />
      <AirdropMissionDialog
        :is-open="isOpenMissionDialog"
        :step="step"
        :has-connected-wallet="!!currentAddress"
        :mission="currentMission"
        :claim-status="claimStatus"
        :loading-status="missionLoadingStatus"
        :error-message="errorMessage"
        :tx-url="txURL"
        @done="handleMissionDone"
        @close="handleMissionClose"
        @step="changeStep"
      />
    </ClientOnly>
  </Page>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import BigNumber from 'bignumber.js'
import {
  AIRDROP_CLAIM_ENDPOINT,
  AIRDROP_MISSION_ENDPOINT,
  BIG_DIPPER_TX_BASE_URL,
  AIRDROP_DECAY_ENDPOINT,
  IS_CHAIN_UPGRADING,
} from '~/constant'

const signerModule = namespace('signer')
const walletModule = namespace('wallet')

export enum ClaimStatus {
  claimed = 'claimed',
  unclaimed = 'unclaimed',
  unable = 'unable',
  unableAll = 'unableAll',
  withoutWallet = 'withoutWallet',
}

@Component
export default class AirdropClaimPage extends Vue {
  @walletModule.Action('toggleConnectDialog') toggleConnectWalletDialog!: (
    isShow: boolean
  ) => void

  @walletModule.Action('reset') resetWallet!: () => void
  @signerModule.Action('reset') resetSigner!: () => void
  @signerModule.Getter('getAddress') currentAddress!: string

  isOpenMissionDialog = false
  currentMission: any = {}
  isFinishedLoading: boolean = false

  step = 1
  errorMessage: string = ''
  missionLoadingStatus: string = ''
  shouldCloseAirdrop: boolean = false

  deadline = ''
  endDate = ''
  countdownDate = { days: '0', hours: '0', minutes: '0' }
  decay: any = { factor: 0, started: false }
  intervalID: any

  totalAirdrop = '-'
  totalClaimedAmount = '-'
  claimData: any = []
  missionsOverview = [
    {
      name: this.$t('AirDrop.mission.name.keplr'),
      isCompleted: false,
      isClaimed: false,
      isEnabled: true,
      txHash: '',
      claimedAmount: '0',
    },
    {
      name: this.$t('AirDrop.mission.name.iscn'),
      isCompleted: false,
      isClaimed: false,
      isEnabled: true,
      txHash: '',
      claimedAmount: '0',
    },
    {
      name: this.$t('AirDrop.mission.name.stake'),
      isCompleted: false,
      isClaimed: false,
      isEnabled: true,
      txHash: '',
      claimedAmount: '0',
    },
    {
      name: this.$t('AirDrop.mission.name.vote'),
      isCompleted: false,
      isClaimed: false,
      isEnabled: true,
      txHash: '',
      claimedAmount: '0',
    },
  ]

  get progress() {
    let q = 0
    this.claimData.forEach((element: any) => {
      element.claimed ? (q += 1) : (q += 0)
    })
    return (q / 4) * 100
  }

  get claimStatus() {
    if (this.shouldCloseAirdrop) return ClaimStatus.unableAll
    if (this.currentMission.isClaimed) return ClaimStatus.claimed
    if (!this.currentMission.isEnabled) return ClaimStatus.unable
    if (!this.currentAddress || this.errorMessage) return ClaimStatus.withoutWallet
    return ClaimStatus.unclaimed
  }

  get txURL() {
    return `${BIG_DIPPER_TX_BASE_URL}${this.currentMission.txHash}`
  }

  mounted() {
    this.fetchMissionDecay()

    if (this.currentAddress) {
      this.fetchMissionStatus()
    }
  }

  @Watch('currentAddress')
  async fetchMissionStatus() {
    this.isFinishedLoading = false
    if (this.currentAddress) {
      const res: any = await this.$axios
        .get(`${AIRDROP_CLAIM_ENDPOINT}${this.currentAddress}`)
        .catch((err) => {
          console.error(err)
          if (err.response.status === 403) {
            this.errorMessage = this.$t(
              'AirDrop.errorMessage.ineligible',
            ) as string
          } else {
            this.closeAirdrop()
          }
          this.initClaimStatus()
          this.totalAirdrop = '0'
          this.totalClaimedAmount = '0'
        })

      if (res) {
        this.claimData = res.data.missionStatus
        if (this.checkIfAirdropAvailable(this.claimData)) {
          this.totalAirdrop = new BigNumber(
            res.data.reward.unclaimedAmount + res.data.reward.claimedAmount,
          )
            .shiftedBy(-9)
            .toFixed(0, BigNumber.ROUND_DOWN)
          this.totalClaimedAmount = new BigNumber(res.data.reward.claimedAmount)
            .shiftedBy(-9)
            .toFixed(0, BigNumber.ROUND_DOWN)

          this.errorMessage = ''
          this.missionsOverview.forEach((mission: any, i) => {
            this.claimData.forEach((element: any) => {
              if (mission.name === element.mission) {
                this.missionsOverview[i].isCompleted = element.completed
                this.missionsOverview[i].isClaimed = element.claimed
                this.missionsOverview[i].isEnabled = element.enabled
                this.missionsOverview[i].txHash = element.txHash
              }
            })
          })
        } else {
          this.closeAirdrop()
        }
      }
    } else {
      this.$router.push(this.localeLocation({ name: 'airdrop' })!)
    }
    this.isFinishedLoading = true
  }

  // eslint-disable-next-line class-methods-use-this
  checkIfAirdropAvailable(claimData:any) {
    // Must have at least one enabled mission.
    return claimData.some((element: any) => element.enabled)
  }

  closeAirdrop() {
    this.errorMessage = this.$t('AirDrop.errorMessage.technicalError') as string
    this.shouldCloseAirdrop = true
  }

  changeStep(step: number) {
    this.step = step
  }

  getTimeRemaining() {
    const startDate: any = new Date().getTime()
    const decayDate: any = new Date(this.deadline)
    const endDate: any = new Date(this.endDate)

    this.decay.started = startDate > decayDate;
    const spantime = this.decay.started ? endDate - startDate : decayDate - startDate
    this.countdownDate.minutes = Math.floor((spantime / 1000 / 60) % 60).toString()
    this.countdownDate.hours = Math.floor((spantime / (1000 * 60 * 60)) % 24).toString()
    this.countdownDate.days = Math.floor(spantime / (1000 * 60 * 60 * 24)).toString()

    if (spantime <= 0) {
      clearInterval(this.intervalID)
    }
  }

  async fetchMissionDecay() {
    const data = await this.$axios.get(AIRDROP_DECAY_ENDPOINT).then((item) => item.data)
    this.deadline = data.startingDate
    this.endDate = data.endingDate
    this.decay.factor = data.factor

    this.getTimeRemaining()
    if (!this.intervalID)
      this.intervalID = setInterval(this.getTimeRemaining, 60000)
  }

  handleMissionOpen(name: string) {
    this.isOpenMissionDialog = true
    const newArr = this.missionsOverview.filter((arr) => arr.name === name)
    // eslint-disable-next-line prefer-destructuring
    this.currentMission = newArr[0]
  }

  handleMissionClose() {
    if (!this.errorMessage && this.step === 3) {
      this.fetchMissionStatus()
    }
    this.isOpenMissionDialog = false
    this.step = 1
  }

  initClaimStatus() {
    this.claimData = []
    this.step = 1
    this.missionsOverview.forEach((mission) => {
      // eslint-disable-next-line no-param-reassign
      mission.isCompleted = false
      // eslint-disable-next-line no-param-reassign
      mission.isClaimed = false
    })
  }

  handleConnectWalletButtonClick() {
    if (this.currentAddress) {
      this.resetWallet()
      this.resetSigner()
    }
    this.toggleConnectWalletDialog(true)
  }

  async handleMissionDone() {
    if (IS_CHAIN_UPGRADING) return;
    this.missionLoadingStatus = 'Loading'
    const res: any = await this.$axios
      .post(
        `${AIRDROP_MISSION_ENDPOINT}${this.currentMission.name}?address=${this.currentAddress}`,
      )
      .catch((err) => {
        console.error(err)
        if (err.response.status !== 400 && err.response.status !== 401 && err.response.status !== 403) {
          this.currentMission.isEnabled = false
        }
      })

    if (res) {
      this.currentMission.claimedAmount = new BigNumber(res.data.claimedAmount)
        .shiftedBy(-9)
        .toFixed(0, BigNumber.ROUND_DOWN)
      this.currentMission.isCompleted = true
      this.currentMission.txHash = res.data.txHash
    }

    this.step = 3
    this.missionLoadingStatus = ''
  }
}
</script>
