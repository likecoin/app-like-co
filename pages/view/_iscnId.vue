<template>
  <div class="container flex flex-col items-center mx-auto">
    <div v-if="!record">
      {{ $t('general.loading') }}
    </div>
    <div v-else>
      <img v-if="imgSrc" ref="iscnImg" class="max-w-md" :src="imgSrc">
      <ul>
        <li>{{ $t('iscn.meta.id') }} {{ iscnId }}</li>
        <li>{{ $t('iscn.meta.notes') }} {{ record.recordNotes }}</li>
        <li>{{ $t('iscn.meta.content.fingerprints') }} {{ record.contentFingerprints }}</li>
        <li>{{ $t('iscn.meta.owner') }} {{ owner }}</li>
      </ul>
      <div v-if="exifInfo">
        <h3>{{ $t('iscn.meta.exif') }}</h3>
        <div><pre>{{ exifInfo }}</pre></div>
      </div>
      <ul>
        <li>{{ $t('iscn.meta.type') }} {{ metadata['@type'] }}</li>
        <li>{{ $t('iscn.meta.title') }} {{ metadata.title }}</li>
        <li>{{ $t('iscn.meta.description') }} {{ metadata.description }}</li>
        <li>{{ $t('iscn.meta.version') }} {{ metadata.version }}</li>
        <li>{{ $t('iscn.meta.url') }} {{ metadata.url }}</li>
        <li>{{ $t('iscn.meta.keywords') }} {{ metadata.keywords }}</li>
        <li>{{ $t('iscn.meta.usage.info') }} {{ metadata.usageInfo }}</li>
      </ul>
      <div>
        <div>{{ $t('iscn.meta.stakeholders') }}</div>
        <div v-for="s in record.stakeholders" :key=s.entity.id>
          <div>{{ $t('iscn.meta.stakeholders.id') }} {{ s.entity.id }}</div>
          <div>{{ $t('iscn.meta.stakeholders.name') }} {{ s.entity.name }}</div>
          <div>{{ $t('iscn.meta.stakeholders.contribution.type') }} {{ s.contributionType }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import exifr from 'exifr'

import { isCosmosTransactionHash } from '~/utils/cosmos';
import { getIPFSUrlFromISCN } from '~/utils/cosmos/iscn/view';
import { parsedISCNRecord } from '~/utils/cosmos/iscn';
import { ISCN_PREFIX } from '~/constant';

const iscnModule = namespace('iscn')

@Component
export default class ViewIscnIdPage extends Vue {
  owner = '';
  iscnId = '';
  exifInfo = null;

  @iscnModule.Getter getISCNById!: (arg0: string) => parsedISCNRecord
  @iscnModule.Action fetchISCNById!: (arg0: string) => Promise<{
    records: parsedISCNRecord[];
    owner: string;
    latestVersion: Long.Long;
  } | null>

  @iscnModule.Action fetchISCNByTx!: (arg0: string) => Promise<{ records: parsedISCNRecord[]; }>

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

  created() {
    const { iscnId } = this.$route.params;
    if (iscnId.startsWith(ISCN_PREFIX)) {
      this.iscnId = iscnId;
    }
  }

  async mounted() {
    if (!this.iscnId) {
      const param = this.$route.params.iscnId;
      if (!isCosmosTransactionHash(param)) {
        this.$nuxt.error({ statusCode: 400, message: 'not iscn id or tx hash' });
        return;
      }
      const res = await this.fetchISCNByTx(param);
      if (!res) {
        this.$nuxt.error({ statusCode: 400, message: 'not iscn id or tx hash' });
        return;
      }
      this.iscnId = res.records[0].id;
      this.$router.replace({ params: { iscnId: this.iscnId }});
    }
    if (!this.getISCNById(this.iscnId) || !this.owner) {
      const res = await this.fetchISCNById(this.iscnId);
      if (res) this.owner = res.owner;
    }
     if (!this.getISCNById(this.iscnId)) {
      this.$nuxt.error({ statusCode: 404, message: 'iscn id not found' })
     }
  }

  @Watch('imgSrc')
  onImgSrcChanged() {
    this.$nuxt.$nextTick(async () => {
      const imgElement = this.$refs.iscnImg;
      if (imgElement) this.exifInfo = await exifr.parse(imgElement as HTMLImageElement);
    });
  }
}
</script>
