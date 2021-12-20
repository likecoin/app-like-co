<template>
  <AirdropMissions
    v-if="claimmableAddress"
    key="missions"
    :address="claimmableAddress"
  />
  <div
    v-else
    key="error"
    v-t="'error.not.connect.wallet'"
  />
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

const signerModule = namespace('signer')

@Component({
  layout: 'wallet',
})
export default class AirdropMissionsPage extends Vue {
  @signerModule.Getter('getAddress') claimmableAddress!: string
}
</script>
