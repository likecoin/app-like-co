<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component({
  fetch(ctx) {
    ctx.redirect(302, ctx.localeLocation({ name: 'airdrop-check' })!)
  },
})
export default class AirdropPage extends Vue {}
</script>
