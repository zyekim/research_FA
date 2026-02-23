<script setup lang="ts"></script>

<template>
  <v-app-bar
    app
    color="primary"
    dark
  >
    <template v-slot:prepend>
      <v-app-bar-nav-icon>
        <v-icon>mdi-menu</v-icon>
      </v-app-bar-nav-icon>
    </template>
    <v-app-bar-title>Vue 3 + Vuetify 3</v-app-bar-title>
    <v-spacer></v-spacer>
    <v-btn>회원명</v-btn>
  </v-app-bar>
</template>

<style scoped lang="scss"></style>
