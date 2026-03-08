<script setup lang="ts">
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

import { useSTLMStore } from "../settlement/store/STLMStore";
const stlmStore = useSTLMStore();

const { STLMList, loadingList, pageSettings, searchData } =
  storeToRefs(useSTLMStore());

const fetchOrders = async ({ page, size }) => {
  const res = await stlmStore.getList(page, size);

  console.log(res);
  return {
    list: STLMList.value,
    total: pageSettings.value.totalRecordsCount,
  };
};
</script>

<template>
  <WTable
    :columns="headerCols"
    :fetch="fetchOrders"
  >
    <!-- <template #status="{ item }">
      <v-chip
        color="green"
        size="small"
      >
        {{ item.status }}
      </v-chip>
    </template> -->
  </WTable>
</template>
