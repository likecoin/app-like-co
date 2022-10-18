<template>
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
        'sm:hidden',

        'font-bold',
        'text-like-cyan-extralight',
        'mb-[16px]',
      ]"
      :text="$t('AirDrop.mission.viewOnlyOnMobile')"
      preset="h2"
    />
    <Label
      :class="[
        'hidden',
        'sm:block',

        'font-bold',
        'text-like-cyan-extralight',
        'mb-[16px]',
      ]"
      :text="$t('AirDrop.mission.viewOnly')"
      preset="h2"
    />
    <div
      v-for="mission in missionsOverview"
      :key="mission.mission"
      :class="[
        'flex',
        'flex-col',
        'sm:flex-row',

        'text-center',
        'sm:text-left',

        'items-center',
        'justify-between',
        'py-[28px]',
        'px-[32px]',
        'mb-[16px]',
        'rounded-[24px]',
        'border-[1px]',
        'border-like-cyan-light',
        { 'border-opacity-50': false },
        
        'bg-like-green',
        'hover:bg-like-dark-green',

        'cursor-pointer',
        'transition',
        'duration-200',
      ]"
      @click="$emit('handleMissionOpen', mission.name)"
    >
      <div
        :class="[
          'text-like-green',
          'text-[48px]',
          'font-bold',
          'text-stroke',
        ]"
      >
        {{ $t(`AirDrop.mission.no.${mission.name}`) }}
      </div>
      <Label
        :class="[
          'hidden',
          'sm:block',
          
          'font-bold',
          'text-white',
          {
            'text-like-cyan-light text-opacity-50': true,
          },
          'mx-[24px]',
          'w-[100%]',
        ]"
        :text="$t(`AirDrop.mission.title.${mission.name}`)"
        preset="h2"
      />
      <Label
        :class="[
          'sm:hidden',
          'font-bold',
          'text-white',
          {
            'text-like-cyan-light text-opacity-50': true,
          },
          'mx-[24px]',
          'w-[100%]',
        ]"
        :text="$t(`AirDrop.mission.title.${mission.name}`)"
        preset="h2"
        align="center"
      />
      <IconMissionViewOnly
        :class="[
          'mt-[24px]',
          'sm:mt-0',

          'w-[56px]',
          'h-[56px]',
        ]"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class AirdropMission extends Vue {

  // Contains all information in four missions
  @Prop(Array) readonly missionsOverview!: string[] | undefined
}
</script>
