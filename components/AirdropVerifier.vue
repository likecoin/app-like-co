<template>
  <div
    :class="[
      'flex',
      'flex-col',
      'w-full',
      'items-center',
      'justify-center',
    ]"
  >
    <Label
      :class="[
        'mt-[8px]',
        'w-full',
        'max-w-[600px]',
        'text-center',
        'break-all',
        'text-medium-gray',
      ]"
      :text="address"
      preset="p5"
      align="center"
    /> 
    <div
      :class="[
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'mb-[28px]',
        'sm:flex-col-reverse',
        'sm:mb-0',
      ]"
    >
    <!-- Amount -->
      <div
        :class="[
          'flex',
          'flex-col',
          'justify-center',
          'items-center',
          'sm:flex-row',
        ]"
      >
        <div
          :class="[
            'flex',
            'flex-col',
            'items-center',
            'justify-between',
            'flex-grow',
            'my-[24px]',
            'sm:items-start',
            'sm:px-[56px]',
            'sm:mr-[100px]',
            'sm:mt-[48px]',
            'sm:mb-[56px]',
          ]"
        >
          <IconDiverMini class="text-airdrop-gold" />
          <div
            :class="[
              'flex',
              'mt-[24px]',
              'mb-[12px]',
              'sm:items-end',
              'sm:my-[12px]',
            ]"
          >
            <Label
              :class="['font-extrabold', 'text-dark-gray']"
              :text="`${claimmableAmount}`"
              preset="h1"
            />
            <Label
              :class="[
                'font-bold',
                'text-dark-gray',
                'ml-[8px]',
                'mb-[4px]',
              ]"
              :text="$t('AirDrop.label.$like')"
              preset="h2"
            />
          </div>
          <Label
            :class="['font-bold', 'text-medium-gray']"
            :text="$t('AirDrop.label.amount.airdrop')"
            preset="p6"
          />
        </div>
        <!-- Check qualifications -->
        <div
          :class="[
            'flex',
            'flex-col',
            'sm:flex-wrap',
          ]"
        >
          <Label
            v-for="item in qualifications"
            :key="item.type"
            :class="[
              'font-bold',
              { 'text-airdrop-gold': item.isQualified },
              { 'text-medium-gray': !item.isQualified },
              'whitespace-nowrap',
              'mb-[20px]',
              'sm:w-min',
            ]"
            :text="$t(`AirDrop.label.${item.type}`)"
            preset="h5"
          >
            <template #prepend>
              <IconCheck v-if="item.isQualified" />
              <IconClose v-else />
            </template>
          </Label>
        </div>
      </div>
      <div
        :class="[
          'w-full',
          'h-[2px]',
          'my-[24px]',
          'bg-light-gray',
          'sm:hidden',
        ]"
        />
      <!-- Subscribe -->
      <div>
        <Label
          :class="[
            'mt-[8px]',
            'w-full',
            'max-w-[600px]',
            'text-dark-gray',
            'text-center',
          ]"
          :text="
            claimmableAmount !== 0
              ? $t('AirDrop.content.subscription')
              : $t('AirDrop.content.0claim')"
          preset="p5"
        />
        <SubscriptionCard preset="subscription" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class AirdropVerifier extends Vue {
  @Prop(String) readonly address: string | undefined
  @Prop(Number) readonly claimmableAmount: number | undefined
  @Prop(Boolean) readonly isQualifiedForAtom: boolean | undefined
  @Prop(Boolean) readonly isQualifiedForOsmo: boolean | undefined
  @Prop(Boolean) readonly isQualifiedForCivic: boolean | undefined

  email: string = ''
  
  get qualifications() {
    return [
      { type: 'cosmos', isQualified: this.isQualifiedForAtom },
      { type: 'osmosis', isQualified: this.isQualifiedForOsmo },
      { type: 'civicLiker', isQualified: this.isQualifiedForCivic },
    ]
  }
}
</script>
