import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

import DefaultLayout from "@/packages/layouts/DefaultLayout.vue";
import BlankLayout from "@/packages/layouts/BlankLayout.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/invalid",
    component: () => import("@auth/404Error.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import("@auth/404Error.vue"),
    meta: { layout: BlankLayout },
  },
  {
    path: "/",
    component: () => import("@/packages/dashboard/Home.vue"),
    name: "home",
    meta: { layout: DefaultLayout, title: "홈 대시보드" },
  },
  {
    path: "/order",
    component: () => import("@/apps/express-service/views/order/OrderList.vue"),
    name: "orderList",
    meta: { layout: DefaultLayout, title: "주문 목록" },
  },
  {
    path: "/delivery-order",
    component: () =>
      import("@/apps/express-service/views/deliveryOrder/DOList.vue"),
    name: "deliveryOrder",
    meta: { layout: DefaultLayout, title: "D/O 목록" },
  },
  {
    path: "/packing",
    component: () =>
      import("@/apps/express-service/views/packing/PackingList.vue"),
    name: "packing",
    meta: { layout: DefaultLayout, title: "패킹리스트" },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      // always scroll to top
      return { top: 0 };
    }
  },
});

export default router;
