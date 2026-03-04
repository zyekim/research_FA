// ─────────────────────────────────────────────────────────────
//  ServerDataTable — Type Definitions
// ─────────────────────────────────────────────────────────────

export type SelectionMode = "checkbox" | "radio" | false;

export interface ColumnFilter {
  type: "text" | "select" | "dateRange";
  label?: string;
  items?: { title: string; value: unknown }[]; // for 'select'
}

export interface TableColumn {
  key: string;
  title: string;
  width?: string;
  minWidth?: string;
  align?: "start" | "center" | "end";
  sortable?: boolean;
  fixed?: boolean;
  ellipsis?: boolean;
  /** 헤더 필터 설정 */
  filter?: ColumnFilter;
  /** formatter: (value, row) => display string */
  formatter?: (value: unknown, row: Record<string, unknown>) => string;
}

export interface FilterState {
  [key: string]: unknown;
}

export interface SortItem {
  key: string;
  order: "asc" | "desc";
}

export interface LoadOptions {
  page: number;
  itemsPerPage: number;
  sortBy: SortItem[];
  filters: FilterState;
}

export interface ServerDataTableProps {
  /** Column definitions */
  columns: TableColumn[];
  /** Total item count from server */
  totalItems: number;
  /** Row data for current page */
  items: Record<string, unknown>[];
  /** Unique row key field */
  itemKey?: string;
  /** Loading state */
  loading?: boolean;
  /** 'checkbox' | 'radio' | false */
  selectionMode?: SelectionMode;
  /** Keys of disabled rows */
  disabledKeys?: (string | number)[];
  /** Row number column */
  showRowNumber?: boolean;
  /** Page size options */
  itemsPerPageOptions?: number[];
  /** Fixed action column on right */
  fixedActions?: boolean;
  /** Show expand column */
  expandable?: boolean;
  /** Height of the table */
  height?: string;
  /** Show toolbar (search + filter) */
  showToolbar?: boolean;
  /** Show excel export button */
  showExcelExport?: boolean;
  /** Excel filename */
  excelFileName?: string;
  /** Global search placeholder */
  searchPlaceholder?: string;
}

export interface ExpandedRow {
  id: string | number;
  [key: string]: unknown;
}
