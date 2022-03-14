<template>
  <span>
    <label
      :class="[
        'relative',
        'flex',
        'cursor-pointer',
      ]"
    >
      <input
        :class="[
          'absolute',
          'w-0',
          'h-0',
          'opacity-0',
          'inset',
        ]"
        type="checkbox"
        :checked="value"
        @change="handleChange"
      >
      <IconCheckBoxOn
        v-if="value"
        :class="iconClass"
      />
      <IconCheckBoxOff
        v-else
        :class="iconClass"
      />
      <slot />
    </label>
  </span>
</template>

<script>
export default {
  name: 'CheckBox',
  props: {
    value: {
      type: Boolean,
      defualt: false,
    },
  },
  computed: {
    iconClass() {
      return [
        'w-[20px]',
        'w-[20px]',
        {
          'mr-[8px]': Object.keys(this.$slots).length > 0,
        },
      ]
    },
  },
  methods: {
    handleChange(event) {
      this.$emit('input', event.target.checked)
    },
  },
}
</script>
