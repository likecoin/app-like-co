<template>
  <div class="flex justify-center">
    <Button
      v-bind="$attrs"
      :preset="buttonPreset"
      :to="to"
      v-on="$listeners"
    >
      <template
        v-for="(_, slot) of $scopedSlots"
        #[slot]
      >
        <slot :name="slot" />
      </template>
    </Button>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
// eslint-disable-next-line import/no-extraneous-dependencies
import { Location } from 'vue-router'

enum Router {
  index = 'index___en',
  search = 'search-keyword___en'
}

@Component
export default class MenuButton extends Vue {
  @Prop({ default: null }) readonly to: Location | null | undefined

  get isSelected() {
    return (
      (this.to && this.to.name === this.$route.name) ||
      (this.to && this.to.name === Router.index && this.$route.name === Router.search)
    )
  }

  get buttonPreset() {
    return this.isSelected ? 'primary' : 'plain';
  }
}
</script>
