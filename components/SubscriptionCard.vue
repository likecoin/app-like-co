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
        'flex-col',
        'w-full',
        'items-center',
        'justify-center',
        'mt-[8px]',
        'p-[16px]',
        'sm:flex-row',
        'sm:w-min',
      ]"
    >
      <TextField
        v-model="email"
        :class="['w-full', 'sm:w-min']"
        :placeholder="$t('AirDrop.placeholder.email')"
        :error-message="errorMessage"
      />
      <Button
        :class="[
          'mt-[16px]',
          'sm:ml-[16px]',
          'sm:mt-0',
        ]"
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
        'flex-col',
        'items-center',
        'justify-center',
        'sm:mt-[8px]',
        'sm:flex-row',
      ]"
    >
      <Label
        :class="[
          'text-twitter-blue',
          'mt-[8px]',
          'mb-[8px]',
          'sm:mb-0',
        ]"
        :text="$t('AirDrop.label.and')"
        preset="h5"
      />
      <Button
        preset="outline"
        :class="['ml-[16px]', 'text-twitter-blue']"
        :style="{ border: '2px solid #4696F1' }"
        :text="$t('AirDrop.label.follow.Twitter')"
        href="https://twitter.com/likecoin"
        @click="onClickSocial('Twitter')"
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
          @click="onClickSocial('Twitter')"
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
          @click="onClickSocial('Discord')"
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
          @click="onClickSocial('Github')"
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
          @click="onClickSocial('Medium')"
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
import { EMAIL_REGEX, AIRDROP_SUBSCRIBE_ENDPOINT } from '~/constant'
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

  onClickSocial(platform: string) {
    logTrackerEvent(this, 'AirdropCheck', `Subscribe${platform}`, '', 1);
  }

  async handleSubmit() {
    logTrackerEvent(this, 'AirdropCheck', 'SubscribeNewsLetterStart', '', 1);
    this.errorMessage = ''
    if (!EMAIL_REGEX.test(this.email)) {
      this.errorMessage = this.$t('AirDrop.errorMessage.invalidEmail') as string
      return
    }
    const body = { email: this.email, locale: navigator.language }
    try {
      await this.$axios.post(
        AIRDROP_SUBSCRIBE_ENDPOINT,
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
