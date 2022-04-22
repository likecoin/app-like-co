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
        'p-[16px]',
        'sm:flex-row',
        'sm:w-min',
      ]"
    >
      <Button
        :class="[
          'mt-[16px]',
          'sm:mt-0',
        ]"
        preset="secondary"
        :text="$t('AirDrop.button.subscribe')"
        href="https://likecoin.substack.com/"
      >
        <template #prepend>
          <IconSensors />
        </template>
      </Button>
      <Label
        :class="[
          'text-medium-gray',
          'my-[8px]',
          'mx-[8px]',
        ]"
        :text="$t('AirDrop.label.and')"
        preset="h5"
      />
      <Button
        preset="outline"
        :class="['text-twitter-blue']"
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
          href="https://discord.gg/likecoin"
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
          href="https://blog.like.co"
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
}
</script>
