<template>
  <div
    v-if="!errorMessage"
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
      'flex-row',
      'justify-between',
      'items-center',
      'bg-like-cyan-extralight',
      'py-[24px]',
      'px-[56px]',
      'w-full',
      'mt-[56px]',
    ]"
  >
    <Label
      :class="[
        'whitespace-pre-line',
        'text-red',
      ]"
      preset="p5"
      :text="errorMessage"
    />
    <Button
      v-if="!shouldCloseAirdrop"
      :class="[
        'ml-[8px]',
        'w-min',
      ]"
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
  
  // Error message from empty or ineligible address
  @Prop(String) readonly errorMessage!: string | undefined

  // If Airdrop is closed, the page would turn into view-only mode
  @Prop({ default : false }) readonly shouldCloseAirdrop!: boolean | undefined
}
</script>
