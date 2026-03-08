<script setup lang="ts">
import type { ColDef, ICellRendererParams } from "ag-grid-community";

// ── 모달 상태 ─────────────────────────────────────────────
const modalOpen = ref(false);
const selectedShipment = ref<any>(null);

function openDetail(row: any) {
  selectedShipment.value = row;
  modalOpen.value = true;
}

const loading = ref(false);

const ActionCell = {
  setup(props: { params: ICellRendererParams }) {
    const row = props.params.data;

    return () =>
      h("div", { style: "display:flex;gap:6px;align-items:center;" }, [
        h(
          "button",
          {
            class: "row-btn row-btn--edit",
            onClick: (e: Event) => {
              e.stopPropagation();
              alert(`수정: ${row.hawb}`);
            },
          },
          "수정"
        ),
        h(
          "button",
          {
            class: "row-btn row-btn--more",
            onClick: (e: Event) => {
              e.stopPropagation();
              openDetail(row);
            },
          },
          "상세"
        ),
      ]);
  },
};

const StatusCell = {
  setup(props: { params: ICellRendererParams }) {
    const statusMap: Record<string, { label: string; color: string }> = {
      active: { label: "운송중", color: "#2563eb" },
      pending: { label: "대기", color: "#d97706" },
      closed: { label: "완료", color: "#16a34a" },
    };
    const s = statusMap[props.params.value] ?? {
      label: props.params.value,
      color: "#6b7280",
    };

    return () =>
      h(
        "span",
        {
          style: `
            display:inline-block;
            padding:2px 8px;
            border-radius:20px;
            font-size:11px;
            font-weight:600;
            background:${s.color}18;
            color:${s.color};
          `,
        },
        s.label
      );
  },
};

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
    status: "active",
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
    weight: 215.0,
    status: "pending",
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
    status: "closed",
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
    status: "active",
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
    pinned: "left",
  },
  {
    field: "shipper",
    headerName: "송하인",
    minWidth: 130,
    editable: true, // 6. 인라인 편집
    cellStyle: { cursor: "text" },
  },
  {
    field: "consignee",
    headerName: "수하인",
    minWidth: 130,
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
    editable: true, // 6. 인라인 셀렉트
    cellEditor: "agSelectCellEditor",
    cellEditorParams: { values: ["KE", "OZ", "DL", "UA", "LH"] },
  },
  {
    field: "date",
    headerName: "출발일",
    width: 110,
    editable: true, // 6. 날짜 인라인
    cellEditor: "agDateStringCellEditor",
  },
  {
    field: "weight",
    headerName: "중량(kg)",
    width: 100,
    type: "numericColumn",
  },
  {
    field: "status",
    headerName: "상태",
    width: 100,
    cellRenderer: StatusCell,
  },
  {
    field: "_action",
    headerName: "",
    width: 120,
    minWidth: 120,
    maxWidth: 120,
    sortable: false,
    filter: false,
    resizable: false,
    pinned: "right",
    cellRenderer: ActionCell,
  },
];
</script>
<template>
  <p>OrderList.vue</p>
  <DataGrid
    :rowData="rowData"
    :columnDefs="columnDefs"
    :loading="loading"
  ></DataGrid>
</template>
