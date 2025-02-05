<template>
  <div :class="['flex', 'flex-nowrap', 'items-center', 'w-min']">
    <Label
      v-if="currentAddress"
      :class="['whitespace-nowrap', 'mr-[24px]', 'text-airdrop-gold']"
      :text="balance"
      preset="h6"
    >
      <template #prepend>
        <IconPrice />
      </template>
    </Label>
    <Label
      :class="['whitespace-nowrap', 'mr-[24px]', 'text-medium-gray']"
      :text="$t('HomePage.label.getToken')"
      preset="h6"
    />
    <Button
      class="mr-[24px]"
      preset="tertiary"
      text-preset="h6"
      size="mini"
      href="https://faucet.like.co/"
      :text="$t('HomePage.button.faucet')"
    />
    <Button
      class="mr-[24px]"
      preset="tertiary"
      text-preset="h6"
      size="mini"
      href="https://app.osmosis.zone/?from=USDC&to=LIKE"
      :text="$t('HomePage.button.osmosis')"
    />
    <!-- help button -->
    <IconDot class="mr-[24px]" />
    <Button
      preset="tertiary"
      text-preset="h6"
      size="mini"
      href="https://go.crisp.chat/chat/embed/?website_id=5c009125-5863-4059-ba65-43f177ca33f7"
      :text="$t('HomePage.button.help')"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { getAccountBalance } from '~/utils/cosmos'

const walletModule = namespace('wallet')

@Component({})
export default class TokenBar extends Vue {
  @walletModule.Getter('getWalletAddress') currentAddress!: string

  balance: number = 0

  @Watch('$store.state.wallet.address', { immediate: true })
  async onAddressChange() {
    if (!this.currentAddress) return
    const balance = await getAccountBalance(this.currentAddress) as number
    this.balance = Math.floor(balance)
  }
}
</script>

