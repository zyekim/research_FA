<script setup lang="ts">
const menuList = [
  {
    title: "홈 대시보드",
    path: "/",
    icon: "home",
  },
  {
    title: "주문",
    icon: "mdi:mdi-sticker-emoji",
    children: [
      {
        title: "주문 목록",
        path: "/order",
      },
      {
        title: "주문 상세",
        path: "/order/:id",
      },
    ],
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
  <v-navigation-drawer color="primary">
    <v-list
      nav
      v-for="(link, idx) in menuList"
      :key="idx"
    >
      <v-list-group
        v-if="link.children"
        expand-icon="custom:arrowDown"
        collapse-icon="custom:arrowUp"
      >
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            :prepend-icon="link.icon"
          >
            {{ link.title }}
          </v-list-item>
        </template>
        <v-list-item
          v-for="(child, idx) in link.children"
          :key="idx"
          link
          :to="child.path"
        >
          <!-- :class="{ active: route.fullPath == child.urlPath }" -->
          {{ child.title }}
        </v-list-item>
      </v-list-group>
      <v-list-item
        v-else
        link
        :to="link.path"
        :prepend-icon="link.icon"
      >
        {{ link.title }}
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped lang="scss"></style>
