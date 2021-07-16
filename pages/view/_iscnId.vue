<template>
  <div class="container flex flex-col items-center mx-auto">
    <div v-if="!record">
      Loading
    </div>
    <div v-else>
      <img v-if="imgSrc" class="max-w-md" :src="imgSrc">
      <ul>
        <li>iscnId: {{ iscnId }}</li>
        <li>recordNotes: {{ record.recordNotes }}</li>
        <li>contentFingerprints: {{ record.contentFingerprints }}</li>
      </ul>
      <ul>
        <li>Type: {{ metadata['@type'] }}</li>
        <li>Title: {{ metadata.title }}</li>
        <li>Description: {{ metadata.description }}</li>
        <li>version: {{ metadata.version }}</li>
        <li>url: {{ metadata.url }}</li>
        <li>keywords: {{ metadata.keywords }}</li>
        <li>usageInfo: {{ metadata.usageInfo }}</li>
      </ul>
      <div>
        Stakeholders:
        <div v-for="s in record.stakeholders" :key=s.entity.id>
          <div>id: {{ s.entity.id }}</div>
          <div>Name: {{ s.entity.name }}</div>
          <div>contributionType: {{ s.contributionType }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import { getIPFSUrlFromISCN } from '~/utils/cosmos/iscn/view';
import { parsedISCNRecord } from '~/utils/cosmos/iscn';

const iscnModule = namespace('iscn')

@Component
export default class ViewIscnIdPage extends Vue {
  @iscnModule.Getter getISCNById!: (arg0: string) => parsedISCNRecord
  @iscnModule.Action fetchISCNById!: (arg0: string) => Promise<parsedISCNRecord[]>
  get iscnId() {
    return this.$route.params.iscnId;
  }

  get record() {
    return this.getISCNById(this.iscnId)?.data;
  }

  get metadata() {
    return this.record && (this.record as any).contentMetadata;
  }

  get type() {
    return this.metadata && this.metadata['@type'];
  }

  get imgSrc() {
    return (this.type === 'Image' || this.type === 'Photo') && getIPFSUrlFromISCN(this.getISCNById(this.iscnId));
  }

  async mounted() {
    if (!this.getISCNById(this.iscnId)) {
      await this.fetchISCNById(this.iscnId);
    }
     if (!this.getISCNById(this.iscnId)) {
      this.$nuxt.error({ statusCode: 404, message: 'iscn id not found' })
     }
  }
}
</script>
