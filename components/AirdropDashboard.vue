<template>
  <div
    :class="[
      'flex',

      'flex-col',
      'lg:flex-row',

      'justify-center',

      'items-center',
      'lg:items-start',

      'px-[56px]',
      'mt-[32px]',
    ]"
  >
    <div
      :class="[
        'flex',
        'flex-col',

        'justify-center',
        'lg:justify-between',

        'items-center',
        'lg:items-start',

        'flex-grow',

        'mb-[24px]',
        'lg:mb-0',
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
            'font-extrabold',
            'text-airdrop-gold',
          ]"
          :text="airdropAmount"
          preset="h1"
        />
        <Label
          :class="[
            'font-bold',
            'text-airdrop-gold',
            ' ml-[8px]',
            'mb-[4px]',
          ]"
          :text="$t('AirDrop.label.like')"
          preset="h2"
        />
      </div>
      <Label
        :class="[
          'font-bold',
          'text-medium-gray',
        ]"
        :text="$t('AirDrop.label.amount.claimed')"
        preset="p6"
      />
    </div>
    <div
      :class="[
        'flex',
        'flex-col',
        'flex-grow',

        'justify-center',
        'lg:justify-between',

        'items-center',
        'lg:items-start',

        'mx-[80px]',
        'mb-[24px]',
        'lg:mb-0',
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
          :text="`${decay.factor.toFixed(4) * 100}`"
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
        :class="[
          'font-bold',
          'text-medium-gray',
        ]"
        :text="$t('AirDrop.label.decay')"
        preset="p6"
      />
    </div>
    <div
      :class="[
        'flex',
        'flex-col',
        'flex-grow',

        'justify-center',
        'lg:justify-between',

        'items-center',
        'lg:items-start',

        'mb-[24px]',
        'lg:mb-0',
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
          :text="countdownDate.days"
          preset="h1"
        />
        <Label
          :class="[
            'font-bold',
            'text-black',
            'mr-[8px]',
            'mb-[4px]',
          ]"
          :text="$t('AirDrop.mission.decay.days')"
          preset="h2"
        />
        <Label
          :class="[
            'font-bold',
            'text-black',
          ]"
          :text="countdownDate.hours"
          preset="h1"
        />
        <Label
          :class="[
            'font-bold',
            'text-black',
            'mr-[8px]',
            'mb-[4px]',
          ]"
          :text="$t('AirDrop.mission.decay.hours')"
          preset="h2"
        />
        <Label
          :class="[
            'font-bold',
            'text-black',
          ]"
          :text="`${countdownDate.minutes}`"
          preset="h1"
        />
        <Label
          :class="[
            'font-bold',
            'text-black',
            'mb-[4px]',
          ]"
          :text="$t('AirDrop.mission.decay.minutes')"
          preset="h2"
        />
      </div>
      <Label
        :class="[
          'font-bold',
          'text-medium-gray',
        ]"
        :text="$t('AirDrop.label.end')"
        preset="p6"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class AirdropDashboard extends Vue {

  // The total claimable amount of airdrop
  @Prop(String) readonly totalAirdrop!: string | undefined

  // The total claimed amount of airdrop
  @Prop(String) readonly totalClaimedAmount!: string | undefined

  // Contains the time information about decay
  @Prop(Object) readonly decay!: object | undefined

  // Contains the time information about end
  @Prop(Object) readonly countdownDate!: object | undefined

  get airdropAmount() {
    return `${this.totalClaimedAmount}/${this.totalAirdrop}`
  }
}
</script>
