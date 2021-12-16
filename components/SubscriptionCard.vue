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
        'w-[489px]',
        'mt-[8px]',
        'p-[16px]',
      ]"
    >
      <TextField
        v-model="email"
        class="flex-grow"
        :placeholder="$t('AirDrop.placeholder.email')"
      />
      <Button
        class="ml-[16px]"
        preset="secondary"
        :text="$t('AirDrop.button.notify')"
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
        'mt-[32px]',
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
          size="small"
          class="mx-[8px]"
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
          size="small"
          class="mx-[8px]"
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
          size="small"
          class="mx-[8px]"
          href="https://medium.com/likecoin"
        >
          <IconMedium class="text-dark-gray" />
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
          size="small"
          class="mx-[8px]"
          href="https://about.like.co/"
        >
          <IconLikeIcon class="text-dark-gray" />
        </Button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

export enum Preset {
  both = 'both',
  subscription = 'subscription',
  community = 'community',
}

@Component
export default class SubscriptionCard extends Vue {
  @Prop({ default: 'both' }) readonly preset!: string | undefined

  email: string = ''
}
</script>
