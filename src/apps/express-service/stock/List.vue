<script setup lang="ts">
import VxeUI from "vxe-pc-ui";
import "vxe-pc-ui/lib/style.css";
import "vxe-table/lib/style.css";
import { VxeTable, VxeColumn } from "vxe-table";
import { usePagingStore } from "@/packages/common/store/pagingStore";
import { useSTLMStore } from "../settlement/store/STLMStore";
import { useAuthStore } from "@/packages/auth/store/authStore";
import type { VxeTableInstance, VxeColumnProps } from "vxe-table";

// 스토어 연결
const pagingStore = usePagingStore();
const { pageLim, pageNo } = storeToRefs(pagingStore);

const stlmStore = useSTLMStore();
const { STLMList, loadingList, pageSettings, searchData } =
  storeToRefs(stlmStore);
const authStore = useAuthStore();

const xTable = ref<VxeTableInstance>();

/**
 * [vxe-table 컬럼 정의]
 * vxe-table은 'fixed' 속성을 통해 좌/우 열 고정이 매우 강력합니다.
 */
// VxeColumnProps에 slots 속성이 없기 때문에 커스텀 타입으로 확장합니다.
type CustomColumnProps = VxeColumnProps & {
  slots?: {
    default?: (scope: any) => string;
  };
};

const tableColumns = ref<CustomColumnProps[]>([
  { type: "checkbox", width: 50, fixed: "left", align: "center" },
  { field: "rowNum", title: "NO", width: 60, fixed: "left", align: "center" },
  {
    field: "settlementDate",
    title: "정산등록일자",
    width: 120,
    align: "center",
  },
  {
    field: "settlementHeaderCode",
    title: "정산코드",
    minWidth: 160,
    align: "center",
  },
  { field: "shippingRegDate", title: "접수일자", width: 120, align: "center" },
  {
    field: "transportCombined",
    title: "운송타입/운송사/배송사",
    width: 220,
    align: "center",
    formatter: ({ row }) =>
      `${row.transportType || "-"}/${row.carrierCode || "-"}/${row.shippingCompanyCode || "-"}`,
    // slots: {
    //   default: ({ row }) =>
    //     `${row.transportType}/${row.carrierCode}/${row.shippingCompanyCode}`,
    // },
  },
  { field: "invoiceNo", title: "운송장번호", width: 150, align: "center" },
  {
    field: "weightCombined",
    title: "실측/부피중량",
    width: 120,
    align: "center",
    formatter: ({ row }) =>
      `${row.realWeight || "-"}/${row.volumeWeight || "-"}`,
  },
  { field: "chargeableWeight", title: "적용중량", width: 90, align: "center" },
  { field: "currencyCode", title: "통화", width: 60, align: "center" },
  {
    field: "localShippingFee",
    title: "현지운송비",
    width: 110,
    align: "right",
    formatter: ({ cellValue }) => Number(cellValue).toLocaleString(),
  },
  { field: "shippingFee", title: "운송비", width: 100, align: "right" },
  {
    field: "totalAmount",
    title: "총 비용",
    width: 120,
    align: "right",
    fixed: "right",
  },
]);

// 페이징 로직 (지혜님 기존 로직 유지)
const handlePageChange = async (page: number) => {
  loadingList.value = true;
  pageSettings.value.currentPage = page;
  await stlmStore.getList(page, pageSettings.value.pageSize);
};

const handleSizeChange = async (size: number) => {
  loadingList.value = true;
  pageSettings.value.pageSize = size;
  await stlmStore.getList(1, size);
};

onMounted(async () => {
  await stlmStore.getList();
});
</script>

<template>
  <div class="stlm-vxe-container">
    <div class="action-bar d-flex align-center pa-4 bg-grey-lighten-4">
      <v-btn
        color="blue"
        size="small"
        @click="authStore.login('jh.kim@weaving.co.kr', '1234', false)"
        >로그인</v-btn
      >
      <v-divider
        vertical
        class="mx-4"
      ></v-divider>

      <v-select
        label="운송사"
        v-model="searchData.carrierCodes"
        hide-details
        density="compact"
        class="max-w-200"
      ></v-select>

      <v-text-field
        label="조회기간"
        v-model="searchData.dateFrom"
        type="date"
        hide-details
        density="compact"
        @update:model-value="stlmStore.getList(1)"
      ></v-text-field>
    </div>

    <vxe-table
      ref="xTable"
      border
      round
      stripe
      show-overflow="title"
      height="600"
      :loading="loadingList"
      :data="STLMList"
      :column-config="{ resizable: true }"
      :row-config="{ isHover: true, isCurrent: true }"
      :scroll-y="{ enabled: true, gt: 0 }"
      :checkbox-config="{
        checkMethod: ({ row }) => row.shippingCompanyCode != 'KR002',
      }"
    >
      <vxe-column
        v-for="col in tableColumns"
        :key="col.field"
        v-bind="col"
      >
        <template
          v-if="col.slots?.default"
          #default="scope"
        >
          <component :is="{ render: () => col.slots.default(scope) }" />
        </template>
      </vxe-column>
    </vxe-table>

    <div class="paging-footer d-flex justify-center py-4 border-t">
      <pagingComp
        :model-value="pageNo"
        :page-size="pageLim"
        :totalPage="pageSettings.totalPage"
        @update:model-value="handlePageChange"
        @update:pageSize="handleSizeChange"
      ></pagingComp>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.stlm-vxe-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;

  /* vxe-table 커스텀 스타일 */
  :deep(.vxe-table--header-wrapper) {
    background-color: #f5f5f5;
    .vxe-header--column {
      color: #424145;
      font-weight: 700;
    }
  }
}

.max-w-200 {
  max-width: 200px;
}

.action-bar {
  gap: 12px;
  border-bottom: 1px solid #ddd;
}
</style>
