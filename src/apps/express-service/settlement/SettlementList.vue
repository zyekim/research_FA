<script setup lang="ts">
import { usePagingStore } from "@/packages/common/store/pagingStore";
const pagingStore = usePagingStore();

const { pageLim, pageNo } = storeToRefs(pagingStore);
import { useSTLMStore } from "./store/STLMStore";
const stlmStore = useSTLMStore();
const { STLMList, loadingList, pageSettings, searchData } =
  storeToRefs(useSTLMStore());

// {
//   readonly key?:
//     | (string & {})
//     | 'data-table-group'
//     | 'data-table-select'
//     | 'data-table-expand'
//     | undefined
//   readonly value?: SelectItemKey<any>
//   readonly title?: string | undefined
//   readonly fixed?: boolean | 'end' | 'start' | undefined
//   readonly align?: 'end' | 'start' | 'center' | undefined
//   readonly width?: string | number | undefined
//   readonly minWidth?: string | number | undefined
//   readonly maxWidth?: string | number | undefined
//   readonly nowrap?: boolean | undefined
//   readonly indent?: number | undefined
//   readonly headerProps?: { readonly [x: string]: any } | undefined
//   readonly cellProps?:
//     | { readonly [x: string]: any }
//     | HeaderCellPropsFunction
//     | undefined
//   readonly sortable?: boolean | undefined
//   readonly sort?: DataTableCompareFunction<any> | undefined
//   readonly sortRaw?: DataTableCompareFunction<any> | undefined
//   readonly filter?: FilterFunction | undefined
//   readonly children?: readonly any[] | undefined
// }[]
const headerCols = ref([
  {
    key: "rowNum",
    title: "NO",
    sortable: false,
    align: "center",
    width: "20px",
  },
  {
    key: "settlementDate",
    title: "정산등록일자",
    sortable: false,
    align: "center",
    width: "120px",
  },
  {
    key: "settlementHeaderCode",
    title: "정산코드",
    sortable: false,
    align: "center",
  },
  {
    key: "shippingRegDate",
    title: "접수일자",
    sortable: false,
    align: "center",
    width: "120px",
  },
  {
    key: "transportType",
    title: "운송타입/운송사/배송사",
    sortable: false,
    align: "center",
    width: "180px",
    value: (item: any) => {
      return `${item.transportType}/${item.carrierCode}/${item.shippingCompanyCode}`;
    },
  },
  {
    key: "invoiceNo",
    title: "운송장번호",
    sortable: false,
    align: "center",
    value: (item: any) => {
      return item.invoiceNo || "-";
    },
  },
  {
    key: "realWeight",
    title: "실측/부피중량",
    sortable: false,
    align: "center",
    width: "110px",
    value: (item: any) => {
      return `${item.realWeight || "-"}/${item.volumeWeight || "-"}`;
    },
  },
  {
    key: "chargeableWeight",
    title: "적용중량",
    sortable: false,
    align: "center",
    width: "90px",
  },
  {
    key: "currencyCode",
    title: "통화",
    sortable: false,
    align: "center",
    width: "50px",
  },
  {
    key: "localShippingFee",
    title: "현지운송비",
    sortable: false,
    align: "end",
    width: "100px",
  },
  {
    key: "shippingFee",
    title: "운송비",
    sortable: false,
    align: "end",
    width: "90px",
  },
  {
    key: "extraFee",
    title: "추가비용",
    sortable: false,
    align: "end",
    width: "100px",
  },
  {
    key: "fuelSurcharge",
    title: "유류할증료",
    sortable: false,
    align: "end",
    width: "110px",
  },
  {
    key: "extraShippingFee",
    title: "추가운송비",
    sortable: false,
    align: "end",
    width: "110px",
  },
  {
    key: "tax",
    title: "관세",
    sortable: false,
    align: "end",
    width: "90px",
  },
  {
    key: "inspectionFee",
    title: "검사비용",
    sortable: false,
    align: "end",
    width: "100px",
  },
  {
    key: "extraTax",
    title: "기타세액",
    sortable: false,
    align: "end",
    width: "100px",
  },
  {
    key: "extraFee",
    title: "기타비용",
    sortable: false,
    align: "end",
    width: "100px",
  },
  {
    key: "totalAmount",
    title: "총 비용",
    sortable: false,
    align: "end",
    width: "90px",
  },
] as const);

import { AccessTokenKey } from "@/packages/utils/helper/constant";
import { useAuthStore } from "@/packages/auth/store/authStore";
const authStore = useAuthStore();

const tempLogin = () => {
  authStore.login("jh.kim@weaving.co.kr", "1234", false);
};

// paging Change
const loadItems = async ({
  page,
  itemsPerPage,
  sortBy,
}: {
  page: number;
  itemsPerPage: number;
  sortBy: any;
}) => {
  loadingList.value = true;
  await stlmStore.getList(page, itemsPerPage);
};

const onChangePage = async (page: number, type: string) => {
  loadingList.value = true;
  pageSettings.value.currentPage = page;
  stlmStore.getList(page, pageSettings.value.pageSize);
};

const onChangePageSize = async (size: number, type: string) => {
  loadingList.value = true;
  pageSettings.value.pageSize = size;
  pageSettings.value.currentPage = 1;
  stlmStore.getList(1, size);
};

onMounted(async () => {
  // tempLogin();
  // await nextTick();
  // if (localStorage.getItem(AccessTokenKey)) {
  const result = await stlmStore.getList();
  // }
});
const selectAll = ref(false);
const selected = ref([]);
</script>
<template>
  <v-btn
    color="blue"
    @click="tempLogin"
    >로그인</v-btn
  >
  <v-defaults-provider :defaults="{ VCheckboxBtn: { density: 'compact' } }">
    <v-data-table-server
      v-model:items-per-page="pageLim"
      v-model:page="pageNo"
      :loading="loadingList"
      :headers="headerCols"
      :items="STLMList"
      height="60vh"
      hide-default-footer
      :itemsLength="pageSettings.totalPage"
      v-model:select-all="selectAll"
      v-model:selected="selected"
      :item-selectable="(item: any) => item.shippingCompanyCode != 'KR002'"
      show-select
      item-value="rowNum"
    >
      <template #top="{ selectAll }">
        <div class="action-bar">
          <v-select
            label="운송사"
            v-model="searchData.carrierCodes"
          ></v-select>
          <v-text-field
            label="조회기간(시작)"
            v-model="searchData.dateFrom"
            :clearable="false"
            type="date"
            @update:model-value="stlmStore.getList(1)"
          ></v-text-field>
          <v-text-field
            label="조회기간(종료)"
            v-model="searchData.dateTo"
            :clearable="false"
            type="date"
            @update:model-value="stlmStore.getList(1)"
          ></v-text-field>
        </div>
      </template>
      <template #item.data-table-expand="{ item }">
        <v-expand-transition>
          {{ item.measurementUnit }}
        </v-expand-transition>
      </template>
      <template #bottom="{ page, itemsPerPage, sortBy }">
        <pagingComp
          :model-value="page"
          class="mt-0 pb-12"
          :page-size="itemsPerPage"
          :totalPage="pageSettings.totalPage"
          @update:model-value="onChangePage"
          @update:pageSize="onChangePageSize"
        ></pagingComp>
      </template>
    </v-data-table-server>
  </v-defaults-provider>
</template>
<style lang="scss">
.v-data-table.v-table.v-table--fixed-header {
  .v-table__wrapper > table {
    tbody > tr > td,
    thead > tr > th {
      vertical-align: middle;
      font-size: 12px;
      &:has(.v-selection-control) {
        padding-inline: 6px;
        width: 32px !important;
      }
    }
    thead > tr > th {
      background-color: #f5f5f5;
      color: #424145;
      font-weight: 700;
      font-size: 13px;
    }
  }
  .ws-pagingComp {
    border-top: 1px solid #ddd;
  }
}

.action-bar {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #ddd;
  padding: 15px 10px;
  > .v-input {
    flex: 0 1 145px;
  }
}
</style>
