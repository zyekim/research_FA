<script setup lang="ts">
import { useLayoutStore } from "@/packages/layouts/store/layout";
const layoutStore = useLayoutStore();
const { drawerRail } = storeToRefs(layoutStore);

// import { AccessTokenKey } from "@/packages/utils/helper/constant";
// import { useAuthStore } from "@/packages/auth/store/authStore";
// const authStore = useAuthStore();

const tempLogin = () => {
  // authStore.login("jh.kim@weaving.co.kr", "1234", false);
};
</script>

<template>
  <v-app-bar
    app
    color="primary"
    dark
  >
    <v-app-bar-nav-icon
      width="60px"
      height="60px"
      class="ml-0"
      @click.stop="layoutStore.toggleDrawer"
    >
      <v-icon>mdi:mdi-menu</v-icon>
    </v-app-bar-nav-icon>
    <v-app-bar-title>Vue 3 + Vuetify 3</v-app-bar-title>
    <v-spacer></v-spacer>
    <v-btn prepend-icon="mdi:mdi-account">회원명</v-btn>
  </v-app-bar>
</template>

<style scoped lang="scss"></style>
