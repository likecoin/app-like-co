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
              :src="claimStatus === 'claimed'
                ? `/images/airdrop/mission_completed_${mission.name}.png`
                : `/images/airdrop/mission_notcompleted_${mission.name}.png`"
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
              :is-disabled="isDisabled"
              size="large"
              :style="{ backgroundColor: '#C69F67' }"
              :href="isDisabled
                ? undefined
                : $t(`AirDrop.mission.discription.guide.link.${mission.name}`)"
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
      <!-- result -->
      <div
        v-if="result === 'fail'"
        :class="[
          'w-full',
          'max-w-[400px]',
        ]"
      >
        <Label
          preset="h2"
          align="center"
          :class="[
            'text-center',
            'text-airdrop-gold',
          ]"
          :text="claimStatus === 'unable'
          ? $t('AirDrop.label.technicalError')
          : $t('AirDrop.mission.discription.incompleted.title')"
        />
        <div
          :class="[
            'flex',
            'flex-col',
            'items-center',
            'justify-center',
            'mt-[48px]',
          ]"
        >
          <IconError v-if="claimStatus === 'unable'" class="w-[56px]" />
          <IconMissionIncompleted v-else class="w-[48px]" />
          <Label
            preset="p5"
            align="center"
            :class="['mt-[24px]','whitespace-pre-line','text-center']"
            :text="claimStatus === 'unable'
            ? $t('AirDrop.errorMessage.technicalError')
            : $t('AirDrop.mission.discription.incompleted.title')"
          />
          <div
            :class="[
              'flex',
              'w-full',
              'justify-between',
              'items-center',
              'mt-[62px]',
            ]"
          >
            <Button
              preset="plain"
              :text="$t('AirDrop.mission.button.previous')"
              @click="$emit('step', 2)"
            >
              <template #prepend>
                <IconArrowLeft class="w-[20px]" />
              </template>
            </Button>
            <Button
              v-if="!loadingStatus"
              size="large"
              preset="outline"
              class="mr-[12px]"
              :text="$t('AirDrop.mission.button.retry')"
              @click="$emit('done')"
            />
            <ProgressIndicator v-else />
          </div>
        </div>
      </div>
      <div
        v-if="result === 'success'"
        :class="[
          'w-full',
          'max-w-[400px]',
        ]"
      >
        <div
          :class="[
            'px-[80px]',
            'mt-[14px]',
          ]"
        >
          <img
            :class="[
              'w-full',
              'h-full',
              'object-cover',
            ]"
            src="/images/airdrop/title_Completed.png"
          />
        </div>
        <div
          :class="[
            'flex',
            'flex-col',
            'items-center',
            'justify-center',
            'mt-[32px]',
          ]"
        >
          <IconMissionCompleted class="w-[48px]" />
          <Label preset="p5" align="center" class="mt-[16px] text-center">
            <i18n
              path="AirDrop.mission.discription.completed"
              tag="div"
            >
              <template #reward>
                <span
                  :class="[
                    'font-bold',
                    'text-airdrop-gold',
                    'text-[18px]',
                  ]"
                >
                  {{ mission.claimedAmount }} LIKE
                </span>
              </template>
            </i18n>
          </Label>
          <Button
            size="large"
            preset="outline"
            class="mt-[42px]"
            :text="$t('AirDrop.mission.button.seeTransaction')"
            :href="txUrl"
          />
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
        <div v-if="step === 2">
          <Button
            v-if="(claimStatus === 'unclaimed' || claimStatus === 'unable') && !loadingStatus"
            preset="secondary"
            :text="$t('AirDrop.button.done')"
            @click="$emit('done')"
          >
            <template #append>
              <IconArrowRight />
            </template>
          </Button>
          <ProgressIndicator
            v-if="(claimStatus === 'unclaimed' || claimStatus === 'unable') && loadingStatus"
          />
          <div
            v-if="claimStatus === 'claimed' && !errorMessage"
            class="w-[208px]"
          >
            <Button
              class="w-full"
              preset="tertiary"
              :href="txUrl"
              :text="buttonText"
              @mouseover="changeText('in')"
              @mouseout="changeText('out')"
            >
              <template #prepend>
                <IconCheck />
              </template>
            </Button>
          </div>
          <Button
            v-if="claimStatus === 'withoutWallet'"
            is-disabled="true"
            preset="tertiary"
            :text="$t('AirDrop.mission.button.notEligible')"
          >
            <template #prepend>
              <IconClose />
            </template>
          </Button>
          <Button
            v-if="claimStatus === 'unableAll'"
            is-disabled="true"
            preset="tertiary"
            :text="$t('AirDrop.mission.button.technicalError')"
          >
            <template #prepend>
              <IconClose />
            </template>
          </Button>
        </div>
      </div>
    </template>
  </Dialog>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

enum Result {
  fail = 'fail',
  success = 'success'
}

@Component
export default class AirdropMissionDialog extends Vue {
  // Show/Hide dialog.
  @Prop({ default: false }) readonly isOpen!: boolean

  // Step of the mission
  @Prop(Number) readonly step!: number | undefined

  // Claim status of the mission
  @Prop(String) readonly claimStatus!: string | undefined

  // Loading status of the mission
  @Prop(String) readonly loadingStatus!: string | undefined

  // Error message from empty or ineligible address
  @Prop(String) readonly errorMessage!: string | undefined

  // Transaction url of the claimed airdrop
  @Prop(String) readonly txUrl!: string | undefined

  // Contains all information in the current mission
  @Prop(Object) readonly mission!: any | undefined

  buttonText: string = this.$t('AirDrop.mission.button.completed') as string

  get result() {
    if (
      this.step === 3 &&
      (this.claimStatus === 'unable' ||
        (this.claimStatus !== 'unable' && !this.mission.isCompleted))
    )
      return Result.fail
    if (
      this.step === 3 &&
      this.claimStatus !== 'unable' &&
      this.mission.isCompleted
    )
      return Result.success
    return undefined
  }

  get isDisabled() {
    return this.claimStatus === 'unable' || this.claimStatus === 'unableAll'
  }

  changeText(status: string) {
    if (status === 'in') {
      this.buttonText = this.$t(
        'AirDrop.mission.button.seeTransaction',
      ) as string
    } else
      this.buttonText = this.$t('AirDrop.mission.button.completed') as string
  }
}
</script>
