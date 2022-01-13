<template>
  <div
    :class="[
      'flex',
      'flex-col',
      'items-center',
      'justify-center',
      'px-[24px]',
    ]"
  >
    <img
      :class="[
        'hidden',
        'my-[32px]',
        'w-[300px]',
        'lg:block',
      ]"
      src="/images/airdrop/title_Checker.png"
    />
    <Label
      :class="[
        'my-[24px]',
        'text-center',
        'font-extrabold',
        'text-like-green',
        'lg:hidden',
      ]"
      :text="$t('AirDrop.label.checker')"
      preset="h2"
      align="center"
    />
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
            'items-start',
            'justify-between',
            'flex-grow',
            'my-[24px]',
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
              'my-[12px]',
              'items-end',
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
            'flex-wrap',
            'sm:flex-col',
          ]"
        >
          <Label
            :class="[
              'w-[45%]',
              'font-bold',
              { 'text-airdrop-gold': isQualifiedForAtom },
              { 'text-medium-gray': !isQualifiedForAtom },
              'mb-[20px]',
              'sm:w-min',
            ]"
            :text="$t('AirDrop.label.cosmos')"
            preset="h5"
          >
            <template #prepend>
              <IconCheck v-if="isQualifiedForAtom" />
              <IconClose v-else />
            </template>
          </Label>
          <Label
            :class="[
              'w-[45%]',
              'font-bold',
              { 'text-airdrop-gold': isQualifiedForOsmo },
              { 'text-medium-gray': !isQualifiedForOsmo },
              'mb-[20px]',
              'sm:w-min',
            ]"
            :text="$t('AirDrop.label.Osmosis')"
            preset="h5"
          >
            <template #prepend>
              <IconCheck v-if="isQualifiedForOsmo" />
              <IconClose v-else />
            </template>
          </Label>
          <Label
            :class="[
              'w-[45%]',
              'whitespace-nowrap',
              'font-bold',
              { 'text-airdrop-gold': isQualifiedForCivic },
              { 'text-medium-gray': !isQualifiedForCivic },
              'sm:w-min',
            ]"
            :text="$t('AirDrop.label.civicLiker')"
            preset="h5"
          >
            <template #prepend>
              <IconCheck v-if="isQualifiedForCivic" />
              <IconClose v-else />
            </template>
          </Label>
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
      </div>
      <!-- Subscribe -->
      <div>
        <Label
          :class="[
            'mt-[8px]',
            'w-full',
            'max-w-[600px]',
            'text-left',
            'text-dark-gray',
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
}
</script>
