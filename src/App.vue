<script setup lang="ts">
import DefaultLayout from "@/packages/layouts/DefaultLayout.vue";
const route = useRoute();
const layout = computed(() => {
  return route.meta.layout || DefaultLayout;
});
</script>

<template>
  <v-app>
    <component :is="layout">
      <router-view></router-view>
    </component>
  </v-app>
</template>

<style scoped></style>
