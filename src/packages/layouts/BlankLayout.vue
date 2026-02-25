<script lang="ts" setup></script>
<template>
  <v-layout> <router-view></router-view> </v-layout>
</template>
<style lang="scss">
.pageWrap {
  padding: 30px;
  height: calc(100vh - 64px);
  &__title {
    font-weight: 700;
    font-size: 24px;
  }
  &__inner {
    min-width: 1600px;
    height: 100%;
    .v-container {
      margin-top: 20px;
      border-radius: 12px;
      height: calc(100% - 49px);
    }
  }
}
</style>
