<template>
  <Dialog
    :open="!!isOpen"
    preset="custom"
    is-disabled-backdrop-click="true"
    :has-padding="false"
    @close="$emit('close')"
  >
    <div
      :class="[
        'flex',
        'flex-col',
        'p-[24px]',
        'mb-[84px]',
        'w-full',
        'max-w-[616px]',
      ]"
    >
      <div
        v-if="step === 1 || step === 2" 
        :class="[
          'flex',
          'flex-col',
        ]"
      >
        <div 
          :class="[
            'flex',
            'flex-col',
            'flex-grow',
            'overflow-y-scroll',
            'scrollbar-hidden',
          ]"
        >
          <!-- header/hero -->
          <Label
            preset="h5"
            :class="[
              'text-like-green',
              'mb-[8px]',
            ]"
          >
            <template #prepend>
              <IconCheck v-if="mission.isClaimed" />
              <IconMissionButtonMini v-else />
            </template>
            {{ $t(`AirDrop.mission.dialog.no.${mission.name}`) }}
          </Label>
          <div
            :class="[
              'w-full',
              'h-[110px]',
            ]"
          >
            <img
              :class="[
                'w-full',
                'h-full',
                'object-cover',
              ]"
              :src="`/images/airdrop/mission_notcompleted_${mission.name}.png`"
            />
          </div>
          <!-- content -->
          <div>
            <Label
              preset="h2"
              :class="[
                'text-airdrop-gold',
                'mt-[6px]',
                'mb-[24px]',
              ]"
              :text="step === 1
                ? $t(`AirDrop.mission.title.1.${mission.name}`)
                : $t(`AirDrop.mission.title.2.${mission.name}`)"
            />
            <Label
              v-if="step === 1"
              preset="p5"
              :class="[
                'whitespace-pre-line',
                'leading-[24px]',
                'mt-[24px]',
                'text-dark-gray',
              ]"
              :text="$t(`AirDrop.mission.discription.step.1.${mission.name}`)"
            />
            <Label
              v-if="step === 2"
              preset="p5"
              :class="[
                'whitespace-pre-line',
                'leading-[24px]',
                'mt-[12px]',
                'text-dark-gray',
              ]"
            >
              <i18n
                :path="`AirDrop.mission.discription.step.2.${mission.name}`"
                tag="div"
              >
                <template #link>
                  <a
                    v-t="$t(`AirDrop.mission.discription.link.${mission.name}`)"
                    :class="[
                      'underline',
                      'text-like-green',
                    ]"
                    :href="$t(`AirDrop.mission.discription.link.${mission.name}`)"
                    target="_blank"
                  />
                </template>
              </i18n>
            </Label>
          </div>
          <!-- guide button -->
          <div
            v-if="mission.name !== 'keplr' && step === 2"
            :class="[
              'flex',
              'items-center',
              'justify-center',
              'mt-[24px]',
            ]"
          >
            <Button
              preset="primary"
              size="large"
              :style="{ backgroundColor: '#C69F67' }"
              :href="$t(`AirDrop.mission.discription.guide.link.${mission.name}`)"
            >
              <Label
                class="text-white"
                preset="h5"
                :text="$t(`AirDrop.mission.discription.guide.button.${mission.name}`)"
              >
                <template #prepend>
                  <IconClaim class="w-[20px]" />
                </template>
              </Label>
            </Button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <template
      v-if="step === 1 || step === 2"
      #footer
    >
      <div
        :class="[
          'flex',
          'p-[24px]',
          
          'flex-col',
          'sm:flex-row',

          'w-full',
          'max-w-[616px]',

          'h-[98px]',
          'sm:h-[78px]',

          'justify-center',
          'sm:justify-end',
          { 'sm:justify-between': step === 2 },
          
          'items-center',
          'mt-[62px]',
          'bg-white'
        ]"
      >
        <Button
          v-if="step === 1"
          preset="secondary"
          :text="$t('AirDrop.mission.button.next')"
          @click="$emit('step', 2)"
        >
          <template #append>
            <IconArrowRight />
          </template>
        </Button>
        <Button
          v-if="step === 2"
          preset="plain"
          @click="$emit('step', 1)"
        >
          <Label :text="$t('AirDrop.mission.button.previous')">
            <template #prepend><IconArrowLeft class="w-[20px]" /></template>
          </Label>
        </Button>
      </div>
    </template>
  </Dialog>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class AirdropMissionDialog extends Vue {
  // Show/Hide dialog.
  @Prop({ default: false }) readonly isOpen!: boolean

  // Step of the mission
  @Prop(Number) readonly step!: number | undefined

  // Contains all information in the current mission
  @Prop(Object) readonly mission!: any | undefined
}
</script>
