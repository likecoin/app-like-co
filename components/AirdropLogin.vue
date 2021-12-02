<template>
  <div
    :class="[
      'flex',
      'flex-col',
      'items-center',
      ' w-full',
    ]"
  >
    <img
      :class="['mt-[32px]', 'w-[300px]']"
      src="/images/airdrop/title_Verifier.png"
    />
    <!-- Wallet -->
    <div
      :class="[
        'flex',
        'flex-col',
        'items-start',
        'bg-light-gray',
        'pt-[24px]',
        'pb-[56px]',
        'px-[56px]',
        'w-full',
      ]"
    >
      <Label
        :class="['font-extrabold', 'text-like-green']"
        text="Connect your wallet"
        preset="h2"
      />
      <Label
        :class="[
          'text-dark-gray',
          'mt-[8px]',
          'w-[600px]',
        ]"
        text="Connect or insert below your address and verify how many $LIKE have been allocated to you inside the upcoming LikeCoin airdrop"
        preset="p5"
      />
      <div
        :class="[
          'flex',
          'justify-center',
          'px-[32px]',
          'mt-[32px]',
          'w-full',
        ]"
      >
        <!-- Keplr -->
        <div
          :class="[
            'flex',
            'flex-col',
            'items-start',
            'bg-white',
            'border-[4px]',
            'border-shade-gray',
            'rounded-[16px]',
            'py-[26px]',
            'px-[24px]',
            'w-[356px]',
            'cursor-pointer',
          ]"
          @click="handleConnectKeplr"
        >
          <div
            :class="[
              'flex',
              'items-center',
              'mb-[14px]',
            ]"
          >
            <IconKeplr />
            <Label
              :class="['text-dark-gray', 'ml-[12px]']"
              text="Keplr Wallet"
              preset="h4"
            />
          </div>
          <Label
            :class="['text-dark-gray', 'mt-[8px]']"
            text="Connect cosmos/osmosis wallet with Keplr broswer extension"
            preset="p5"
          />
        </div>
        <!-- Liker ID -->
        <div
          :class="[
            'flex',
            'flex-col',
            'items-start',
            'bg-white',
            'border-[4px]',
            'border-shade-gray',
            'rounded-[16px]',
            'py-[26px]',
            'px-[24px]',
            'ml-[24px]',
            'w-[356px]',
            'cursor-pointer',
          ]"
        >
          <div
            :class="[
              'flex',
              'items-center',
              'mb-[14px]',
            ]"
          >
            <IconLikerLand />
            <Label
              :class="['text-dark-gray', 'ml-[12px]']"
              text="Liker ID"
              preset="h4"
            />
          </div>
          <Label
            :class="['text-dark-gray', 'mt-[8px]']"
            text="Connect to LikerID with the Liker Land app"
            preset="p5"
          />
        </div>
      </div>
    </div>
    <!-- input -->
    <div
      v-if="!isAirdropStarted"
      :class="[
        'flex',
        'flex-col',
        'items-center',
        'mb-[32px]',
      ]"
    >
      <Label
        :class="[
          'text-center',
          'text-medium-gray',
          'mt-[32px]',
        ]"
        text="or insert your address"
        preset="p5"
      />
      <div
        :class="[
          'flex',
          'justify-center',
          'mt-[24px]',
          'p-[16px]',
          'w-[450px]',
        ]"
      >
        <TextField
          v-model="inputValue"
          class="flex-grow"
          placeholder="cosmos/osmosis..."
        />
        <Button
          class="ml-[16px]"
          preset="secondary"
          text="Enter"
          @click="handleConnectAddress"
        >
          <template #append>
            <IconArrowRight />
          </template>
        </Button>
      </div>
    </div>
    <div v-else class="mb-[32px]" @click="handleNoWallet">
      <Label
        :class="[
          'text-center',
          'text-dark-gray',
          'mt-[32px]',
        ]"
        text="Continue without wallet"
        preset="p5"
      >
        <template #append>
          <IconArrowRight />
        </template>
      </Label>
    </div>
  </div>
</template>
<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

const signerModule = namespace('signer')
const keplrModule = namespace('keplr')

@Component
export default class AirdropLogin extends Vue {
  @Prop(Boolean) readonly isAirdropStarted: boolean | undefined

  @signerModule.Getter('getAddress') currentAddress!: string
  @signerModule.Action updateSignerInfo!: (arg0: {
    signer: OfflineSigner | null
    address: string
  }) => void

  @keplrModule.Action initKeplr!: () => Promise<boolean>
  @keplrModule.Getter('getWalletAddress') keplrWallet!: string
  @keplrModule.Getter('getSigner') keplrSigner!: OfflineSigner | null

  address: string = ''
  inputValue: string = ''

  async handleConnectKeplr() {
    await this.initKeplr()
    await this.updateSignerInfo({
      signer: this.keplrSigner,
      address: this.keplrWallet,
    })
    this.getAddress(this.currentAddress)
  }

  handleConnectAddress() {
    this.getAddress(this.inputValue)
  }

  handleConnectLikerId() {
    this.getAddress(this.inputValue)
  }

  handleNoWallet() {
    this.$emit('getAddress', {
      address: 'none',
    })
  }

  getAddress(address: string) {
    this.address = address
    this.$emit('getAddress', {
      address: this.address,
    })
  }
}
</script>
