<script setup lang="ts">
const props = defineProps({
  rows: { type: Array, default: () => [] },
  columns: { type: Array, required: true },
  rowKey: { type: String, default: "id" },
  loading: { type: Boolean, default: false },
  // Pagination
  pagination: { type: Boolean, default: true },
  totalCount: { type: Number, default: 0 },
  pageSize: { type: Number, default: 10 },
  currentPage: { type: Number, default: 1 },
  pageSizeOptions: { type: Array, default: () => [10, 20, 50, 100] },
  // Selection
  selectionType: { type: String, default: null },
  selectedKeys: { type: Array, default: () => [] },
  disabledKeys: { type: Array, default: () => [] },
  hideSelectAll: { type: Boolean, default: false },
  // Row Number
  rowNumber: { type: Boolean, default: false },
  // Action
  fixedAction: { type: Boolean, default: true },
  // Excel
  excelExport: { type: Boolean, default: false },
  excelFileName: { type: String, default: "export" },
  // Tree
  treeMode: { type: Boolean, default: false },
  treeChildren: { type: String, default: "children" },
  treeIndentColumn: { type: String, default: null },
  // Grouping
  groupBy: { type: String, default: null },
  // Layout
  tableMaxHeight: { type: String, default: "560px" },
  showFooter: { type: Boolean, default: false },
  showToolbar: { type: Boolean, default: true },
});

const emit = defineEmits([
  "update:currentPage",
  "update:pageSize",
  "update:selectedKeys",
  "page-change",
  "sort-change",
  "row-click",
  "selection-change",
]);

const slots = useSlots();

// ── Toolbar
const showToolbar = computed(
  () =>
    props.showToolbar &&
    (props.excelExport || !!slots["toolbar-left"] || !!slots["toolbar-right"])
);

// ── Columns
const visibleColumns = computed(() =>
  props.columns.filter((c) => c.visible !== false)
);
const hasActionSlot = computed(() => !!slots["action"]);
const totalColumns = computed(() => {
  let n = visibleColumns.value.length;
  if (props.rowNumber) n++;
  if (props.selectionType) n++;
  if (hasActionSlot.value) n++;
  return n;
});
const containerStyle = computed(() => ({
  maxHeight: props.tableMaxHeight,
  overflowY: "auto",
  overflowX: "auto",
}));

function getColStyle(col) {
  const s = {};
  if (col.width) {
    s.width = col.width;
    s.minWidth = col.width;
  }
  if (col.minWidth) s.minWidth = col.minWidth;
  if (col.align) s.textAlign = col.align;
  return s;
}

// ── Sort
const sortKey = ref(null);
const sortDir = ref("asc");
function handleSort(key) {
  if (sortKey.value === key)
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  else {
    sortKey.value = key;
    sortDir.value = "asc";
  }
  emit("sort-change", { key: sortKey.value, dir: sortDir.value });
}

// ── Tree
const expandedKeys = ref(new Set());
function flattenTree(nodes, depth = 0) {
  const result = [];
  for (const node of nodes) {
    const children = node[props.treeChildren];
    const hasChildren = children && children.length > 0;
    const k = node[props.rowKey];
    const expanded = expandedKeys.value.has(k);
    result.push({
      ...node,
      _isTree: true,
      _depth: depth,
      _hasChildren: hasChildren,
      _expanded: expanded,
    });
    if (hasChildren && expanded)
      result.push(...flattenTree(children, depth + 1));
  }
  return result;
}
function toggleTreeRow(row) {
  const k = row[props.rowKey];
  if (expandedKeys.value.has(k)) expandedKeys.value.delete(k);
  else expandedKeys.value.add(k);
  expandedKeys.value = new Set(expandedKeys.value);
}

// ── Grouping
function flattenGrouped(rows) {
  const groups = {};
  for (const row of rows) {
    const gk = String(row[props.groupBy] ?? "기타");
    if (!groups[gk]) groups[gk] = [];
    groups[gk].push(row);
  }
  const result = [];
  for (const [gk, gRows] of Object.entries(groups)) {
    result.push({
      _isGroupHeader: true,
      _groupKey: gk,
      _groupCount: gRows.length,
      [props.rowKey]: "__group__" + gk,
    });
    result.push(...gRows);
  }
  return result;
}

const flatRows = computed(() => {
  if (props.treeMode) return flattenTree(props.rows);
  if (props.groupBy) return flattenGrouped(props.rows);
  return props.rows;
});

// ── Row helpers
const radioName = `gt-radio-${Math.random().toString(36).slice(2)}`;
function getRowKey(row, idx) {
  return row[props.rowKey] ?? idx;
}
function getCellValue(row, col) {
  return col.formatter
    ? col.formatter(row[col.key], row)
    : (row[col.key] ?? "");
}
function getRowNumber(rowIdx) {
  // Count how many non-group-header rows before this index
  let dataIdx = 0;
  for (let i = 0; i <= rowIdx; i++) {
    if (!flatRows.value[i]._isGroupHeader) dataIdx++;
  }
  return (props.currentPage - 1) * props.pageSize + dataIdx;
}

// ── Selection
const internalSelected = ref(new Set(props.selectedKeys));
watch(
  () => props.selectedKeys,
  (v) => {
    internalSelected.value = new Set(v);
  }
);

function isRowSelected(row) {
  return internalSelected.value.has(row[props.rowKey]);
}
function isRowDisabled(row) {
  return props.disabledKeys.includes(row[props.rowKey]);
}

const selectableRows = computed(() =>
  flatRows.value.filter((r) => !r._isGroupHeader && !isRowDisabled(r))
);
const isAllChecked = computed(
  () =>
    selectableRows.value.length > 0 &&
    selectableRows.value.every((r) =>
      internalSelected.value.has(r[props.rowKey])
    )
);

function toggleAllSelection() {
  if (isAllChecked.value)
    selectableRows.value.forEach((r: any) =>
      internalSelected.value.delete(r[props.rowKey])
    );
  else
    selectableRows.value.forEach((r: any) =>
      internalSelected.value.add(r[props.rowKey])
    );
  emitSelection();
}
function toggleRowSelection(row: any) {
  const k = row[props.rowKey];
  if (internalSelected.value.has(k)) internalSelected.value.delete(k);
  else internalSelected.value.add(k);
  emitSelection();
}
function selectRadioRow(row: any) {
  internalSelected.value = new Set([row[props.rowKey]]);
  emitSelection();
}
function clearSelection() {
  internalSelected.value = new Set();
  emitSelection();
}
function emitSelection() {
  const keys = [...internalSelected.value];
  emit("update:selectedKeys", keys);
  emit("selection-change", keys);
}

// ── Row class
function getRowClass(row, rowIdx) {
  if (row._isGroupHeader) return [];
  const nonGroupIdx =
    flatRows.value.slice(0, rowIdx + 1).filter((r) => !r._isGroupHeader)
      .length - 1;
  return {
    "gt-tr-even": nonGroupIdx % 2 === 1,
    "gt-tr-selected": isRowSelected(row),
  };
}

// ── Row click
function handleRowClick(row) {
  if (row._isGroupHeader) return;
  emit("row-click", row);
}

// ── Pagination
const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.totalCount / props.pageSize))
);
const pageNumbers = computed(() => {
  const total = totalPages.value,
    cur = props.currentPage,
    r = 2;
  const pages = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= cur - r && i <= cur + r)) pages.push(i);
    else if (pages[pages.length - 1] !== "...") pages.push("...");
  }
  return pages;
});
function goToPage(p: any) {
  if (p < 1 || p > totalPages.value || p === props.currentPage) return;
  emit("update:currentPage", p);
  emit("page-change", { page: p, pageSize: props.pageSize });
}
function handlePageSizeChange(e: any) {
  const size = Number(e.target.value);
  emit("update:pageSize", size);
  emit("update:currentPage", 1);
  emit("page-change", { page: 1, pageSize: size });
}

// ── Tooltip
const tooltipVisible = ref(false);
const tooltipText = ref("");
const tooltipX = ref(0);
const tooltipY = ref(0);
let tooltipTimer = null;

function showTooltip(e, col, row) {
  if (col.ellipsis === false) return;
  const el = e.currentTarget;
  if (el.scrollWidth <= el.offsetWidth) return;
  clearTimeout(tooltipTimer);
  tooltipTimer = setTimeout(() => {
    tooltipText.value = getCellValue(row, col);
    tooltipX.value = e.clientX + 12;
    tooltipY.value = e.clientY + 14;
    tooltipVisible.value = true;
  }, 300);
}
function moveTooltip(e) {
  tooltipX.value = e.clientX + 12;
  tooltipY.value = e.clientY + 14;
}
function hideTooltip() {
  clearTimeout(tooltipTimer);
  tooltipVisible.value = false;
}

// ── Excel Export
async function handleExcelExport() {
  try {
    const { utils, writeFileXLSX } = await import("xlsx");
    const headers = [
      ...(props.rowNumber ? ["No"] : []),
      ...visibleColumns.value.map((c) => c.label),
    ];
    const data = flatRows.value
      .filter((r) => !r._isGroupHeader)
      .map((row, idx) => {
        const obj = {};
        if (props.rowNumber)
          obj["No"] = (props.currentPage - 1) * props.pageSize + idx + 1;
        visibleColumns.value.forEach((col) => {
          obj[col.label] = getCellValue(row, col);
        });
        return obj;
      });
    const ws = utils.json_to_sheet(data, { header: headers });
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Sheet1");
    writeFileXLSX(wb, `${props.excelFileName}.xlsx`);
  } catch (e) {
    alert("xlsx 패키지가 필요합니다: pnpm add xlsx");
  }
}
</script>

<template>
  <div class="gt-wrapper">
    <!-- Toolbar -->
    <div
      class="gt-toolbar"
      v-if="showToolbar"
    >
      <div class="gt-toolbar-left">
        <slot name="toolbar-left" />
      </div>
      <div class="gt-toolbar-right">
        <slot name="toolbar-right" />
        <button
          v-if="excelExport"
          class="gt-btn gt-btn-export"
          @click="handleExcelExport"
          :disabled="loading"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Excel 내보내기
        </button>
      </div>
    </div>

    <!-- Table Container -->
    <div
      class="gt-container"
      :style="containerStyle"
      ref="containerRef"
    >
      <table
        class="gt-table"
        ref="tableRef"
      >
        <thead class="gt-thead">
          <tr>
            <th
              v-if="rowNumber"
              class="gt-th gt-th-rn"
            >
              No
            </th>
            <th
              v-if="selectionType === 'checkbox'"
              class="gt-th gt-th-sel"
            >
              <label
                class="gt-checkbox-wrap"
                v-if="!hideSelectAll"
              >
                <input
                  type="checkbox"
                  class="gt-checkbox"
                  :checked="isAllChecked"
                  ref="allCheckRef"
                  @change="toggleAllSelection"
                />
              </label>
            </th>
            <th
              v-if="selectionType === 'radio'"
              class="gt-th gt-th-sel"
            >
              <button
                class="gt-clear-btn"
                title="선택 해제"
                @click="clearSelection"
              >
                ✕
              </button>
            </th>
            <th
              v-for="col in visibleColumns"
              :key="col.key"
              class="gt-th"
              :class="{
                'gt-th-sortable': col.sortable,
                'gt-sorted-asc': sortKey == col.key && sortDir == 'asc',
                'gt-sorted-desc': sortKey == col.key && sortDir == 'desc',
              }"
              :style="getColStyle(col)"
              @click="col.sortable ? handleSort(col.key) : null"
            >
              <div class="gt-th-inner">
                <span>{{ col.label }}</span>
                <span
                  v-if="col.sortable"
                  class="gt-sort-icon"
                >
                  <svg
                    v-if="sortKey != col.key"
                    width="8"
                    height="12"
                    viewBox="0 0 8 12"
                    fill="currentColor"
                    opacity=".35"
                  >
                    <path d="M4 0L0 4h8L4 0zM4 12L0 8h8l-4 4z" />
                  </svg>
                  <svg
                    v-else-if="sortDir == 'asc'"
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="currentColor"
                  >
                    <path d="M4 0L0 8h8z" />
                  </svg>
                  <svg
                    v-else
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="currentColor"
                  >
                    <path d="M4 8L0 0h8z" />
                  </svg>
                </span>
              </div>
            </th>
            <th
              v-if="hasActionSlot"
              class="gt-th gt-th-action"
              :class="{ 'gt-fixed-right': fixedAction }"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="gt-tbody">
          <template v-if="loading">
            <tr>
              <td
                :colspan="totalColumns"
                class="gt-state-cell"
              >
                <div class="gt-spinner"></div>
                <span>Loading...</span>
              </td>
            </tr>
          </template>
          <template v-else-if="flatRows.length === 0">
            <tr>
              <td
                :colspan="totalColumns"
                class="gt-state-cell gt-empty"
              >
                <div class="gt-empty-icon">📭</div>
                <span>데이터가 없습니다.</span>
              </td>
            </tr>
          </template>
          <template v-else>
            <template
              v-for="(row, rowIdx) in flatRows"
              :key="getRowKey(row, rowIdx)"
            >
              <!-- Group Header Row -->
              <tr
                v-if="row._isGroupHeader"
                class="gt-tr-group-header"
              >
                <td
                  :colspan="totalColumns"
                  class="gt-td-group"
                >
                  <span class="gt-group-label">{{ row._groupKey }}</span>
                  <span class="gt-group-count">{{ row._groupCount }}건</span>
                </td>
              </tr>
              <!-- Data Row -->
              <tr
                v-else
                class="gt-tr"
                :class="getRowClass(row, rowIdx)"
                @click="handleRowClick(row)"
              >
                <td
                  v-if="rowNumber"
                  class="gt-td gt-td-rn"
                >
                  {{ getRowNumber(rowIdx) }}
                </td>
                <td
                  v-if="selectionType === 'checkbox'"
                  class="gt-td gt-td-sel"
                >
                  <label class="gt-checkbox-wrap">
                    <input
                      type="checkbox"
                      class="gt-checkbox"
                      :checked="isRowSelected(row)"
                      :disabled="isRowDisabled(row)"
                      @change="toggleRowSelection(row)"
                      @click.stop
                    />
                  </label>
                </td>
                <td
                  v-if="selectionType === 'radio'"
                  class="gt-td gt-td-sel"
                >
                  <label class="gt-radio-wrap">
                    <input
                      type="radio"
                      class="gt-radio"
                      :name="radioName"
                      :checked="isRowSelected(row)"
                      :disabled="isRowDisabled(row)"
                      @change="selectRadioRow(row)"
                      @click.stop
                    />
                  </label>
                </td>
                <td
                  v-for="col in visibleColumns"
                  :key="col.key"
                  class="gt-td"
                  :style="getColStyle(col)"
                >
                  <span
                    v-if="row._isTree && col.key === treeIndentColumn"
                    class="gt-tree-indent"
                    :style="{ paddingLeft: row._depth * 20 + 'px' }"
                  >
                    <button
                      v-if="row._hasChildren"
                      class="gt-tree-toggle"
                      @click.stop="toggleTreeRow(row)"
                    >
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 9 9"
                        fill="currentColor"
                        :style="{
                          transform: row._expanded ? 'rotate(90deg)' : 'none',
                          transition: 'transform .15s',
                        }"
                      >
                        <path d="M2 1l5 3.5L2 8V1z" />
                      </svg>
                    </button>
                    <span
                      v-else
                      style="display: inline-block; width: 18px"
                    ></span>
                  </span>
                  <slot
                    v-if="$slots['cell-' + col.key]"
                    :name="'cell-' + col.key"
                    :row="row"
                    :col="col"
                    :value="getCellValue(row, col)"
                  />
                  <div
                    v-else
                    class="gt-cell-text"
                    :class="{ 'gt-ellipsis': col.ellipsis !== false }"
                    @mouseenter="(e) => showTooltip(e, col, row)"
                    @mousemove="moveTooltip"
                    @mouseleave="hideTooltip"
                  >
                    {{ getCellValue(row, col) }}
                  </div>
                </td>
                <td
                  v-if="hasActionSlot"
                  class="gt-td gt-td-action"
                  :class="{ 'gt-fixed-right': fixedAction }"
                >
                  <slot
                    name="action"
                    :row="row"
                    :index="rowIdx"
                  />
                </td>
              </tr>
            </template>
          </template>
        </tbody>
        <tfoot
          v-if="showFooter"
          class="gt-tfoot"
        >
          <tr>
            <td
              :colspan="totalColumns"
              class="gt-td-footer"
            >
              <slot name="footer" />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Pagination -->
    <div
      class="gt-pagination"
      v-if="pagination"
    >
      <div class="gt-page-info">
        <span
          >전체 <strong>{{ totalCount }}</strong
          >건</span
        >
        <select
          class="gt-size-select"
          :value="pageSize"
          @change="handlePageSizeChange"
        >
          <option
            v-for="s in pageSizeOptions"
            :key="s"
            :value="s"
          >
            {{ s }}개씩
          </option>
        </select>
      </div>
      <div class="gt-page-nav">
        <button
          class="gt-page-btn"
          :disabled="currentPage <= 1"
          @click="goToPage(1)"
        >
          «
        </button>
        <button
          class="gt-page-btn"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
        >
          ‹
        </button>
        <template
          v-for="p in pageNumbers"
          :key="p + '_' + currentPage"
        >
          <button
            class="gt-page-btn gt-page-num"
            :class="{ active: p === currentPage, ellipsis: p === '...' }"
            :disabled="p === '...'"
            @click="p !== '...' && goToPage(p)"
          >
            {{ p }}
          </button>
        </template>
        <button
          class="gt-page-btn"
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
        >
          ›
        </button>
        <button
          class="gt-page-btn"
          :disabled="currentPage >= totalPages"
          @click="goToPage(totalPages)"
        >
          »
        </button>
      </div>
    </div>

    <!-- Tooltip -->
    <Teleport to="body">
      <div
        v-if="tooltipVisible"
        class="gt-tooltip"
        :style="{ top: tooltipY + 'px', left: tooltipX + 'px' }"
      >
        {{ tooltipText }}
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.gt-wrapper {
  --gt-font: "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
  --gt-border: #e2e6ea;
  --gt-header-bg: #f0f3f7;
  --gt-header-color: #4a5568;
  --gt-even-bg: #f7f9fc;
  --gt-hover-bg: #eef2ff;
  --gt-sel-bg: #e8edff;
  --gt-sel-border: #5c6bc0;
  --gt-accent: #5c6bc0;
  --gt-radius: 8px;
  display: flex;
  flex-direction: column;
  color: #2d3748;
  font-size: 13px;
  font-family: var(--gt-font);
}

/* Toolbar */
.gt-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--gt-border);
  border-bottom: none;
  border-radius: var(--gt-radius) var(--gt-radius) 0 0;
  background: #fff;
  padding: 10px 14px;
}
.gt-toolbar-left,
.gt-toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.gt-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s;
  cursor: pointer;
  border: 1px solid var(--gt-border);
  border-radius: 5px;
  background: #fff;
  padding: 6px 12px;
  color: #4a5568;
  font-size: 12px;
  font-family: var(--gt-font);
}
.gt-btn:hover {
  border-color: var(--gt-accent);
  background: #f7f9fc;
  color: var(--gt-accent);
}
.gt-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.gt-btn-export {
  border-color: #a5d6a7;
  color: #2e7d32;
}
.gt-btn-export:hover {
  border-color: #2e7d32;
  background: #e8f5e9;
  color: #1b5e20;
}

/* Container */
.gt-container {
  border: 1px solid var(--gt-border);
  background: #fff;
}

/* Table */
.gt-table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  min-width: max-content;
}

/* Header */
.gt-thead {
  position: sticky;
  top: 0;
  z-index: 10;
}
.gt-th {
  border-right: 1px solid #e8ecf0;
  border-bottom: 2px solid var(--gt-border);
  background: var(--gt-header-bg);
  padding: 11px 14px;
  color: var(--gt-header-color);
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.4px;
  user-select: none;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}
.gt-th:last-child {
  border-right: none;
}
.gt-th-rn,
.gt-th-sel {
  width: 48px;
  min-width: 48px;
  text-align: center;
}
.gt-th-action {
  text-align: center;
  white-space: nowrap;
}
.gt-th-inner {
  display: flex;
  align-items: center;
  gap: 5px;
}
.gt-th-sortable {
  cursor: pointer;
}
.gt-th-sortable:hover {
  background: #e8ecf3;
  color: var(--gt-accent);
}
.gt-sorted-asc,
.gt-sorted-desc {
  color: var(--gt-accent);
}
.gt-sort-icon {
  display: inline-flex;
  align-items: center;
}

/* Body */
.gt-td {
  vertical-align: middle;
  border-right: 1px solid #f0f2f5;
  border-bottom: 1px solid var(--gt-border);
  padding: 10px 14px;
}
.gt-td:last-child {
  border-right: none;
}
.gt-td-rn,
.gt-td-sel {
  text-align: center;
}
.gt-tr {
  transition: background 0.1s;
}
.gt-tr:hover .gt-td {
  background: var(--gt-hover-bg);
}
.gt-tr-even .gt-td {
  background: var(--gt-even-bg);
}
.gt-tr-even:hover .gt-td {
  background: var(--gt-hover-bg);
}
.gt-tr-selected .gt-td {
  background: var(--gt-sel-bg) !important;
}
.gt-tr-selected .gt-td:first-child {
  box-shadow: inset 3px 0 0 var(--gt-sel-border);
}

/* Group header */
.gt-tr-group-header {
}
.gt-td-group {
  border-bottom: 1px solid #c5cae9;
  background: #eef2ff !important;
  padding: 7px 14px;
  color: var(--gt-accent);
  font-weight: 600;
}
.gt-group-label {
  margin-right: 8px;
}
.gt-group-count {
  border-radius: 10px;
  background: var(--gt-accent);
  padding: 1px 6px;
  color: #fff;
  font-weight: normal;
  font-size: 11px;
}

/* Cell text */
.gt-cell-text {
  display: block;
}
.gt-ellipsis {
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Tree */
.gt-tree-indent {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.gt-tree-toggle {
  display: inline-flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 1px solid var(--gt-border);
  border-radius: 3px;
  background: #fff;
  padding: 0;
  width: 18px;
  height: 18px;
  color: var(--gt-accent);
}
.gt-tree-toggle:hover {
  background: var(--gt-hover-bg);
}

/* Fixed right */
.gt-fixed-right {
  position: sticky;
  right: 0;
  z-index: 2;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.06);
  background: #fff;
}
.gt-thead .gt-fixed-right {
  z-index: 11;
  background: var(--gt-header-bg);
}
.gt-tr-even .gt-td.gt-fixed-right {
  background: var(--gt-even-bg);
}
.gt-tr:hover .gt-td.gt-fixed-right {
  background: var(--gt-hover-bg);
}
.gt-tr-selected .gt-td.gt-fixed-right {
  background: var(--gt-sel-bg) !important;
}

/* Checkbox / Radio */
.gt-checkbox-wrap,
.gt-radio-wrap {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.gt-checkbox,
.gt-radio {
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: var(--gt-accent);
}
.gt-checkbox:disabled,
.gt-radio:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.gt-clear-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 1px solid var(--gt-border);
  border-radius: 4px;
  background: none;
  width: 22px;
  height: 22px;
  color: #718096;
  font-size: 11px;
}
.gt-clear-btn:hover {
  border-color: #fc8181;
  background: #fee2e2;
  color: #c53030;
}

/* Action cell */
.gt-td-action {
  text-align: center;
  white-space: nowrap;
}

/* States */
.gt-state-cell {
  display: table-cell;
  padding: 52px 14px;
  color: #a0aec0;
  text-align: center;
}
.gt-state-cell > * {
  display: block;
  margin: 0 auto 8px;
}
.gt-spinner {
  animation: spin 0.7s linear infinite;
  margin: 0 auto 10px;
  border: 3px solid #e2e8f0;
  border-top-color: var(--gt-accent);
  border-radius: 50%;
  width: 28px;
  height: 28px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.gt-empty-icon {
  font-size: 32px;
}

/* Footer */
.gt-tfoot {
  position: sticky;
  bottom: 0;
  z-index: 9;
}
.gt-td-footer {
  border-top: 2px solid var(--gt-border);
  background: var(--gt-header-bg);
  padding: 10px 14px;
}

/* Pagination */
.gt-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--gt-border);
  border-top: none;
  border-radius: 0 0 var(--gt-radius) var(--gt-radius);
  background: #fff;
  padding: 10px 14px;
}
.gt-page-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #718096;
  font-size: 12px;
}
.gt-page-info strong {
  color: #2d3748;
}
.gt-size-select {
  cursor: pointer;
  border: 1px solid var(--gt-border);
  border-radius: 5px;
  background: #fff;
  padding: 4px 8px;
  font-size: 12px;
  font-family: var(--gt-font);
}
.gt-page-nav {
  display: flex;
  align-items: center;
  gap: 3px;
}
.gt-page-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  transition: all 0.15s;
  cursor: pointer;
  border: 1px solid var(--gt-border);
  border-radius: 5px;
  background: #fff;
  padding: 0 8px;
  min-width: 32px;
  height: 32px;
  color: #4a5568;
  font-size: 12px;
  font-family: var(--gt-font);
}
.gt-page-btn:hover:not(:disabled) {
  border-color: var(--gt-accent);
  background: #f0f3ff;
  color: var(--gt-accent);
}
.gt-page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.gt-page-btn.active {
  border-color: var(--gt-accent);
  background: var(--gt-accent);
  color: #fff;
  font-weight: 600;
}
.gt-page-btn.ellipsis {
  cursor: default;
  border-color: transparent;
  background: none;
}

/* Tooltip */
.gt-tooltip {
  position: fixed;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  border-radius: 5px;
  background: #1a202c;
  padding: 5px 10px;
  max-width: 320px;
  pointer-events: none;
  color: #fff;
  font-size: 12px;
  line-height: 1.4;
  font-family: var(--gt-font);
  word-break: break-all;
}
</style>
