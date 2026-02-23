<script lang="ts" setup></script>
<template>
  <v-layout>
    <AppHeader />
    <AppDrawer />
    <v-main>
      <div class="pageWrap overflow-auto">
        <div class="pageWrap__inner">
          <h3 class="pageWrap__title">{{ $route.meta.title }}</h3>
          <v-container fluid>
            <router-view></router-view>
          </v-container>
        </div>
      </div>
    </v-main>
  </v-layout>
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
      border: 4px dashed #eee;
      border-radius: 12px;
      height: calc(100% - 49px);
    }
  }
}
</style>
