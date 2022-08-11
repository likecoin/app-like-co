<template>
  <div
    :class="[
      'w-full',
      'max-w-[700px]',
      'flex',
      'flex-col',
      'sm:flex-row',
      'items-center',
      'justify-center',
      'px-[44px]',
      'py-[32px]',
      'my-[16px]',
      'text-medium-gray',
    ]"
  >
    <div class="flex mr-0 sm:mr-[32px]">
      <IconAttention class="mr-[12px]" />
      <IconLedger />
    </div>
    <div class="whitespace-pre-line text-dark-gray">
      {{ $t('UploadForm.attention') }}
    </div>
  </div>
</template>
