<template>
  <div>
    <ClientOnly>
      <PortalTarget
        name="dialog"
        multiple
      />
      <PortalTarget
        name="snackbar"
        multiple
      />
      <slot />
    </ClientOnly>
  </div>
</template>
