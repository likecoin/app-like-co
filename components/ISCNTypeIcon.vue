<template>
  <IconImage v-if="recordType === 'Image'" />
  <IconText v-else-if="recordType === 'Text'" />
  <IconVideo v-else-if="recordType === 'Video'" />
  <IconCreativeWork v-else />
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import { Vue, Component, Prop } from 'vue-property-decorator'

export enum RecordType {
  Image = 'Image',
  Photo = 'Photo',
  Text = 'Text',
  Article = 'Article',
  Video = 'Video',
  CreativeWork = 'CreativeWork',
}

@Component
export default class ISCNTypeIcon extends Vue {
  @Prop(String) readonly type!: String | undefined

  get recordType() {
    switch (this.type) {
      case RecordType.Image:
      case RecordType.Photo:
        return 'Image'
      case RecordType.Text:
      case RecordType.Article:
        return 'Text'
      case RecordType.Video:
        return 'Video'
      default:
        return 'CreativeWork'
    }
  }
}
</script>
