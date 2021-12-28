<template>
  <div>
    <img
      :class="[
        'mt-[32px]',
        'w-[300px]',
        'mx-auto',
      ]"
      src="/images/airdrop/title_Claim.png"
    />
    <!-- Dashborad -->
    <div
      :class="[
        'flex',
        'items-start',
        'justify-center',
        'px-[56px]',
        'mt-[32px]',
      ]"
    >
      <div
        :class="[
          'flex',
          'flex-col',
          'justify-between',
          'flex-grow',
        ]"
      >
        <IconDiverMini class="text-airdrop-gold" />
        <div
          :class="[
            'flex',
            'my-[12px]',
            'items-end',
          ]"
        >
          <Label
            :class="['font-extrabold', 'text-black']"
            :text="`${unclaimedAmount}`"
            preset="h1"
          />
          <Label
            :class="[
              'font-bold',
              'text-black',
              ' ml-[8px]',
              'mb-[4px]',
            ]"
            :text="$t('AirDrop.label.$like')"
            preset="h2"
          />
        </div>
        <Label
          :class="['font-bold', 'text-medium-gray']"
          :text="$t('AirDrop.label.amount.umclaimed')"
          preset="p6"
        />
      </div>
      <div
        :class="[
          'flex',
          'flex-col',
          'justify-between',
          'flex-grow',
          'mx-[80px]',
        ]"
      >
        <IconDiverMini class="text-airdrop-gold" />
        <div
          :class="[
            'flex',
            'my-[12px]',
            'items-end',
          ]"
        >
          <Label
            :class="[
              'font-bold',
              'text-black',
            ]"
            :text="`${decay.rate}`"
            preset="h1"
          />
          <Label
            :class="[
              'font-bold',
              'text-black',
              'ml-[8px]',
              'mb-[4px]',
            ]"
            text="%"
            preset="h2"
          />
        </div>
        <Label
          :class="['font-bold', 'text-medium-gray']"
          :text="$t('AirDrop.label.decay')"
          preset="p6"
        />
      </div>
      <div
        :class="[
          'flex',
          'flex-col',
          'items-start',
          'justify-between',
          'flex-grow',
        ]"
      >
        <IconDiverMini class="text-airdrop-gold" />
        <div :class="['flex', 'my-[12px]', 'items-end']">
          <Label :class="['font-bold', 'text-black']" :text="decay.days" preset="h1" />
          <Label
            :class="[
              'font-bold',
              'text-black',
              'mr-[8px]',
              'mb-[4px]',
            ]"
            text="D"
            preset="h2"
          />
          <Label :class="['font-bold', 'text-black']" :text="decay.hours" preset="h1" />
          <Label
            :class="[
              'font-bold',
              'text-black',
              'mr-[8px]',
              'mb-[4px]',
            ]"
            text="H"
            preset="h2"
          />
          <Label
            :class="['font-bold', 'text-black']"
            :text="`${decay.minutes}`"
            preset="h1"
          />
          <Label
            :class="[
              'font-bold',
              'text-black',
              'mb-[4px]',
            ]"
            text="M"
            preset="h2"
          />
        </div>
        <Label
          :class="['font-bold', 'text-medium-gray']"
          :text="$t('AirDrop.label.decay.start')"
          preset="p6"
        />
      </div>
    </div>
    <!-- My progress -->
    <div
      v-if="address"
      :class="[
        'flex',
        'flex-col',
        'items-start',
        'bg-like-cyan-extralight',
        'py-[24px]',
        'px-[56px]',
        'w-full',
        'mt-[56px]',
      ]"
    >
      <Label
        :class="[
          'font-bold',
          'text-like-green',
          'mb-[22px]',
        ]"
        :text="$t('AirDrop.label.myProgress')"
        preset="h2"
      />
      <div
        :class="[
          'flex',
          'items-center',
          'w-full',
        ]"
      >
        <div
          :class="[
            'relative',
            'w-full',
            'flex-grow-1',
            'mr-[32px]',
          ]"
        >
          <div
            :class="[
              'w-[100%]',
              'bg-medium-gray',
              'h-[12px]',
              'rounded-[66px]',
            ]"
          ></div>
          <div
            :class="[
              'absolute',
              'top-0',
              'bg-like-cyan',
              'h-[12px]',
              'rounded-[66px]',
            ]"
            :style="{ width: `${progress + 1}%` }"
          ></div>
          <div
            :class="[
              'absolute',
              'top-0',
              'bg-like-green',
              'h-[12px]',
              'rounded-[66px]',
            ]"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <div
          :class="[
            'px-[24px]',
            'py-[5px]',
            'bg-white',
            'bg-opacity-[60%]',
            'rounded-[16px]',
          ]"
        >
          <Label
            :class="['font-bold', 'text-airdrop-gold']"
            :text="`${progress}%`"
            preset="h2"
          />
        </div>
      </div>
    </div>
    <div
      v-else
      :class="[
        'py-[32px]',
        'px-[56px]',
        'bg-like-cyan-light',
      ]"
    />
    <!-- Missions -->
    <div
      :class="[
        'flex',
        'flex-col',
        'py-[32px]',
        'px-[56px]',
        'w-full',
        'bg-like-green',
      ]"
    >
      <Label
        :class="[
          'font-bold',
          'text-like-cyan-extralight',
          'mb-[16px]',
        ]"
        :text="$t('AirDrop.label.missions')"
        preset="h2"
      />
      <div
        v-for="mission in missions"
        :key="mission.no"
        :class="[
          'flex',
          'items-center',
          'justify-between',
          'py-[28px]',
          'px-[32px]',
          'border-[1px]',
          'border-like-cyan-light',
          'rounded-[24px]',
          'mb-[16px]',
        ]"
      >
        <div
          :class="[
            'text-like-green',
            'text-[48px]',
            'font-bold',
            'text-stroke',
          ]"
        >
          {{ mission.no }}
        </div>
        <Label
          :class="[
            'font-bold',
            'text-white',
            'mx-[24px]',
            'w-[100%]',
          ]"
          :text="mission.description"
          preset="h2"
        />
        <IconMissionButton :class="['w-[56px]', 'h-[56px]']" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'
import { AIRDROP_CLAIM } from '~/constant'

const signerModule = namespace('signer')
const iscnModule = namespace('iscn')

export enum Denom {
  Nanolike = 0.000000001
}

@Component
export default class AirdropMissions extends Vue {
  @Prop(String) readonly address: string | undefined

  @signerModule.Getter('getAddress') currentAddress!: string
  @iscnModule.Action queryISCNByAddress!: (
    arg0: string
  ) => ISCNRecordWithID[] | PromiseLike<ISCNRecordWithID[]>

  unclaimedAmount: number = 0
  missionStatus = []
  decay: any = { rate:'0.0', days:'30', hours:'12', minutes:'30' }

  // eslint-disable-next-line class-methods-use-this
  async mounted() {
    const res:any = await this.$axios.get(
      `${AIRDROP_CLAIM}${this.address}`,
    )
    this.unclaimedAmount = Math.round((res.data.reward.unclaimedAmount) * Denom.Nanolike)
    this.missionStatus = res.data.missionStatus
  }

  get progress() {
    let q = 0
    this.missionStatus.forEach((element: any) => {
      element.completed ? (q += 1) : (q += 0)
    })
    return (q / 5) * 100
  }

  get missions() {
    return [
      {
        no: '#1',
        description: this.$t('AirDrop.mission.keplr'),
        isComplete: true,
      },
      {
        no: '#2',
        description: this.$t('AirDrop.mission.iscn'),
        isComplete: false,
      },
      {
        no: '#3',
        description: this.$t('AirDrop.mission.stake'),
        isComplete: false,
      },
      {
        no: '#4',
        description: this.$t('AirDrop.mission.vote'),
        isComplete: false,
      },
      {
        no: '#5',
        description: this.$t('AirDrop.mission.liquidity'),
        isComplete: false,
      },
    ]
  }
}
</script>
