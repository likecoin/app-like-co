<template>
  <div
    :class="[
      'flex',
      'flex-col',
      'items-center',
    ]"
  >
    <Label
      v-if="preset !== 'subscription'"
      :text="$t('AirDrop.label.follow.LikeCoin')"
      preset="h4"
    />
    <div
      v-if="preset !== 'community'"
      :class="[
        'flex',
        'justify-center',
        'mt-[8px]',
        'p-[16px]',
      ]"
    >
      <TextField
        v-model="email"
        :placeholder="$t('AirDrop.placeholder.email')"
        :error-message="errorMessage"
      />
      <Button
        class="ml-[16px]"
        preset="secondary"
        :text="$t('AirDrop.button.notify')"
        @click="handleSubmit"
      >
        <template #prepend>
          <IconSensors />
        </template>
      </Button>
    </div>
    <div
      v-if="preset !== 'community'"
      :class="[
        'flex',
        'items-center',
        'justify-center',
        'mt-[8px]',
      ]"
    >
      <Label
        :class="['text-twitter-blue', 'mt-[8px]']"
        :text="$t('AirDrop.label.and')"
        preset="h5"
      />
      <Button
        preset="outline"
        :class="['ml-[16px]', 'text-twitter-blue']"
        :style="{ border: '2px solid #4696F1' }"
        :text="$t('AirDrop.label.follow.Twitter')"
        href="https://twitter.com/likecoin"
      >
        <template #prepend>
          <IconTwitter class="text-twitter-blue" />
        </template>
      </Button>
    </div>
    <div
      v-if="preset !== 'subscription'"
      :class="[
        'flex',
        'justify-center',
        'mt-[24px]',
      ]"
    >
      <div
        :class="[
          'flex',
          'flex-col',
          'items-center',
        ]"
      >
        <Button
          preset="tertiary"
          circle="true"
          :class="[
            'w-[32px]',
            'h-[32px]',
            'mx-[8px]'
          ]"
          href="https://twitter.com/likecoin"
          @click="onClickTwitter"
        >
          <IconTwitter class="text-dark-gray" />
        </Button>
      </div>
      <div
        :class="[
          'flex',
          'flex-col',
          'items-center',
        ]"
      >
        <Button
          preset="tertiary"
          circle="true"
          :class="[
            'w-[32px]',
            'h-[32px]',
            'mx-[8px]'
          ]"
          href="https://discord.com/invite/W4DQ6peZZZ"
        >
          <IconDiscord class="text-dark-gray" />
        </Button>
      </div>
      <div
        :class="[
          'flex',
          'flex-col',
          'items-center',
        ]"
      >
        <Button
          preset="tertiary"
          circle="true"
          :class="[
            'w-[32px]',
            'h-[32px]',
            'mx-[8px]'
          ]"
          href="https://github.com/likecoin"
        >
          <IconGithub class="text-dark-gray" />
        </Button>
      </div>
      <div
        :class="[
          'flex',
          'flex-col',
          'items-center',
        ]"
      >
        <Button
          preset="tertiary"
          circle="true"
          :class="[
            'w-[32px]',
            'h-[32px]',
            'mx-[8px]'
          ]"
          href="https://medium.com/likecoin"
        >
          <IconMedium class="text-dark-gray" />
        </Button>
      </div>
    </div>
    <Snackbar
      v-model="isOpenAlert"
      class="mx-auto"
      :text="$t('AirDrop.successMessage.subscribed')"
      preset="success"
      :timeout="2000"
    >
      <template #prepend>
        <IconDone/>
      </template>
    </Snackbar>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { EMAIL_REGEX, AIRDROP_SUBSCRIBE } from '~/constant'
import { logTrackerEvent } from '~/utils/logger'

export enum Preset {
  both = 'both',
  subscription = 'subscription',
  community = 'community',
}

@Component
export default class SubscriptionCard extends Vue {
  @Prop({ default: 'both' }) readonly preset!: string | undefined

  email: string = ''
  errorMessage: string = ''
  isOpenAlert: boolean = false

  onClickTwitter() {
    logTrackerEvent(this, 'AirdropCheck', 'SubscribeTwitter', '', 1);
  }

  async handleSubmit() {
    logTrackerEvent(this, 'AirdropCheck', 'SubscribeNewsLetterStart', '', 1);
    this.errorMessage = ''
    if (!EMAIL_REGEX.test(this.email)) {
      this.errorMessage = this.$t('AirDrop.errorMessage.invalidEmail') as string
      return
    }
    const body = { email: this.email, language: navigator.language }
    try {
      await this.$axios.post(
        AIRDROP_SUBSCRIBE,
        body,
      )
      logTrackerEvent(this, 'AirdropCheck', 'SubscribeNewsLetterSuccess', '', 1);
    } catch (err) {
      logTrackerEvent(this, 'AirdropCheck', 'SubscribeNewsLetterFail', '', 1);
      this.errorMessage = this.$t('AirDrop.errorMessage.alreadySubscriibed') as string;
    } finally {
      if (!this.errorMessage) this.isOpenAlert = true
    }
  }
}
</script>
