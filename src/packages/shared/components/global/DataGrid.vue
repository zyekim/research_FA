<script setup lang="ts">
/**
 * AppGrid.vue — AG-Grid Community 래퍼 컴포넌트
 * 사용 기능: 전체선택, 페이징, 외부필터, 클릭액션, row액션, 인라인 에디터,
 *            Master-Detail(Hierarchy), 업로드/다운로드
 *
 * npm i ag-grid-community ag-grid-vue3
 */
import { AgGridVue } from "ag-grid-vue3";
import type {
  GridApi,
  GridReadyEvent,
  ColDef,
  RowSelectedEvent,
  CellClickedEvent,
  IDetailCellRendererParams,
} from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

// ── Community 모듈 등록 ──────────────────────────────────────────────
ModuleRegistry.registerModules([AllCommunityModule]);

// ── Props / Emits ────────────────────────────────────────────────────
interface Props {
  rowData: Record<string, any>[];
  columnDefs: ColDef[];
  /** Master-Detail 활성화 여부 */
  masterDetail?: boolean;
  /** 상세 행 컬럼 정의 (masterDetail: true 시 사용) */
  detailColumnDefs?: ColDef[];
  /** 상세 행 데이터 접근 키 */
  detailDataKey?: string;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  masterDetail: false,
  detailColumnDefs: () => [],
  detailDataKey: "children",
  loading: false,
});

const emit = defineEmits<{
  rowClick: [row: Record<string, any>];
  selectionChanged: [rows: Record<string, any>[]];
  upload: [file: File];
}>();

// ── Grid API ─────────────────────────────────────────────────────────
const gridApi = ref<GridApi | null>(null);
const selectedRows = ref<Record<string, any>[]>([]);

function onGridReady(params: GridReadyEvent) {
  gridApi.value = params.api;
  params.api.sizeColumnsToFit();
}

// ── 1. 전체 체크 / 비활성화 제외 ─────────────────────────────────────
// isRowSelectable: disabled 필드가 true인 행은 선택 불가
function isRowSelectable(row: any) {
  return !row.data?.disabled;
}

function onSelectionChanged() {
  selectedRows.value = gridApi.value?.getSelectedRows() ?? [];
  emit("selectionChanged", selectedRows.value);
}

function selectAll() {
  gridApi.value?.forEachNode((node) => {
    if (!node.data?.disabled) node.setSelected(true);
  });
}

function clearSelection() {
  gridApi.value?.deselectAll();
}

// ── 2. 페이징 ────────────────────────────────────────────────────────
const pagination = true;
const paginationPageSize = 20;
const paginationPageSizeSelector = [10, 20, 50, 100];

// ── 3. 외부 필터 (검색/셀렉트/날짜) ──────────────────────────────────
const searchText = ref("");
const statusFilter = ref("");
const dateFrom = ref("");
const dateTo = ref("");

// 외부 필터를 AG-Grid externalFilter에 연결
function isExternalFilterPresent() {
  return !!(
    searchText.value ||
    statusFilter.value ||
    dateFrom.value ||
    dateTo.value
  );
}

function doesExternalFilterPass(node: any) {
  const d = node.data;
  if (!d) return true;

  // 텍스트 검색 (전 컬럼 대상)
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase();
    const matched = Object.values(d).some((v) =>
      String(v ?? "")
        .toLowerCase()
        .includes(keyword)
    );
    if (!matched) return false;
  }

  // 상태 셀렉트
  if (statusFilter.value && d.status !== statusFilter.value) return false;

  // 날짜 범위
  if (dateFrom.value && d.date < dateFrom.value) return false;
  if (dateTo.value && d.date > dateTo.value) return false;

  return true;
}

function applyFilter() {
  gridApi.value?.onFilterChanged();
}

watch([searchText, statusFilter, dateFrom, dateTo], applyFilter);

function resetFilter() {
  searchText.value = "";
  statusFilter.value = "";
  dateFrom.value = "";
  dateTo.value = "";
}

// ── 4. 클릭 액션 ─────────────────────────────────────────────────────
function onCellClicked(event: CellClickedEvent) {
  // action 컬럼 클릭은 무시 (row action 담당)
  if (event.colDef.field === "_action") return;
  emit("rowClick", event.data);
}

// function onRowClicked(event: RowSelectedEvent) {
//   if (event.colDef.field === "_action") return;

//   emit("rowClick", event.data);
// }

// ── 5. Row 액션 컬럼 (더보기, 수정 등) ──────────────────────────────
// 사용처에서 columnDefs에 아래처럼 추가:
// { field: '_action', headerName: '', cellRenderer: 'ActionCell', ... }
// 여기서는 기본 actionColumnDef 헬퍼를 export

// ── 6. 인라인 에디터 컴포넌트 ────────────────────────────────────────
// AG-Grid Community에서 cellEditor로 등록해 사용
// 사용처에서 colDef에 { editable: true, cellEditor: 'agSelectCellEditor', ... } 형태로 지정

// ── 7. Master-Detail (Hierarchy) ────────────────────────────────────
const detailCellRendererParams = computed<Partial<IDetailCellRendererParams>>(
  () => ({
    detailGridOptions: {
      columnDefs: props.detailColumnDefs,
      defaultColDef: { flex: 1 },
    },
    getDetailRowData: (params: any) => {
      params.successCallback(params.data[props.detailDataKey] ?? []);
    },
  })
);

// ── 8. 업로드 / 다운로드 ─────────────────────────────────────────────
const uploadInput = ref<HTMLInputElement | null>(null);

function triggerUpload() {
  uploadInput.value?.click();
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) emit("upload", file);
}

function exportCsv() {
  gridApi.value?.exportDataAsCsv({
    fileName: `export_${new Date().toISOString().slice(0, 10)}.csv`,
  });
}

// ── 기본 ColDef ───────────────────────────────────────────────────────
const defaultColDef: ColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  minWidth: 100,
};

// 체크박스 컬럼 (첫 번째로 자동 삽입)
const checkboxCol: ColDef = {
  colId: "checkbox",
  headerCheckboxSelection: false, // 전체선택은 직접 버튼으로
  checkboxSelection: true,
  width: 48,
  minWidth: 48,
  maxWidth: 48,
  pinned: "left",
  resizable: false,
  sortable: false,
  filter: false,
  lockPosition: true,
};

const mergedColDefs = computed<ColDef[]>(() => [
  checkboxCol,
  ...props.columnDefs,
]);
</script>

<template>
  <div class="app-grid-wrap">
    <!-- ── 3. 외부 필터 영역 ── -->
    <div class="ag-filter-bar">
      <div class="ag-filter-group">
        <div class="ag-filter-item">
          <label>검색</label>
          <input
            v-model="searchText"
            class="ag-input"
            placeholder="전체 검색..."
            type="text"
          />
        </div>

        <div class="ag-filter-item">
          <label>상태</label>
          <select
            v-model="statusFilter"
            class="ag-select"
          >
            <option value="">전체</option>
            <option value="active">활성</option>
            <option value="pending">대기</option>
            <option value="closed">완료</option>
          </select>
        </div>

        <div class="ag-filter-item">
          <label>날짜 (from)</label>
          <input
            v-model="dateFrom"
            class="ag-input"
            type="date"
          />
        </div>
        <div class="ag-filter-item">
          <label>날짜 (to)</label>
          <input
            v-model="dateTo"
            class="ag-input"
            type="date"
          />
        </div>
      </div>

      <div class="ag-filter-actions">
        <button
          class="btn btn-ghost"
          @click="resetFilter"
        >
          초기화
        </button>
      </div>
    </div>

    <!-- ── 툴바 (선택 / 업로드 / 다운로드) ── -->
    <div class="ag-toolbar">
      <div class="ag-toolbar-left">
        <!-- 1. 전체 체크 -->
        <button
          class="btn btn-outline"
          @click="selectAll"
        >
          전체 선택
        </button>
        <button
          class="btn btn-ghost"
          @click="clearSelection"
        >
          선택 해제
        </button>
        <span
          v-if="selectedRows.length"
          class="ag-selected-count"
        >
          {{ selectedRows.length }}건 선택됨
        </span>
      </div>

      <div class="ag-toolbar-right">
        <!-- 8. 업로드 -->
        <input
          ref="uploadInput"
          hidden
          type="file"
          accept=".xlsx,.csv"
          @change="onFileChange"
        />
        <button
          class="btn btn-outline"
          @click="triggerUpload"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line
              x1="12"
              y1="3"
              x2="12"
              y2="15"
            />
          </svg>
          업로드
        </button>

        <!-- 8. 다운로드 -->
        <button
          class="btn btn-primary"
          @click="exportCsv"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line
              x1="12"
              y1="15"
              x2="12"
              y2="3"
            />
          </svg>
          CSV 다운로드
        </button>
      </div>
    </div>

    <!-- ── AG-Grid 본체 ── -->
    <div
      class="ag-grid-container"
      :class="{ loading }"
    >
      <AgGridVue
        class="ag-theme-app"
        :row-data="rowData"
        :column-defs="mergedColDefs"
        :default-col-def="defaultColDef"
        :pagination="pagination"
        :pagination-page-size="paginationPageSize"
        :pagination-page-size-selector="paginationPageSizeSelector"
        :row-selection="{ mode: 'multiRow', checkboxes: true }"
        :is-row-selectable="isRowSelectable"
        :is-external-filter-present="isExternalFilterPresent"
        :does-external-filter-pass="doesExternalFilterPass"
        :master-detail="masterDetail"
        :detail-cell-renderer-params="
          masterDetail ? detailCellRendererParams : undefined
        "
        :loading="loading"
        animate-rows
        suppress-row-click-selection
        @grid-ready="onGridReady"
        @selection-changed="onSelectionChanged"
        @cell-clicked="onCellClicked"
      />
    </div>
  </div>
</template>

<style scoped>
/* ── 변수 ── */
.app-grid-wrap {
  --c-bg: #ffffff;
  --c-surface: #f8f9fc;
  --c-border: #e2e6ef;
  --c-primary: #2563eb;
  --c-primary-hover: #1d4ed8;
  --c-text: #1e293b;
  --c-text-muted: #64748b;
  --c-danger: #ef4444;
  --c-row-hover: #f1f5fd;
  --c-row-selected: #eff6ff;
  --c-header-bg: #f1f5f9;
  --radius: 8px;
  --font: "Pretendard", "Noto Sans KR", sans-serif;
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  background: var(--c-bg);
  overflow: hidden;
  color: var(--c-text);
  font-size: 13px;

  font-family: var(--font);
}

/* ── 필터 바 ── */
.ag-filter-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  border-bottom: 1px solid var(--c-border);
  background: var(--c-surface);
  padding: 14px 16px;
}

.ag-filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ag-filter-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ag-filter-item label {
  color: var(--c-text-muted);
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.ag-input,
.ag-select {
  transition: border-color 0.15s;
  outline: none;
  border: 1px solid var(--c-border);
  border-radius: 6px;
  background: var(--c-bg);
  padding: 0 10px;
  min-width: 140px;
  height: 32px;
  color: var(--c-text);
  font-size: 13px;
}

.ag-input:focus,
.ag-select:focus {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  border-color: var(--c-primary);
}

.ag-filter-actions {
  display: flex;
  gap: 6px;
}

/* ── 툴바 ── */
.ag-toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--c-border);
  background: var(--c-bg);
  padding: 8px 16px;
}

.ag-toolbar-left,
.ag-toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ag-selected-count {
  padding: 0 6px;
  color: var(--c-primary);
  font-weight: 600;
  font-size: 12px;
}

/* ── 버튼 ── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 0 14px;
  height: 32px;
  font-weight: 500;
  font-size: 13px;
  white-space: nowrap;
}

.btn-primary {
  border-color: var(--c-primary);
  background: var(--c-primary);
  color: #fff;
}
.btn-primary:hover {
  background: var(--c-primary-hover);
}

.btn-outline {
  border-color: var(--c-border);
  background: transparent;
  color: var(--c-text);
}
.btn-outline:hover {
  border-color: var(--c-primary);
  color: var(--c-primary);
}

.btn-ghost {
  background: transparent;
  color: var(--c-text-muted);
}
.btn-ghost:hover {
  background: var(--c-surface);
  color: var(--c-text);
}

/* ── 그리드 컨테이너 ── */
.ag-grid-container {
  position: relative;
  width: 100%;
  height: 560px;
}
.ag-grid-container.loading::after {
  position: absolute;
  z-index: 10;
  inset: 0;
  background: rgba(255, 255, 255, 0.6);
  content: "";
}

/* ── AG-Grid 테마 오버라이드 ── */
.ag-theme-app {
  --ag-font-family: var(--font);
  --ag-font-size: 13px;
  --ag-border-color: var(--c-border);
  --ag-row-border-color: var(--c-border);
  --ag-background-color: var(--c-bg);
  --ag-odd-row-background-color: var(--c-bg);
  --ag-header-background-color: var(--c-header-bg);
  --ag-header-foreground-color: var(--c-text);
  --ag-header-height: 40px;
  --ag-row-height: 42px;
  --ag-cell-horizontal-padding: 14px;
  --ag-row-hover-color: var(--c-row-hover);
  --ag-selected-row-background-color: var(--c-row-selected);
  --ag-checkbox-checked-color: var(--c-primary);
  --ag-range-selection-border-color: var(--c-primary);
  --ag-input-focus-border-color: var(--c-primary);
  --ag-icon-font-color: var(--c-text-muted);
  --ag-pagination-button-color: var(--c-primary);
  --ag-border-radius: 0px;
  width: 100%;
  height: 100%;
}

/* 헤더 폰트 굵기 */
:deep(.ag-header-cell-text) {
  color: var(--c-text-muted);
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

/* 페이지네이션 스타일 */
:deep(.ag-paging-panel) {
  border-top: 1px solid var(--c-border);
  padding: 0 16px;
  height: 44px;
  color: var(--c-text-muted);
  font-size: 12px;
}

/* 비활성화 행 */
:deep(.ag-row.row-disabled) {
  opacity: 0.45;
  pointer-events: none;
}

/* 셀 포커스 아웃라인 */
:deep(.ag-cell-focus) {
  border: 1px solid var(--c-primary) !important;
}

/* detail 패널 */
:deep(.ag-details-row) {
  background: #f8faff;
  padding: 0 16px 12px;
}
</style>
