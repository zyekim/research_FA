// ─────────────────────────────────────────────────────────────
//  useServerDataTable — Composable
// ─────────────────────────────────────────────────────────────

import type {
  TableColumn,
  FilterState,
  SortItem,
  LoadOptions,
  SelectionMode,
  ServerDataTableProps,
} from "./types";

export function useServerDataTable(
  props: ServerDataTableProps,
  emit: (event: string, ...args: unknown[]) => void
) {
  // ── Pagination
  const page = ref(1);
  const itemsPerPage = ref(props.itemsPerPageOptions?.[0] ?? 10);

  // ── Sort
  const sortBy = ref<SortItem[]>([]);

  // ── Global search
  const globalSearch = ref("");

  // ── Column filters
  const columnFilters = ref<FilterState>({});
  const activeFilterKey = ref<string | null>(null);

  // ── Selection
  const selectedKeys = ref<Set<string | number>>(new Set());

  // ── Expand
  const expandedKeys = ref<Set<string | number>>(new Set());

  // ── Computed: all filters merged
  const mergedFilters = computed<FilterState>(() => ({
    search: globalSearch.value || undefined,
    ...columnFilters.value,
  }));

  // ── Emit load whenever deps change
  function emitLoad() {
    const options: LoadOptions = {
      page: page.value,
      itemsPerPage: itemsPerPage.value,
      sortBy: sortBy.value,
      filters: mergedFilters.value,
    };
    emit("load", options);
  }

  watch([page, itemsPerPage, sortBy, mergedFilters], emitLoad, { deep: true });

  // ── Selection helpers
  function isDisabled(key: string | number): boolean {
    return (props.disabledKeys ?? []).includes(key);
  }

  function isSelected(key: string | number): boolean {
    return selectedKeys.value.has(key);
  }

  function toggleRow(key: string | number) {
    if (isDisabled(key)) return;
    if (props.selectionMode === "radio") {
      selectedKeys.value = new Set([key]);
    } else {
      if (selectedKeys.value.has(key)) selectedKeys.value.delete(key);
      else selectedKeys.value.add(key);
    }
    emit("update:selected", [...selectedKeys.value]);
    emit("selection-change", [...selectedKeys.value]);
  }

  const enabledItems = computed(() =>
    props.items.filter(
      (r) => !isDisabled(r[props.itemKey ?? "id"] as string | number)
    )
  );

  const isAllSelected = computed(
    () =>
      enabledItems.value.length > 0 &&
      enabledItems.value.every((r) =>
        selectedKeys.value.has(r[props.itemKey ?? "id"] as string | number)
      )
  );

  const isIndeterminate = computed(
    () =>
      !isAllSelected.value &&
      enabledItems.value.some((r) =>
        selectedKeys.value.has(r[props.itemKey ?? "id"] as string | number)
      )
  );

  function toggleAll() {
    if (isAllSelected.value) {
      enabledItems.value.forEach((r) =>
        selectedKeys.value.delete(r[props.itemKey ?? "id"] as string | number)
      );
    } else {
      enabledItems.value.forEach((r) =>
        selectedKeys.value.add(r[props.itemKey ?? "id"] as string | number)
      );
    }
    emit("update:selected", [...selectedKeys.value]);
    emit("selection-change", [...selectedKeys.value]);
  }

  function clearSelection() {
    selectedKeys.value = new Set();
    emit("update:selected", []);
    emit("selection-change", []);
  }

  // ── Expand helpers
  function isExpanded(key: string | number): boolean {
    return expandedKeys.value.has(key);
  }

  function toggleExpand(key: string | number) {
    if (expandedKeys.value.has(key)) expandedKeys.value.delete(key);
    else expandedKeys.value.add(key);
  }

  // ── Column filter helpers
  function getFilterValue(key: string): unknown {
    return columnFilters.value[key];
  }

  function setFilterValue(key: string, value: unknown) {
    if (value === null || value === undefined || value === "") {
      const clone = { ...columnFilters.value };
      delete clone[key];
      columnFilters.value = clone;
    } else {
      columnFilters.value = { ...columnFilters.value, [key]: value };
    }
    page.value = 1;
  }

  function clearFilter(key: string) {
    setFilterValue(key, undefined);
    activeFilterKey.value = null;
  }

  function clearAllFilters() {
    columnFilters.value = {};
    globalSearch.value = "";
    page.value = 1;
  }

  const activeFilterCount = computed(
    () =>
      Object.values(columnFilters.value).filter(
        (v) => v !== undefined && v !== ""
      ).length + (globalSearch.value ? 1 : 0)
  );

  // ── Row number
  function getRowNumber(index: number): number {
    return (page.value - 1) * itemsPerPage.value + index + 1;
  }

  // ── Cell value
  function getCellValue(
    row: Record<string, unknown>,
    col: TableColumn
  ): string {
    const raw = row[col.key];
    if (col.formatter) return col.formatter(raw, row);
    return raw != null ? String(raw) : "";
  }

  return {
    page,
    itemsPerPage,
    sortBy,
    globalSearch,
    columnFilters,
    activeFilterKey,
    mergedFilters,
    selectedKeys,
    expandedKeys,
    isAllSelected,
    isIndeterminate,
    activeFilterCount,
    emitLoad,
    isDisabled,
    isSelected,
    toggleRow,
    toggleAll,
    clearSelection,
    isExpanded,
    toggleExpand,
    getFilterValue,
    setFilterValue,
    clearFilter,
    clearAllFilters,
    getRowNumber,
    getCellValue,
  };
}
