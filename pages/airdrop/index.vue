
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class AirdropPageextends extends Vue {
  mounted() {
    this.$router.push('airdrop/check')
  }
}
</script>
