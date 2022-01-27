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
        'font-bold',
        'text-like-cyan-extralight',
        'mb-[16px]',
      ]"
      :text="errorMessage
        ? $t('AirDrop.mission.viewOnly')
        : $t('AirDrop.label.missions')"
      preset="h2"
    />
    <div
      v-for="mission in missionsOverview"
      :key="mission.mission"
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
        'cursor-pointer',
        { 'border-opacity-50': mission.isClaimed || errorMessage },
        'bg-like-green',
        'transition',
        'duration-200',
        'hover:bg-like-dark-green',
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
          'font-bold',
          'text-white',
          {
            'text-like-cyan-light text-opacity-50':
              mission.isClaimed || errorMessage,
          },
          'mx-[24px]',
          'w-[100%]',
        ]"
        :text="$t(`AirDrop.mission.title.${mission.name}`)"
        preset="h2"
      />
      <IconMissionDone
        v-if="mission.isClaimed && !errorMessage"
        :class="[
          'w-[56px]',
          'h-[56px]',
        ]"
      />
      <IconMissionButton
        v-else-if="!mission.isClaimed && !errorMessage"
        :class="[
          'w-[56px]',
          'h-[56px]',
        ]"
      />
      <IconMissionViewOnly
        v-else
        :class="[
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

  // Error message from empty or ineligible address
  @Prop(String) readonly errorMessage!: string | undefined

  // Contains all information in four missions
  @Prop(Array) readonly missionsOverview!: string[] | undefined
}
</script>