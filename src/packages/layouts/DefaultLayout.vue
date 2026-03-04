<script lang="ts" setup></script>
<template>
  <v-layout>
    <AppDrawer />
    <AppHeader />
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
    .v-container {
      margin-top: 20px;
      border: 2px dashed #767676;
      border-radius: 0;
      padding: 0;
    }
  }
}
</style>
