<template>
  <div>
    <IconImage v-if="recordType === 'Image'" />
    <IconText v-if="recordType === 'Text'" />
    <IconVideo v-if="recordType === 'Video'" />
    <IconCreativeContent v-if="recordType === 'CreativeContent'" />
  </div>
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
  CreativeContent = 'CreativeContent',
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
        return 'CreativeContent'
    }
  }
}
</script>
