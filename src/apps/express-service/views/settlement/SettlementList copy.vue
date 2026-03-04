<script setup lang="ts">
const editItem = (item: any) => {
  window.alert("수정");
};
const fetchFromApi = () => {
  console.log("fetchFromApi");
};

const onItemUpdate = (item: any) => {
  console.log(status);
};
const myHeaders = [
  { title: "주문번호", key: "orderNumber" },
  { title: "고객명", key: "customerName" },
  { title: "상태", key: "status", editable: true },
  { title: "금액", key: "amount" },
];
const tableData = [
  { orderNumber: "1", customerName: "홍길동", status: "진행중", amount: 1000 },
  { orderNumber: "2", customerName: "김철수", status: "완료", amount: 2000 },
  { orderNumber: "3", customerName: "이영희", status: "취소", amount: 3000 },
];
const totalCount = 3;
const isLoading = false;
</script>
<template>
  <GMGrid
    :headers="myHeaders"
    :items="tableData"
    :total-items="totalCount"
    :loading="isLoading"
    :status-options="['전체', '진행중', '완료', '취소']"
    show-select
    @fetch-data="fetchFromApi"
  >
    <template #edit-status="{ item }">
      <v-select
        v-model="item.status"
        :items="['진행중', '완료', '취소']"
        density="compact"
        hide-details
        @update:model-value="onItemUpdate(item)"
      ></v-select>
    </template>

    <template #actions="{ item }">
      <v-btn
        size="small"
        icon="mdi:mdi-delete"
        color="error"
        variant="text"
      ></v-btn>
    </template>
  </GMGrid>
  <!-- <v-data-table-server
    v-model:items-per-page="itemsPerPage"
    :headers="headers"
    :items="serverItems"
    :items-length="totalItems"
    :loading="loading"
    :search="search"
    item-value="name"
    @update:options="loadItems"
  >
    <template v-slot:item.actions="{ item }">
      <v-btn
        icon
        size="small"
        @click="editItem(item)"
      >
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
    </template>
  </v-data-table-server> -->
</template>
