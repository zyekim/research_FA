<script setup lang="ts">
import { AgGridVue } from "ag-grid-vue3";
import type {
  GridApi,
  GridReadyEvent,
  ColDef,
  GridOptions,
  RowSelectedEvent,
  CellClickedEvent,
  IDetailCellRendererParams,
  ICellRendererParams,
} from "ag-grid-community";

import { AG_GRID_LOCALE_KR } from "@ag-grid-community/locale";

import {
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
} from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

const props = defineProps<{ params: ICellRendererParams }>();

// theme
const customTheme = themeQuartz.withParams({
  accentColor: "#087AD1",
  backgroundColor: "#FFFFFF",
  borderColor: "#e8ebf3",
  borderRadius: 2,
  browserColorScheme: "light",
  cellHorizontalPaddingScale: 0.7,
  chromeBackgroundColor: {
    ref: "backgroundColor",
  },
  fontSize: 13,
  foregroundColor: "#555B62",
  headerBackgroundColor: "#f1f5fa",
  headerFontSize: 13,
  headerFontWeight: 600,
  headerTextColor: "#303e67",
  headerVerticalPaddingScale: 1.2,
  headerColumnBorder: true,
  oddRowBackgroundColor: "#f9fafb",
  columnBorder: true,
  rowBorder: true,
  rowVerticalPaddingScale: 0.8,
  sidePanelBorder: true,
  spacing: 4,
  wrapperBorder: false,
  wrapperBorderRadius: 0,
  iconSize: 14,
});

const loading = ref(false);
const gridApi = ref<GridApi | null>(null);
function onGridReady(params: GridReadyEvent) {
  gridApi.value = params.api;
  params.api.sizeColumnsToFit(); // 컬럼 크기 자동 조정
}

const statusMap: Record<string, { label: string; color: string }> = {
  active: { label: "운송중", color: "#2563eb" },
  pending: { label: "대기", color: "#d97706" },
  closed: { label: "완료", color: "#16a34a" },
};

const statusCell = computed(() => {
  return (
    statusMap[props.params.value as string] ?? {
      label: props.params.value,
      color: "#6b7280",
    }
  );
});

// no indicator 컬럼
const rowData = ref([
  {
    hawb: "KE-2024-001234",
    shipper: "삼성전자(주)",
    consignee: "Samsung Elec. USA",
    origin: "ICN",
    destination: "LAX",
    carrier: "KE",
    date: "2024-03-15",
    weight: 340.5,
    status: "ACTIVE",
    disabled: false,
    children: [
      {
        pkg: "PKG-001",
        description: "OLED Panel",
        qty: 100,
        unit: "EA",
        grossWeight: 120,
      },
      {
        pkg: "PKG-002",
        description: "PCB Assembly",
        qty: 200,
        unit: "EA",
        grossWeight: 80,
      },
    ],
  },
  {
    hawb: "OZ-2024-005678",
    shipper: "LG이노텍",
    consignee: "LG Innotek America",
    origin: "ICN",
    destination: "ORD",
    carrier: "OZ",
    date: "2024-03-16",
    weight: 1215.0,
    status: "PENDING",
    disabled: false,
    children: [
      {
        pkg: "PKG-001",
        description: "Camera Module",
        qty: 500,
        unit: "EA",
        grossWeight: 215,
      },
    ],
  },
  {
    hawb: "KE-2024-009999",
    shipper: "SK하이닉스",
    consignee: "SK Hynix Inc.",
    origin: "ICN",
    destination: "SFO",
    carrier: "KE",
    date: "2024-03-10",
    weight: 88.0,
    status: "CLOSED",
    disabled: true, // 비활성화 행 (선택 불가)
    children: [],
  },
  {
    hawb: "LH-2024-000111",
    shipper: "현대모비스",
    consignee: "Hyundai Mobis EU",
    origin: "ICN",
    destination: "FRA",
    carrier: "LH",
    date: "2024-03-18",
    weight: 560.0,
    status: "ACTIVE",
    disabled: false,
    children: [
      {
        pkg: "PKG-001",
        description: "ECU Module",
        qty: 300,
        unit: "EA",
        grossWeight: 300,
      },
      {
        pkg: "PKG-002",
        description: "Sensor Kit",
        qty: 150,
        unit: "SET",
        grossWeight: 260,
      },
    ],
  },
]);
const columnDefs: ColDef[] = [
  {
    field: "hawb",
    headerName: "HAWB No.",
    minWidth: 140,
    // pinned: "left",
  },
  {
    field: "shipper",
    headerName: "송하인",
    minWidth: 130,
    editable: true,
    cellStyle: { cursor: "text" },
    resizable: true,
  },
  {
    field: "consignee",
    headerName: "수하인",
    minWidth: 130,
    resizable: true,
  },
  {
    field: "origin",
    headerName: "출발지",
    width: 90,
  },
  {
    field: "destination",
    headerName: "목적지",
    width: 90,
  },
  {
    field: "carrier",
    headerName: "항공사",
    width: 100,
    editable: true,
    cellEditor: "agSelectCellEditor", // 인라인 셀렉트
    cellEditorParams: { values: ["KE", "OZ", "DL", "UA", "LH"] },
  },
  {
    field: "date",
    headerName: "출발일",
    width: 110,
    sortable: true,
    filter: true,
    cellEditor: "agDateStringCellEditor", // 인라인 input
  },
  {
    field: "weight",
    headerName: "중량(kg)",
    headerClass: "justify-center",
    width: 100,
    type: "numericColumn",
    cellRenderer: (params: any) => {
      // comma 처리
      return params.value != 0 ? params.value.toLocaleString("ko-kr") : 0;
    },
  },
  {
    field: "status",
    headerName: "상태",
    width: 100,
    sortable: true,
    filter: true,
    resizable: false,
  },

  // {
  //   field: "_action",
  //   headerName: "",
  //   width: 120,
  //   minWidth: 120,
  //   maxWidth: 120,
  //   sortable: false,
  //   filter: false,
  //   resizable: false,
  //   pinned: "right",
  // },
];

const gridOption: GridOptions<(typeof rowData.value)[number]> = {
  defaultColDef: {
    flex: 1,
    minWidth: 90,
    filter: false,
    resizable: false,
    sortable: false,
    editable: false,
    headerClass: "justify-center",
  },

  // paging
  pagination: true,
  // locale
  localeText: AG_GRID_LOCALE_KR,
  // loading
  loading: loading.value,
  theme: customTheme,
  suppressRowClickSelection: true,
  suppressMovableColumns: true, // 컬럼 드래그시 선택영역 이동 방지
  // suppressMoveWhenColumnDragging: false, // 드래그시 이동 ghost 화면 조절
  // 체크박스
  selectionColumnDef: {
    width: 34,
    minWidth: 34,
    maxWidth: 34,
    resizable: false,
    suppressMovable: false,
    lockPinned: true,
    pinned: "left",
    headerClass: "checkbox-cell pl-9",
  },
  rowSelection: {
    mode: "multiRow",
    checkboxes: true,
    headerCheckbox: true,
    enableClickSelection: false,
    isRowSelectable: (params: any) => params.data?.status != "ACTIVE",
  },
  // 비활성화
  // rowClassRules: {
  //   "ag-row-disabled": (params: any) => {
  //     return params.data?.status == "ACTIVE";
  //   },
  // },
};
// no indicator + cellSelection -> 유료
// rowNumbers: true,
// cellSelection: true,
</script>
<template>
  <div style="height: 600px; width: 100%">
    <AgGridVue
      style="width: 100%; height: 100%"
      @grid-ready="onGridReady"
      :rowData="rowData"
      :columnDefs="columnDefs"
      :gridOptions="gridOption"
    ></AgGridVue>
  </div>
</template>
<style lang="scss">
.ag-header-cell.justify-center .ag-header-cell-label {
  justify-content: center;
}
.ag-cell:has(.ag-selection-checkbox),
.checkbox-cell {
  padding-inline: 8px;
  .ag-cell-wrapper {
    padding: 0;
  }
  .ag-selection-checkbox {
    flex: auto;
    margin: 0;
  }
}
</style>
