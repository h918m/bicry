<script setup lang="ts">
definePageMeta({
  layout: 'nav',
})

const frontendStore = useFrontendStore()
const sectionsMap = ref<Record<string, any>>({})

onMounted(async () => {
  if (frontendStore.sections.length === 0) {
    await frontendStore.fetchSections()
  }
  frontendStore.sections.forEach((section: any) => {
    sectionsMap.value[section.section] = section
  })
})

const isBannerVisible = computed(
  () => sectionsMap.value.banner?.status ?? false,
)
const isFeaturesVisible = computed(
  () => sectionsMap.value.features?.status ?? false,
)
const isMarketsVisible = computed(
  () => sectionsMap.value.markets?.status ?? false,
)
const isOnboardingVisible = computed(
  () => sectionsMap.value.steps?.status ?? false,
)
const isFooterVisible = computed(
  () => sectionsMap.value.footer?.status ?? false,
)
const isAnimatedBgVisible = computed(
  () => sectionsMap.value.animated_bg?.status ?? false,
)
</script>

<template>
  <div class="relative">
    <div class="animated-bg flex-col w-full">
      <FrontendAnimatedBg v-if="isAnimatedBgVisible" />
      <FrontendBanner v-if="isBannerVisible" />
      <FrontendMarkets v-if="isMarketsVisible" />
      <FrontendFeatures v-if="isFeaturesVisible" />
      <FrontendOnboarding v-if="isOnboardingVisible" />
      <FrontendFooter v-if="isFooterVisible" />
    </div>
  </div>
</template>
