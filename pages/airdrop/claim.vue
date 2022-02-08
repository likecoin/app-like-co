<template>
  <Page
    :class="[
      'flex',
      'flex-col',
      'w-full',
      'items-center',
      'justify-center',
      'px-[12px]',
      'md:px-0',
    ]"
  >
    <img
      :class="[
        'mt-[32px]',
        'w-[300px]',
        'mx-auto',
      ]"
      src="/images/airdrop/title_Claim.png"
    />
    <AirdropDashboard
      :total-airdrop="totalAirdrop"
      :total-claimed-amount="totalClaimedAmount"
      :decay="decay"
    />
    <AirdropProgress
      :error-message="errorMessage"
      :progress="progress"
      @handleConnectWallet="handleConnectWalletButtonClick"
    />
    <AirdropMission
      :error-message="errorMessage"
      :missions-overview="missionsOverview"
      @handleMissionOpen="handleMissionOpen"
    />
    <AirdropMissionDialog
      :is-open="isOpenMissionDialog"
      :step="step"
      :mission="currentMission"
      :claim-status="claimStatus"
      :loading-status="loadingStatus"
      :error-message="errorMessage"
      :txhash="txhash"
      @done="handleMissionDone"
      @close="handleMissionClose"
      @step="changeStep"
    />
  </Page>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import BigNumber from 'bignumber.js'
import {
  AIRDROP_CLAIM,
  AIRDROP_MISSION,
  TESTNET_TX_BASE_URL,
  AIRDROP_DECAY,
} from '~/constant'

const signerModule = namespace('signer')
const walletModule = namespace('wallet')

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

  step = 1
  errorMessage: string = ''
  loadingStatus: string = ''

  deadline = ''
  decay: any = { factor: 0, days: '0', hours: '0', minutes: '0' }
  intervalID: any

  unclaimedAmount = new BigNumber(0)
  totalAirdrop = new BigNumber(0)
  totalClaimedAmount = new BigNumber(0)
  claimData: any = []
  missionsOverview = [
    {
      name: this.$t('AirDrop.mission.name.keplr'),
      isCompleted: false,
      isClaimed: false,
      txHash: '',
      claimedAmount: new BigNumber(0),
    },
    {
      name: this.$t('AirDrop.mission.name.iscn'),
      isCompleted: false,
      isClaimed: false,
      txHash: '',
      claimedAmount: new BigNumber(0),
    },
    {
      name: this.$t('AirDrop.mission.name.stake'),
      isCompleted: false,
      isClaimed: false,
      txHash: '',
      claimedAmount: new BigNumber(0),
    },
    {
      name: this.$t('AirDrop.mission.name.vote'),
      isCompleted: false,
      isClaimed: false,
      txHash: '',
      claimedAmount: new BigNumber(0),
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
    // eslint-disable-next-line no-nested-ternary
    return this.currentMission.isClaimed
      ? 'claimed'
      : this.errorMessage
      ? 'withoutWallet'
      : 'unclaimed'
  }

  get txhash() {
    return `${TESTNET_TX_BASE_URL}${this.currentMission.txHash}`
  }

  mounted() {
    this.fetchMissionDecay()

    if (this.currentAddress) {
      this.fetchMissionStauts()
    } else {
      this.errorMessage = this.$t('AirDrop.errorMessage.noAddress') as string
    }
  }

  @Watch('currentAddress')
  async fetchMissionStauts() {
    if (this.currentAddress) {
      try {
        const res: any = await this.$axios
          .get(`${AIRDROP_CLAIM}${this.currentAddress}`)

        this.totalAirdrop = new BigNumber(
          res.data.reward.unclaimedAmount + res.data.reward.claimedAmount,
        ).shiftedBy(-9).integerValue() 
        this.totalClaimedAmount = new BigNumber(
          res.data.reward.claimedAmount,
        ).shiftedBy(-9).integerValue() 

        this.errorMessage = ''
        this.claimData = res.data.missionStatus
        this.missionsOverview.forEach((mission: any, i) => {
          this.claimData.forEach((element: any) => {
            if (mission.name === element.mission) {
              this.missionsOverview[i].isCompleted = element.completed
              this.missionsOverview[i].isClaimed = element.claimed
              this.missionsOverview[i].txHash = element.txHash
            }
          })
        })
      } catch (error) {
        console.error(error)
        this.errorMessage = this.$t(
          'AirDrop.errorMessage.noAddress',
        ) as string
        this.initClaimStatus()
      }
    } else {
      this.$router.push(this.localeLocation({ name: 'airdrop' })!)
    }
  }

  changeStep(step: number) {
    this.step = step
  }

  getTimeRemaining() {
    const startDate: any = new Date().getTime()
    const endDate: any = new Date(this.deadline)
    const spantime = endDate - startDate

    this.decay.minutes = Math.floor((spantime / 1000 / 60) % 60).toString()
    this.decay.hours = Math.floor((spantime / (1000 * 60 * 60)) % 24).toString()
    this.decay.days = Math.floor(spantime / (1000 * 60 * 60 * 24)).toString()

    if (spantime <= 0) {
      clearInterval(this.intervalID)
    }
  }

  async fetchMissionDecay() {
    const data = await this.$axios.get(AIRDROP_DECAY).then((item) => item.data)
    this.deadline = data.startingDate
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
    if (!this.errorMessage) {
      this.fetchMissionStauts()
    }
    this.isOpenMissionDialog = false
    this.step = 1
  }
  
  initClaimStatus() {
    this.unclaimedAmount = new BigNumber(0)
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
    this.loadingStatus = 'Loading'
    try {
      const res: any = await this.$axios
        .post(
          `${AIRDROP_MISSION}${this.currentMission.name}?address=${this.currentAddress}`,
        )
      this.currentMission.claimedAmount = new BigNumber(res.data.claimedAmount)
        .shiftedBy(-9)
        .integerValue()
      this.currentMission.isCompleted = true
      this.currentMission.txHash = res.data.txHash
    } catch (error) {
      console.error(error)
    } finally {
      this.step = 3
      this.loadingStatus = ''
    }
  }
}
</script>
