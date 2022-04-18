<template>
  <div
    v-if="hasConnectedWallet && !errorMessage"
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

        'flex-col',
        'sm:flex-row',

        'items-center',
        'w-full',
      ]"
    >
      <ProgressIndicator
        v-if="!isFinishedLoading"
      />
      <div
        v-else
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
        />
        <div
          :class="[
            'absolute',
            'top-0',
            'bg-like-cyan',
            'h-[12px]',
            'rounded-[66px]',
          ]"
          :style="{ width: `${progress + 1}%` }"
        />
        <div
          :class="[
            'absolute',
            'top-0',
            'bg-like-green',
            'h-[12px]',
            'rounded-[66px]',
          ]"
          :style="{ width: `${progress}%` }"
        />
      </div>
      <div
        v-if="isFinishedLoading"
        :class="[
          'px-[24px]',
          'py-[5px]',
          'bg-white',
          'bg-opacity-[60%]',
          'rounded-[16px]',

          'mt-[24px]',
          'sm:mt-0',
        ]"
      >
        <Label
          :class="[
            'font-bold',
            'text-airdrop-gold',
          ]"
          :text="`${progress}%`"
          preset="h2"
        />
      </div>
    </div>
  </div>
  <div
    v-else
    :class="[
      'flex',

      'flex-col',
      'md:flex-row',
      'md:flex-nowrap',

      'items-center',
      errorMessage ? 'justify-between' : 'justify-center',
      'bg-like-cyan-extralight',
      'py-[24px]',
      'px-[56px]',
      'w-full',
      'mt-[56px]',
    ]"
  >
    <Label
      v-if="errorMessage"
      :class="[
        'md:mr-[8px]',
        'mb-[12px]',
        'md:mb-[0]',
        'whitespace-pre-line',
        'text-red',
      ]"
      preset="p5"
      >{{ errorMessage }}
      <Link
        v-if="errorMessage === $t('AirDrop.errorMessage.ineligible')"
        :class="['ml-[4px]','text-red']"
        :href="$t('AirDrop.errorMessage.ineligible.learnMore.link')"
      >{{$t('AirDrop.errorMessage.ineligible.learnMore')}}
      </Link>
    </Label>
    <Button
      v-if="!shouldCloseAirdrop"
      class="w-min"
      preset="secondary"
      :text="$t('AirDrop.button.otherWallet')"
      @click="$emit('handleConnectWallet')"
    >
      <template #prepend>
        <IconSignIn />
      </template>
    </Button>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class AirdropProgress extends Vue {

  // The percentage of the received airdrop
  @Prop(Number) readonly progress!: number | undefined

  // Show connect wallet button if not connected
  @Prop({ default: false }) readonly hasConnectedWallet!: boolean

  // Error message from empty or ineligible address
  @Prop(String) readonly errorMessage!: string | undefined

  // If Airdrop is closed, the page would turn into view-only mode
  @Prop({ default : false }) readonly shouldCloseAirdrop!: boolean | undefined

  // True if page finished the fetch process
  @Prop({ default : false }) readonly isFinishedLoading!: boolean | undefined
}
</script>
