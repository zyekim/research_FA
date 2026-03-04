<script setup lang="ts">
import { computed, reactive, useSlots } from 'vue'
import type { ServerDataTableProps } from './types'
import { useServerDataTable } from './useTable'

// ── Props & Emits ──────────────────────────────────────────────
const props = withDefaults(defineProps<ServerDataTableProps>(), {
  itemKey:             'id',
  loading:             false,
  selectionMode:       false,
  disabledKeys:        () => [],
  showRowNumber:       false,
  itemsPerPageOptions: () => [10, 20, 50, 100],
  fixedActions:        true,
  expandable:          false,
  height:              '560px',
  showToolbar:         true,
  showExcelExport:     false,
  excelFileName:       'export',
})

const emit = defineEmits<{
  load:               [options: import('./types').LoadOptions]
  'update:selected':  [keys: (string | number)[]]
  'selection-change': [keys: (string | number)[]]
  'row-click':        [item: Record<string, unknown>]
}>()

const slots = useSlots()

// ── Composable ────────────────────────────────────────────────
const {
  page, itemsPerPage, sortBy, globalSearch,
  activeFilterKey, activeFilterCount,
  selectedKeys, isAllSelected, isIndeterminate,
  emitLoad,
  isDisabled, isSelected, toggleRow, toggleAll, clearSelection,
  isExpanded, toggleExpand,
  getFilterValue, setFilterValue, clearFilter, clearAllFilters,
  getRowNumber, getCellValue,
} = useServerDataTable(props, emit as (event: string, ...args: unknown[]) => void)

// ── Filter menus reactive state
const filterMenuOpen = reactive<Record<string, boolean>>({})

// ── Visible columns (visible !== false)
const visibleColumns = computed(() => props.columns.filter(c => c.visible != false))

// ── Has action slot
const hasActionSlot = computed(() => !!slots['action'])

// ── Headers for v-data-table-server (needed for sort wiring)
const computedHeaders = computed(() => [
  ...(props.showRowNumber ? [{ key: '__rn', title: 'No', sortable: false, width: '56px' }] : []),
  ...(props.selectionMode ? [{ key: '__sel', title: '', sortable: false, width: '48px' }] : []),
  ...visibleColumns.value.map(col => ({
    key:      col.key,
    title:    col.title,
    sortable: col.sortable ?? false,
    width:    col.width,
    align:    col.align ?? 'start',
  })),
  ...(hasActionSlot.value ? [{ key: '__action', title: 'Actions', sortable: false }] : []),
  ...(props.expandable    ? [{ key: '__expand', title: '',        sortable: false, width: '48px' }] : []),
])

// ── Total column count
const totalColumns = computed(() => computedHeaders.value.length)

// ── Style helpers
function getHeaderStyle(col: import('./types').TableColumn): Record<string, string> {
  const s: Record<string, string> = {}
  if (col.width)    s.width    = col.width
  if (col.minWidth) s.minWidth = col.minWidth
  if (col.align)    s.textAlign = col.align === 'end' ? 'right' : col.align
  return s
}

function getCellStyle(col: import('./types').TableColumn): Record<string, string> {
  const s: Record<string, string> = {}
  if (col.width)    s.width    = col.width
  if (col.minWidth) s.minWidth = col.minWidth
  if (col.align)    s.textAlign = col.align === 'end' ? 'right' : col.align
  return s
}

// ── Excel export
async function handleExport() {
  try {
    const { utils, writeFileXLSX } = await import('xlsx')
    const headers = visibleColumns.value.map(c => c.title)
    const data = props.items.map(row =>
      Object.fromEntries(
        visibleColumns.value.map(col => [col.title, getCellValue(row as Record<string, unknown>, col)])
      )
    )
    const ws = utils.json_to_sheet(data, { header: headers })
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Sheet1')
    writeFileXLSX(wb, `${props.excelFileName}.xlsx`)
  } catch {
    alert('xlsx 패키지가 필요합니다: pnpm add xlsx')
  }
}
</script>

<template>
  <div class="sdt-root">
    <!-- ══ Toolbar ══════════════════════════════════════════════ -->
    <div v-if="showToolbar" class="sdt-toolbar">
      <div class="sdt-toolbar-left">
        <v-text-field
          v-model="globalSearch"
          :placeholder="searchPlaceholder ?? '검색...'"
          density="compact"
          variant="outlined"
          hide-details
          clearable
          prepend-inner-icon="mdi-magnify"
          style="min-width:220px; max-width:320px"
          @update:model-value="page = 1"
        />
        <v-chip
          v-if="activeFilterCount > 0"
          closable
          color="primary"
          size="small"
          @click:close="clearAllFilters"
          class="ml-1"
        >
          필터 {{ activeFilterCount }}개 적용
        </v-chip>
        <slot name="toolbar-left" />
      </div>
      <div class="sdt-toolbar-right">
        <slot name="toolbar-right" />
        <!-- Selection info -->
        <transition name="sdt-fade">
          <v-chip v-if="selectedKeys.size > 0" color="primary" size="small" variant="tonal" class="mr-2">
            {{ selectedKeys.size }}개 선택됨
            <v-icon end @click="clearSelection" style="cursor:pointer">mdi-close</v-icon>
          </v-chip>
        </transition>
        <!-- Excel export -->
        <v-btn
          v-if="showExcelExport"
          variant="outlined"
          size="small"
          color="success"
          prepend-icon="mdi-microsoft-excel"
          :loading="loading"
          @click="handleExport"
        >
          내보내기
        </v-btn>
      </div>
    </div>

    <!-- ══ Table ════════════════════════════════════════════════ -->
    <v-data-table-server
      v-model:page="page"
      v-model:items-per-page="itemsPerPage"
      v-model:sort-by="sortBy"
      :headers="computedHeaders"
      :items="items"
      :items-length="totalItems"
      :loading="loading"
      :height="height"
      :item-value="itemKey ?? 'id'"
      fixed-header
      class="sdt-table"
      density="comfortable"
      hover
    >
      <!-- ── Custom Header ───────────────────────────────────── -->
      <template #headers="{ columns: headerCols, isSorted, getSortIcon, toggleSort }">
        <tr class="sdt-header-row">
          <!-- Row number header -->
          <th v-if="showRowNumber" class="sdt-th sdt-th-rn">
            <span class="sdt-th-label">No</span>
          </th>

          <!-- Checkbox header -->
          <th v-if="selectionMode == 'checkbox'" class="sdt-th sdt-th-sel">
            <v-checkbox-btn
              :model-value="isAllSelected"
              :indeterminate="isIndeterminate"
              color="primary"
              density="compact"
              hide-details
              @update:model-value="toggleAll"
            />
          </th>

          <!-- Radio header (clear button) -->
          <th v-if="selectionMode == 'radio'" class="sdt-th sdt-th-sel">
            <v-btn icon="mdi-radiobox-blank" size="x-small" variant="text" @click="clearSelection" title="선택 해제" />
          </th>

          <!-- Data column headers -->
          <th
            v-for="col in visibleColumns"
            :key="col.key"
            class="sdt-th"
            :class="{
              'sdt-th-sortable': col.sortable,
              'sdt-th-sorted': isSorted({ key: col.key, order: 'asc' }) || isSorted({ key: col.key, order: 'desc' }),
            }"
            :style="getHeaderStyle(col)"
          >
            <div class="sdt-th-inner">
              <span
                class="sdt-th-label"
                :class="{ 'sdt-sortable-label': col.sortable }"
                @click="col.sortable ? toggleSort({ key: col.key } as any) : undefined"
              >
                {{ col.title }}
                <v-icon
                  v-if="col.sortable"
                  :icon="getSortIcon({ key: col.key } as any)"
                  size="14"
                  class="sdt-sort-icon"
                />
              </span>

              <!-- Column filter button -->
              <v-menu
                v-if="col.filter"
                v-model="filterMenuOpen[col.key]"
                :close-on-content-click="false"
                location="bottom start"
                offset="4"
              >
                <template #activator="{ props: menuProps }">
                  <v-btn
                    v-bind="menuProps"
                    :icon="getFilterValue(col.key) ? 'mdi-filter' : 'mdi-filter-outline'"
                    :color="getFilterValue(col.key) ? 'primary' : 'default'"
                    size="x-small"
                    variant="text"
                    class="sdt-filter-btn"
                  />
                </template>
                <v-card class="sdt-filter-card" elevation="4">
                  <v-card-title class="sdt-filter-title">
                    {{ col.title }} 필터
                  </v-card-title>
                  <v-card-text class="pa-3">
                    <!-- Text filter -->
                    <v-text-field
                      v-if="col.filter.type === 'text'"
                      :model-value="getFilterValue(col.key) as string"
                      :label="col.filter.label ?? col.title"
                      density="compact"
                      variant="outlined"
                      hide-details
                      clearable
                      autofocus
                      @update:model-value="setFilterValue(col.key, $event)"
                    />
                    <!-- Select filter -->
                    <v-select
                      v-else-if="col.filter.type === 'select'"
                      :model-value="getFilterValue(col.key)"
                      :label="col.filter.label ?? col.title"
                      :items="col.filter.items ?? []"
                      item-title="title"
                      item-value="value"
                      density="compact"
                      variant="outlined"
                      hide-details
                      clearable
                      @update:model-value="setFilterValue(col.key, $event)"
                    />
                  </v-card-text>
                  <v-card-actions class="pa-2 pt-0">
                    <v-btn size="small" variant="text" @click="clearFilter(col.key)">초기화</v-btn>
                    <v-spacer />
                    <v-btn size="small" color="primary" variant="flat" @click="filterMenuOpen[col.key] = false">적용</v-btn>
                  </v-card-actions>
                </v-card>
              </v-menu>
            </div>
          </th>

          <!-- Action header -->
          <th v-if="hasActionSlot" class="sdt-th sdt-th-action" :class="{ 'sdt-fixed-right': fixedActions }">
            Actions
          </th>
        </tr>
      </template>

      <!-- ── Row template ────────────────────────────────────── -->
      <template #item="{ item, index }">
        <tr
          class="sdt-row"
          :class="{
            'sdt-row-even': index % 2 === 1,
            'sdt-row-selected': isSelected(item[itemKey ?? 'id'] as string | number),
            'sdt-row-disabled': isDisabled(item[itemKey ?? 'id'] as string | number),
          }"
        >
          <!-- Row number -->
          <td v-if="showRowNumber" class="sdt-td sdt-td-rn">
            {{ getRowNumber(index) }}
          </td>

          <!-- Checkbox -->
          <td v-if="selectionMode === 'checkbox'" class="sdt-td sdt-td-sel">
            <v-checkbox-btn
              :model-value="isSelected(item[itemKey ?? 'id'] as string | number)"
              :disabled="isDisabled(item[itemKey ?? 'id'] as string | number)"
              color="primary"
              density="compact"
              hide-details
              @update:model-value="toggleRow(item[itemKey ?? 'id'] as string | number)"
            />
          </td>

          <!-- Radio -->
          <td v-if="selectionMode === 'radio'" class="sdt-td sdt-td-sel">
            <v-radio
              :model-value="isSelected(item[itemKey ?? 'id'] as string | number)"
              :disabled="isDisabled(item[itemKey ?? 'id'] as string | number)"
              :value="true"
              color="primary"
              density="compact"
              hide-details
              @update:model-value="toggleRow(item[itemKey ?? 'id'] as string | number)"
            />
          </td>

          <!-- Data cells -->
          <td
            v-for="col in visibleColumns"
            :key="col.key"
            class="sdt-td"
            :style="getCellStyle(col)"
          >
            <!-- Custom cell slot -->
            <slot
              v-if="$slots['cell-'+col.key]"
              :name="'cell-'+col.key"
              :item="item"
              :col="col"
              :value="getCellValue(item as Record<string, unknown>, col)"
            />
            <!-- Default cell -->
            <div
              v-else
              class="sdt-cell-text"
              :class="{ 'sdt-ellipsis': col.ellipsis !== false }"
              :title="col.ellipsis !== false ? getCellValue(item as Record<string, unknown>, col) : undefined"
            >
              {{ getCellValue(item as Record<string, unknown>, col) }}
            </div>
          </td>

          <!-- Action cell -->
          <td v-if="hasActionSlot" class="sdt-td sdt-td-action" :class="{ 'sdt-fixed-right': fixedActions }">
            <slot name="action" :item="item" :index="index" />
          </td>

          <!-- Expand toggle -->
          <td v-if="expandable" class="sdt-td sdt-td-expand">
            <v-btn
              :icon="isExpanded(item[itemKey ?? 'id'] as string | number) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              size="x-small"
              variant="text"
              color="primary"
              @click="toggleExpand(item[itemKey ?? 'id'] as string | number)"
            />
          </td>
        </tr>

        <!-- ── Expand row ──────────────────────────────────── -->
        <tr
          v-if="expandable && isExpanded(item[itemKey ?? 'id'] as string | number)"
          class="sdt-expand-row"
        >
          <td :colspan="totalColumns" class="sdt-expand-td pa-0">
            <v-expand-transition>
              <div class="sdt-expand-content">
                <slot name="expanded-row" :item="item">
                  <!-- Default expand: render children as sub-table -->
                  <div v-if="(item as any).children?.length" class="sdt-sub-table-wrap">
                    <div class="sdt-sub-header">
                      <v-icon size="14" class="mr-1">mdi-subdirectory-arrow-right</v-icon>
                      하위 항목 {{ (item as any).children.length }}개
                    </div>
                    <table class="sdt-sub-table">
                      <thead>
                        <tr>
                          <th v-for="col in visibleColumns" :key="col.key">{{ col.title }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(child, ci) in (item as any).children" :key="ci" :class="{'sdt-sub-even': ci % 2 === 1}">
                          <td v-for="col in visibleColumns" :key="col.key">
                            {{ getCellValue(child as Record<string, unknown>, col) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div v-else class="sdt-expand-empty">
                    <v-icon color="grey" class="mr-1">mdi-information-outline</v-icon>
                    하위 데이터가 없습니다.
                  </div>
                </slot>
              </div>
            </v-expand-transition>
          </td>
        </tr>
      </template>

      <!-- ── Loading slot ────────────────────────────────────── -->
      <template #loading>
        <div class="sdt-loading">
          <v-progress-circular indeterminate color="primary" size="32" />
          <span class="ml-3">데이터를 불러오는 중...</span>
        </div>
      </template>

      <!-- ── No data slot ────────────────────────────────────── -->
      <template #no-data>
        <div class="sdt-no-data">
          <v-icon size="40" color="grey-lighten-1">mdi-database-off-outline</v-icon>
          <p>데이터가 없습니다.</p>
          <v-btn v-if="activeFilterCount > 0" size="small" variant="text" color="primary" @click="clearAllFilters">
            필터 초기화
          </v-btn>
        </div>
      </template>

      <!-- ── Bottom / Pagination ─────────────────────────────── -->
      <template #bottom="{ pageCount }">
        <div class="sdt-bottom">
          <div class="sdt-bottom-left">
            <span class="sdt-total-label">전체 <strong>{{ totalItems.toLocaleString() }}</strong>건</span>
            <v-select
              v-model="itemsPerPage"
              :items="itemsPerPageOptions ?? [10, 20, 50, 100]"
              density="compact"
              variant="outlined"
              hide-details
              style="width:90px"
              @update:model-value="page = 1"
            />
          </div>
          <v-pagination
            v-model="page"
            :length="pageCount"
            :total-visible="7"
            density="compact"
            rounded="lg"
            active-color="primary"
          />
        </div>
      </template>
    </v-data-table-server>
  </div>
</template>



<style scoped>
/* ── Root ──────────────────────────────────────────────────── */
.sdt-root {
  --sdt-primary:      #5c6bc0;
  --sdt-header-bg:    #f4f6fb;
  --sdt-border:       #e4e8f0;
  --sdt-even-bg:      #f8fafd;
  --sdt-hover-bg:     #eef1fb;
  --sdt-sel-bg:       #e8edff;
  --sdt-sel-left:     #5c6bc0;
  --sdt-radius:       10px;
  --sdt-font:         'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
  border-radius: var(--sdt-radius);
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(92,107,192,.10), 0 1px 4px rgba(0,0,0,.06);
  font-family: var(--sdt-font);
}

/* ── Toolbar ───────────────────────────────────────────────── */
.sdt-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid var(--sdt-border);
  gap: 12px;
  flex-wrap: wrap;
}
.sdt-toolbar-left,
.sdt-toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── Table overrides ───────────────────────────────────────── */
.sdt-table :deep(table) {
  border-collapse: separate !important;
  border-spacing: 0 !important;
  font-family: var(--sdt-font);
  min-width: max-content;
  width: 100%;
}

/* ── Header ────────────────────────────────────────────────── */
.sdt-header-row {}
.sdt-th {
  background: var(--sdt-header-bg) !important;
  color: #4a5568 !important;
  font-size: 11.5px !important;
  font-weight: 700 !important;
  letter-spacing: .5px !important;
  text-transform: uppercase !important;
  padding: 0 14px !important;
  height: 44px !important;
  border-bottom: 2px solid var(--sdt-border) !important;
  border-right: 1px solid #eaecf2 !important;
  white-space: nowrap;
  user-select: none;
}
.sdt-th:last-child { border-right: none !important; }
.sdt-th-rn, .sdt-th-sel { text-align: center !important; width: 48px !important; min-width: 48px !important; }
.sdt-th-action { text-align: center !important; white-space: nowrap; }

.sdt-th-inner {
  display: flex;
  align-items: center;
  gap: 4px;
}
.sdt-th-label {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.sdt-sortable-label { cursor: pointer; transition: color .15s; }
.sdt-sortable-label:hover { color: var(--sdt-primary); }
.sdt-sort-icon { opacity: .6; }
.sdt-th-sorted .sdt-th-label { color: var(--sdt-primary); }

.sdt-filter-btn { opacity: .6; transition: opacity .15s; }
.sdt-filter-btn:hover { opacity: 1; }

/* ── Filter menu ───────────────────────────────────────────── */
.sdt-filter-card { min-width: 220px; }
.sdt-filter-title {
  font-size: 13px !important;
  font-weight: 600 !important;
  padding: 10px 14px 0 !important;
  color: #2d3748;
}

/* ── Rows ──────────────────────────────────────────────────── */
.sdt-row {
  transition: background .1s;
}
.sdt-row:hover .sdt-td { background: var(--sdt-hover-bg) !important; }
.sdt-row-even .sdt-td { background: var(--sdt-even-bg); }
.sdt-row-even:hover .sdt-td { background: var(--sdt-hover-bg) !important; }
.sdt-row-selected .sdt-td { background: var(--sdt-sel-bg) !important; }
.sdt-row-selected .sdt-td:first-child {
  box-shadow: inset 3px 0 0 var(--sdt-sel-left);
}
.sdt-row-disabled { opacity: .55; cursor: not-allowed; }

/* ── Cells ─────────────────────────────────────────────────── */
.sdt-td {
  padding: 0 14px !important;
  height: 46px !important;
  border-bottom: 1px solid var(--sdt-border) !important;
  border-right: 1px solid #f0f2f8 !important;
  font-size: 13px;
  vertical-align: middle !important;
}
.sdt-td:last-child { border-right: none !important; }
.sdt-td-rn, .sdt-td-sel, .sdt-td-expand { text-align: center !important; }
.sdt-td-action { text-align: center !important; white-space: nowrap; }

.sdt-cell-text { display: block; }
.sdt-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 260px;
}

/* ── Fixed right ───────────────────────────────────────────── */
.sdt-fixed-right {
  position: sticky !important;
  right: 0 !important;
  background: #fff !important;
  z-index: 2;
  box-shadow: -2px 0 8px rgba(0,0,0,.06);
}
.sdt-row-even .sdt-td.sdt-fixed-right { background: var(--sdt-even-bg) !important; }
.sdt-row:hover .sdt-td.sdt-fixed-right { background: var(--sdt-hover-bg) !important; }
.sdt-row-selected .sdt-td.sdt-fixed-right { background: var(--sdt-sel-bg) !important; }
.sdt-th.sdt-fixed-right { background: var(--sdt-header-bg) !important; z-index: 11; }

/* ── Expand row ────────────────────────────────────────────── */
.sdt-expand-row .sdt-expand-td {
  background: #f9fafb !important;
  border-bottom: 2px solid var(--sdt-border) !important;
  padding: 0 !important;
}
.sdt-expand-content { padding: 12px 20px 16px; }
.sdt-expand-empty {
  display: flex;
  align-items: center;
  color: #9e9e9e;
  font-size: 13px;
  padding: 8px 0;
}

/* ── Sub table ─────────────────────────────────────────────── */
.sdt-sub-table-wrap { border-radius: 6px; overflow: hidden; border: 1px solid #e4e8f0; }
.sdt-sub-header {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--sdt-primary);
  background: #eef1fb;
  padding: 7px 12px;
  border-bottom: 1px solid #dde2f3;
}
.sdt-sub-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
  font-family: var(--sdt-font);
}
.sdt-sub-table th {
  background: #f4f6fb;
  color: #4a5568;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .4px;
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #e4e8f0;
}
.sdt-sub-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #f0f2f8;
  color: #2d3748;
}
.sdt-sub-even td { background: #f8fafd; }

/* ── Bottom / Pagination ───────────────────────────────────── */
.sdt-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #fff;
  border-top: 1px solid var(--sdt-border);
  flex-wrap: wrap;
  gap: 10px;
}
.sdt-bottom-left { display: flex; align-items: center; gap: 10px; }
.sdt-total-label { font-size: 12.5px; color: #718096; white-space: nowrap; }
.sdt-total-label strong { color: #2d3748; }

/* ── Loading / No-data ─────────────────────────────────────── */
.sdt-loading, .sdt-no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 52px 16px;
  color: #a0aec0;
  font-size: 13.5px;
  gap: 10px;
}

/* ── Transition ────────────────────────────────────────────── */
.sdt-fade-enter-active, .sdt-fade-leave-active { transition: opacity .2s; }
.sdt-fade-enter-from, .sdt-fade-leave-to { opacity: 0; }

/* ── Vuetify overrides (scoped :deep) ──────────────────────── */
.sdt-table :deep(.v-data-table__thead th) { display: none; } /* hide default header */
.sdt-table :deep(.v-data-table-footer) { display: none; }    /* hide default footer */
.sdt-table :deep(.v-data-table__tr--clickable) { cursor: default; }
.sdt-table :deep(.v-table__wrapper) {
  overflow: auto;
}
</style>
