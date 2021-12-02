<template>
  <div
    :class="[
      'flex',
      'flex-col',
      'items-center',
    ]"
  >
    <img
      :class="['mt-[32px]', 'w-[300px]']"
      src="/images/airdrop/title_Verifier.png"
    />
    <!-- Subscribe -->
    <Label
      :class="['text-medium-gray', 'my-[8px]']"
      :text="address"
      preset="p5"
    />
    <Label
      :class="[
        'text-dark-gray',
        'mt-[8px]',
        'w-[600px]',
        'text-center',
      ]"
      text="Thanks for your support on the cosmos ecosystem, there are $LIKE allocated to you inside the upcoming LikeCoin airdrop. Do not miss the airdrop, subscribe to the news letters, we will notify you once the airdrop is ready to claim"
      preset="p5"
    />
    <div
      :class="[
        'flex',
        'justify-center',
        'mt-[8px]',
        'p-[16px]',
        'w-[489px]',
      ]"
    >
      <TextField v-model="email" class="flex-grow" :placeholder="$t('AirDrop.placeholder.email')" />
      <Button class="ml-[16px]" preset="secondary" :text="$t('AirDrop.button.notify')" @click="getNotify">
        <template #prepend>
          <IconPlaceholder />
        </template>
      </Button>
    </div>
    <div
      :class="[
        'flex',
        'items-center',
        'justify-center',
        'mt-[8px]',
        'mb-[32px]',
      ]"
    >
      <Label :class="['text-twitter-blue', 'mt-[8px]']" :text="$t('AirDrop.label.and')" preset="h5" />
      <Button
        preset="outline"
        :class="[
          'ml-[16px]',
          'border-twitter-blue',
          'text-twitter-blue',
        ]"
        :text="$t('AirDrop.label.follow.Twitter')"
        href="https://twitter.com/likecoin"
      >
        <template #prepend>
          <IconTwitter
            class="text-twitter-blue"
          />
        </template>
      </Button>
    </div>
    <!-- Amount -->
    <div :class="['flex', 'items-center']">
      <div
        :class="[
          'flex',
          'items-start',
          'justify-center',
          'px-[56px]',
          'mt-[32px]',
          'mb-[56px]',
          'mr-[100px]',
        ]"
      >
        <div
          :class="[
            'flex',
            'flex-col',
            'justify-between',
            'flex-grow',
          ]"
        >
          <IconDiverMini class="text-airdrop-gold" />
          <div
            :class="[
              'flex',
              'my-[12px]',
              'items-end',
            ]"
          >
            <Label
              :class="['font-extrabold','text-dark-gray']"
              :text="totalAmount"
              preset="h1"
            />
            <Label
              :class="[
                'font-bold',
                'text-dark-gray',
                'ml-[8px] mb-[4px]',
              ]"
              :text="$t('AirDrop.label.$like')"
              preset="h2"
            />
          </div>
          <Label
            :class="['font-bold', 'text-medium-gray']"
            :text="$t('AirDrop.label.amount.airdrop')"
            preset="p6"
          />
        </div>
      </div>
      <div :class="['flex', 'flex-col']">
        <Label
          :class="[
            'font-bold',
            'text-medium-gray',
            'text-airdrop-gold',
            'mb-[24px]',
          ]"
          :text="$t('AirDrop.label.cosmos')"
          preset="h5"
        >
          <template #prepend><IconCheck /></template>
        </Label>
        <Label
          :class="[
            'font-bold',
            'text-medium-gray',
            'text-airdrop-gold',
          ]"
          :text="$t('AirDrop.label.Osmosis')"
          preset="h5"
        >
          <template #prepend><IconCheck /></template>
        </Label>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class AirdropSubscribtion extends Vue {
  @Prop(String) readonly address: string | undefined
  @Prop(Number) readonly totalAmount: number | undefined

  email:string = ''

  // eslint-disable-next-line class-methods-use-this
  getNotify(){
    // not ready yet
    console.log(this.email)
  }
}
</script>
