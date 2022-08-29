<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component({
  fetch({ redirect, query, localeLocation }) {
    redirect(localeLocation({ name: 'nft-url', query })!);
  },
})
export default class NFTPortalPage extends Vue {}
</script>
