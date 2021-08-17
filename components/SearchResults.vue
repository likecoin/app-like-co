<template>
  <div class="container max-w-[976px] flex flex-row flex-wrap justify-center">
    <div v-for="record in records" :key="record.id">
      <template v-if="!record">
        {{ $t('general.loading') }}
      </template>
      <template v-else>
        <nuxt-link
          :to="
            localeLocation({
              name: 'view-iscnId',
              params: { iscnId: record.id },
            })
          "
        >
          <div class="container w-min mx-[12px] mb-[48px]">
            <div
              class="
                flex
                w-[220px]
                h-[440px]
                justify-center
                items-center
                mb-[16px]
                rounded-[24px]
                bg-shade-gray
                text-white
              "
            >
              ISCN Card
            </div>
            <Label
              class="w-min mb-[16px]"
              :text="record.data.contentMetadata['@type']"
              tag="div"
              preset="p5"
              valign="middle"
              content-class="font-semibold whitespace-nowrap text-like-green"
              prepend-class="text-like-green"
            >
              <template #prepend>
                <IconImage
                  v-if="record.data.contentMetadata['@type'] === 'Photo'"
                />
                <IconImage
                  v-if="record.data.contentMetadata['@type'] === 'Image'"
                />
                <IconText
                  v-if="record.data.contentMetadata['@type'] === 'Text'"
                />
                <IconText
                  v-if="record.data.contentMetadata['@type'] === 'Article'"
                />
                <IconVideo
                  v-if="record.data.contentMetadata['@type'] === 'Video'"
                />
              </template>
            </Label>
            <FormField :label="$t('iscn.meta.title')">
              {{ record.data.contentMetadata.title }}
            </FormField>
            <FormField label="">
              <Tag text="Pill Title" />
              <Tag text="Pill Title" />
            </FormField>
          </div>
        </nuxt-link>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import { Vue, Component, Prop } from 'vue-property-decorator'
import { parsedISCNRecord } from '~/utils/cosmos/iscn'

@Component
export default class SearchResults extends Vue {
  @Prop(Array) readonly records!: parsedISCNRecord[]
}
</script>

