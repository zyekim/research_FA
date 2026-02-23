<script setup lang="ts">
const menuList = [
  {
    title: "홈 대시보드",
    path: "/",
  },
  {
    title: "주문 목록",
    path: "/order",
  },
  {
    title: "D/O 목록",
    path: "/delivery-order",
  },
  {
    title: "패킹리스트",
    path: "/packing",
  },
];
</script>

<template>
  <v-navigation-drawer>
    <v-list
      nav
      v-for="(link, idx) in menuList"
      :key="idx"
    >
      <v-list-item
        link
        :to="link.path"
      >
        {{ link.title }}
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped lang="scss"></style>
