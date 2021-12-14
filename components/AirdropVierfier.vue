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
      :text="$t('AirDrop.content.subscription')"
      preset="p5"
    />
    <SubscriptionCard preset="subscription" />
    <!-- Amount -->
    <div :class="['flex', 'items-center']">
      <div
        :class="[
          'flex',
          'items-start',
          'justify-center',
          'px-[56px]',
          'mt-[48px]',
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
            'text-airdrop-gold',
            'mb-[24px]',
          ]"
          :text="$t('AirDrop.label.cosmos')"
          preset="h5"
        >
          <template #prepend>
            <IconCheck />
          </template>
        </Label>
        <Label
          :class="[
            'font-bold',
            'text-airdrop-gold',
          ]"
          :text="$t('AirDrop.label.Osmosis')"
          preset="h5"
        >
          <template #prepend>
            <IconCheck />
          </template>
        </Label>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class AirdropVierfier extends Vue {
  @Prop(String) readonly address: string | undefined
  @Prop(Number) readonly totalAmount: any | undefined

  email:string = ''

}
</script>
