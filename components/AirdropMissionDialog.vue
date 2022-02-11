<template>
  <Dialog
    :open="!!isOpen"
    is-disabled-backdrop-click="true"
    @close="$emit('close')"
  >
    <div
      :class="[
        'flex',
        'flex-col',
        'mt-[-24px]',
      ]"
    >
      <!-- header/hero -->
      <div v-if="step !== 3">
        <Label
          preset="h5"
          :class="[
            'text-like-green',
            'mb-[8px]',
          ]"
        >
          <template #prepend>
            <IconCheck v-if="mission.isCompleted" />
            <IconMissionButtonMini v-else />
          </template>
          {{ $t(`AirDrop.mission.dialog.no.${mission.name}`) }}
        </Label>
        <div
          :class="[
            'w-full',
            'h-[176px]',
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
      </div>
      <!-- mission descriptions -->
      <div
        v-if="step !== 3"
        :class="[
          'p-[16px]',
          'w-[616px]',
        ]"
      >
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
        <div
          :class="[
            'flex',
            'justify-center',
            'mt-[24px]',
          ]"
        >
          <Button
            v-if="mission.name !== 'keplr' && step === 2"
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
        <div
          :class="[
            'flex',
            'w-full',
            'justify-end',
            { 'justify-between': step === 2 },
            'items-center',
            'mt-[62px]',
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
            <Label :text="$t('AirDrop.mission.button.pervious')">
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
            <Button
              v-if="claimStatus === 'claimed' && !errorMessage"
              preset="tertiary"
              :href="txhash"
              :text="buttonText"
              @mouseover="changeText('in')"
              @mouseout="changeText('out')"
            >
              <template #prepend>
                <IconCheck />
              </template>
            </Button>
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
      </div>
      
      <!-- result -->
      <div
        v-if="
          step === 3 &&
          (claimStatus === 'unable' ||
            (claimStatus !== 'unable' && !mission.isCompleted))"
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
          : $t('AirDrop.mission.discription.notCompleted.title')"
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
          <IconMissionNotCompleted v-else class="w-[48px]" />
          <Label
            preset="p5"
            align="center"
            :class="['mt-[24px]','whitespace-pre-line','text-center']"
            :text="claimStatus === 'unable'
            ? $t('AirDrop.errorMessage.technicalError')
            : $t('AirDrop.mission.discription.notCompleted')"
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
              :text="$t('AirDrop.mission.button.pervious')"
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
        v-else-if="step === 3 && claimStatus !== 'unable' && mission.isCompleted"
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
          <div
            :class="[
              'text-[18px]',
              'mt-[16px]',
              'text-center',
            ]"
          >
            <span
              :class="[
                'font-bold',
                'text-airdrop-gold',
                'text-[18px]',
              ]"
            >
              {{ mission.claimedAmount }} $LIKE
            </span>
            {{ $t('AirDrop.mission.discription.completed') }}
          </div>
          <Button
            size="large"
            preset="outline"
            class="mt-[42px]"
            :text="$t('AirDrop.mission.button.seeTransaction')"
            :href="txhash"
          />
        </div>
      </div>
    </div>
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
  
  // Claim status of the mission
  @Prop(String) readonly claimStatus!: string | undefined
  
  // Loading status of the mission
  @Prop(String) readonly loadingStatus!: string | undefined

  // Error message from empty or ineligible address
  @Prop(String) readonly errorMessage!: string | undefined

  // Transaction hash of the claimed airdrop
  @Prop(String) readonly txhash!: string | undefined

  // Contains all information in the current mission
  @Prop(Object) readonly mission!: object | {}

  buttonText: string = this.$t('AirDrop.mission.button.completed') as string

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
