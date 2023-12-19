<script setup lang="ts">
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)
</script>

<template>
  <div
    class="bg-white dark:bg-gray-950 h-16 shadow-lg flex items-center justify-between px-5 md:px-20 w-full z-50"
  >
    <FullLogo class="h-12" v-if="$viewport.isGreaterOrEquals('xs')" />
    <Logo class="h-12" v-else />
    <div class="flex gap-2 flew-col md:flex-row z-50">
      <span v-if="$viewport.isGreaterOrEquals('md')"
        >{{
          $t('©') +
          ' ' +
          new Date().getFullYear() +
          ' ' +
          $t('All rights reserved')
        }}
        {{ settings?.site_name }}</span
      >
      <span>
        <NuxtLink
          class="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
          to="/page/terms"
        >
          {{ $t('Terms of use') }}
        </NuxtLink>
        <span class="text-gray-400 dark:text-gray-500 px-2">|</span>
        <NuxtLink
          class="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
          to="/page/privacy"
        >
          {{ $t('Privacy policy') }}
        </NuxtLink>
        <span class="text-gray-400 dark:text-gray-500 px-2">|</span>
        <NuxtLink
          class="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
          to="/page/about"
        >
          {{ $t('About') }}
        </NuxtLink>
      </span>
    </div>
  </div>
</template>
