<script setup lang="ts">
import { useLayoutStore } from "@/packages/layouts/store/layout";
const layoutStore = useLayoutStore();
const { drawerRail } = storeToRefs(layoutStore);

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
  {
    title: "정산 목록",
    path: "/settlement-list",
  },
  {
    title: "재고 목록",
    path: "/stock-list",
  },
];
// watch(drawerRail, (val) => {
//   console.log(val);
// });
</script>

<template>
  <v-navigation-drawer
    color="primary"
    permanent
    width="200"
    :rail="drawerRail"
    rail-width="60"
  >
    <template #prepend> </template>
    <v-list
      nav
      v-for="(link, idx) in menuList"
      :key="idx"
      :rail="drawerRail"
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
