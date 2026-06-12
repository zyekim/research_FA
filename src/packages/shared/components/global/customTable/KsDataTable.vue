<script lang="ts" setup>
defineOptions({
  inheritAttrs: false,
  name: "KsDataTable",
});

// ─── EMIT ───
const emit = defineEmits([
  "update:page",
  "update:pageSize",
  "update:loading",
  "update:radioSelected", // 라디오
  "update:expanded",
  "click:row",
]);

// ─── PROPS ───
const props = defineProps({
  headers: { type: Array as PropType<any[]>, required: true },
  items: { type: Array as PropType<any[]>, required: true },
  loading: { type: Boolean, default: false },
  itemValue: { type: String, default: "code" }, // 고유식별자

  // 스타일 / 칼럼
  height: { type: String, default: "60vh" },
  addIndex: { type: Boolean, default: false },
  showActions: { type: Boolean, default: false },
  expandable: { type: Boolean, default: false },
  /**
   * true: 모든 셀 white-space:nowrap + 가로 스크롤
   * false(기본): 기존 동작 유지
   */

  scrollable: { type: Boolean, default: false },
  // 선택
  selectionType: {
    type: String as PropType<"checkbox" | "radio" | "none">,
    default: "none",
    validator: (v: unknown) =>
      ["checkbox", "radio", "none"].includes(v as string),
  },
  /**
   * Vuetify item-selectable 그대로.
   * string  → item[key] 가 truthy면 선택 가능
   * Function → (item) => boolean
   */
  itemSelectable: {
    type: [String, Function, Array] as PropType<any>,
    default: () => [],
  },
  selectedRows: { type: Array as PropType<any[]>, default: () => [] }, //checkbox
  radioSelectedRow: { type: Object, default: () => ({}) }, // radio
  clickableRow: { type: Boolean, default: false }, // 클릭 row
  defaultClickRow: { type: Object, default: () => ({}) }, // 클릭 row

  // 페이징
  totalPage: { type: Number, default: 0 },
  currPage: { type: Number, default: 0 },
  pageSize: { type: Number, default: 0 },

  // 합계/서브
  hasSummary: { type: Boolean, default: false },
  subTableHeight: { type: Number, default: 0 },
  subTableGap: { type: Number, default: 16 },

  // expand
  expanded: { type: Array as PropType<any[]>, default: () => [] },

  // filter
  search: { type: String, default: "" },
  searchKeys: { type: Array as PropType<string[]>, default: () => [] },

  returnObject: { type: Boolean, default: true },
  noDataText: { type: String, default: "조회결과가 없습니다" },
});

// ─── HEADER ───
const checkAlign = (headerItem: { key: string; align?: string }) => {
  return headerItem.align || "center";
};

// 헤더
const computedHeaders = computed(() => {
  const selectColumn = {
    title: "",
    key: "data-table-select",
    fixed: props.scrollable ? "start" : "",
    width: 40,
    maxWidth: 40,
    align: "center",
    sortable: false,
  };

  const noColumn = {
    title: "No",
    key: "no",
    width: 60,
    minWidth: 60,
    align: "center",
    sortable: false,
  };

  const actionColumn = {
    title: "",
    key: "actions",
    fixed: props.scrollable ? "end" : "",
    align: "center",
    width: 100,
    sortable: false,
  };

  const expandColumn = {
    title: "",
    key: "data-table-expand",
    width: 40,
    maxWidth: 40,
    sortable: false,
  };

  //   const config = {
  //   sortable: false,
  //   minWidth: "60px"
  // };

  const makeBaseHeader = (header: any) => {
    // px -> 숫자로 만들기...!
    const sanitizedWidth =
      typeof header.width == "string" && header.width.endsWith("px")
        ? parseInt(header.width, 10)
        : header.width;

    return {
      ...header,
      width: sanitizedWidth,
      ...{
        sortable: false,
        minWidth: header.minWidth || "50px",
      },
      align: checkAlign(header),
    };
  };

  const headers = props.headers.map((header: any) => ({
    ...makeBaseHeader(header),
    children: header.children?.map((child: any) => makeBaseHeader(child)),
  }));

  // no 칼럼 추가
  if (props.addIndex) {
    headers.unshift(noColumn);
  }

  // expand 칼럼 추가
  if (props.expandable) {
    headers.unshift(expandColumn);
  }

  // 셀렉션 칼럼 추가
  if (props.selectionType != "none") {
    headers.unshift(selectColumn);
  }

  // action 칼럼 추가
  if (props.showActions) {
    headers.push(actionColumn);
  }

  return headers;
});

// 동적 슬롯 위임 대상 (시스템 컬럼 제외)
const SYSTEM_KEYS = new Set([
  "data-table-select",
  "data-table-expand",
  "actions",
  "no",
]);

// 동적 슬롯을 위한 헤더 추출
const passableColumns = computed(() => {
  const allColumns: any[] = [];

  const stack = [...props.headers];
  while (stack.length) {
    const node = stack.shift();
    if (!SYSTEM_KEYS.has(node.key)) allColumns.push(node);
    if (node.children) stack.push(...node.children);
  }
  return allColumns;
});

// ── 페이징 ──
const onChangePage = (page: number) => {
  //  체크박스는 model-value 초기화
  // radio는 radioSelected 초기화
  emit("update:page", page);
};

const onChangePageSize = (size: number) => {
  // 체크박스는 model-value 초기화
  // radio는 radioSelected 초기화
  emit("update:pageSize", size);
};

// ── 선택 ──
const internalSelected = ref<any[]>(props.selectedRows);
watch(
  () => props.selectedRows,
  (val) => {
    internalSelected.value = val;
  },
  { deep: true }
);

/**
 * itemSelectable이 string이면 item[key], Function이면 호출.
 * 선택 가능하면 true 반환.
 */
const canSelect = (item: any): boolean => {
  if (!props.itemSelectable) return true;
  if (typeof props.itemSelectable == "function") {
    return props.itemSelectable(item);
  }
  if (typeof props.itemSelectable == "string") {
    return !!item[props.itemSelectable];
  }
  return true;
};

// 라디오 단일 선택
const radioSelected = ref<any>(props.radioSelectedRow);
const onRadioClick = (item: any) => {
  if (!canSelect(item)) return;
  radioSelected.value = item;
  emit("update:radioSelected", item);
};

// 클릭row 변경
watch(
  () => props.radioSelectedRow,
  (newVal) => {
    radioSelected.value = newVal;
  },
  { deep: true }
);

//expand 선택 custom
const handleToggle = (
  internalItem: any,
  item: any,
  isExpanded: boolean,
  toggleExpand: Function
) => {
  toggleExpand(internalItem);
  const currentlyExpanded = isExpanded;

  let newExpandedList = [...props.expanded];

  if (!currentlyExpanded) {
    newExpandedList = [...props.expanded, item];
  } else {
    // itemValue가 있다면, itemValue로 비교
    newExpandedList = props.expanded.filter((e) =>
      props.itemValue ? e[props.itemValue] != item[props.itemValue] : e != item
    );
  }

  emit("update:expanded", newExpandedList);
};

// 중첩헤더 class 바인딩
const isMultiHeader = computed(() => {
  return computedHeaders.value.some(
    (header: any) => header.children?.length > 0
  );
});

const computedHeadersLength = computed(() => {
  const children = props.headers.flatMap(
    (header: any) => header.children ?? []
  );
  return isMultiHeader.value
    ? children.length + computedHeaders.value.length
    : computedHeaders.value.length;
});

// 빈값 일괄 포맷
const blankValueFormatter = (val: any) => {
  if (val == null || val == undefined || val == "") return "-";
  return val;
};

// click row action
const clickedRow = ref<any>(props.defaultClickRow);

const getRowProps = ({ item }: any) => {
  if (!props.clickableRow) return;
  // if (!props.selectedRow) return;
  const row = item;

  return {
    class: {
      "ks-table-row--selected":
        clickedRow.value?.[props.itemValue] == row[props.itemValue],
    },
    onClick: (e: MouseEvent) => {
      if (!props.clickableRow) return;
      if ((e.target as HTMLElement).closest(".v-checkbox-btn")) return;
      if ((e.target as HTMLElement).closest(".v-radio")) return;
      if ((e.target as HTMLElement).closest(".v-btn")) return;
      if ((e.target as HTMLElement).closest(".v-data-table__td--expand"))
        return;
      clickedRow.value = row;
      emit("click:row", item);
    },
  };
};

// 모든 상품이 선택 불가인지 여부 (헤더 체크박스 비활성화용)
const allItemsDisabled = computed(
  () => props.items.length > 0 && props.items.every((item) => !canSelect(item))
);

// 클릭row 변경
watch(
  () => props.defaultClickRow,
  (newVal) => {
    clickedRow.value = newVal;
  },
  { deep: true }
);

// 페이징 없는 경우
const hidePaging = computed(() => {
  if (!props.currPage) return false;
  if (props.items.length == 0) return false;
  return true;
});
</script>
<template>
  <div
    ref="tableWrapper"
    :style="{ height: height }"
    class="table-wrapper"
  >
    <v-data-table
      :model-value="selectionType == 'checkbox' ? internalSelected : []"
      @update:model-value="
        selectionType == 'checkbox' ? (internalSelected = $event) : null
      "
      v-bind="$attrs"
      :headers="computedHeaders"
      :items="items"
      :loading="loading"
      fixedHeader
      striped="even"
      hover
      :height="'100%'"
      hide-default-footer
      :item-selectable="canSelect"
      :select-strategy="selectionType == 'radio' ? 'single' : 'page'"
      :items-per-page="pageSize"
      :page="currPage"
      :show-expand="expandable"
      :expanded="props.expanded"
      :return-object="returnObject"
      :item-value="itemValue"
      expand-icon="arrowRight"
      collapse-icon="arrowDown"
      :class="{
        'ks-table--scrollable': scrollable,
        'ks-table--multiHeader': isMultiHeader,
        'ks-table--hidePaging': !currPage,
      }"
      :row-props="getRowProps"
      :search="search"
      :filter-keys="searchKeys"
    >
      <!-- 체크박스 헤더 -->
      <template
        #header.data-table-select="{ allSelected, selectAll, someSelected }"
      >
        <v-checkbox-btn
          v-if="selectionType == 'checkbox'"
          :model-value="allSelected"
          :indeterminate="someSelected && !allSelected"
          :disabled="allItemsDisabled"
          @update:model-value="selectAll(!allSelected)"
        />
      </template>
      <!-- 체크박스 / 라디오 td -->
      <template
        #item.data-table-select="{
          item,
          internalItem,
          isSelected,
          toggleSelect,
        }"
      >
        <v-checkbox-btn
          v-if="selectionType == 'checkbox'"
          :model-value="isSelected(internalItem)"
          :disabled="!canSelect(item)"
          @update:model-value="canSelect(item) && toggleSelect(internalItem)"
          width="24px"
        />
        <v-radio
          v-else-if="selectionType == 'radio'"
          :model-value="radioSelected?.[itemValue]"
          :value="item[itemValue]"
          @click.stop="onRadioClick(item)"
          :disabled="!canSelect(item)"
          width="24px"
        />
      </template>
      <!-- 인덱스 -->
      <template v-slot:item.no="{ index }">
        {{ hidePaging ? index + 1 : pageSize * (currPage - 1) + index + 1 }}
      </template>

      <!-- 동적 헤더 슬롯 전달 -->
      <template
        v-for="col in passableColumns"
        :key="`header-${col.key}`"
        #[`header.${col.key}`]="headerSlot"
      >
        <slot
          :name="`header.${col.key}`"
          v-bind="headerSlot"
        >
          <div class="ks-table__header-content">
            <div>
              <p>{{ col.title }}</p>
              <p
                v-if="col.subtitle"
                class="ks-table__subtitle"
              >
                {{ col.subtitle }}
              </p>
            </div>
            <!-- 툴팁 텍스트 || slot -->
            <v-tooltip
              v-if="col.headerTooltip || $slots[`tooltip.${col.key}`]"
              location="bottom"
              max-width="240"
            >
              <template #activator="{ props: tooltipProps }">
                <v-icon
                  v-bind="tooltipProps"
                  icon="circleInfo"
                  size="14"
                />
              </template>

              <template v-if="$slots[`tooltip.${col.key}`]">
                <slot :name="`tooltip.${col.key}`" />
              </template>
              <template v-else>
                <span>{{ col.headerTooltip }}</span>
              </template>
            </v-tooltip>
          </div>
        </slot>
      </template>
      <!-- 동적 슬롯 전달 -->
      <template
        v-for="col in passableColumns"
        :key="col.key"
        #[`item.${col.key}`]="slotProps"
      >
        <slot
          :name="`item.${(col as any).key}`"
          v-bind="slotProps"
        >
          {{
            blankValueFormatter(
              slotProps.value ?? slotProps.item[(col as any).key]
            )
          }}
        </slot>
      </template>
      <template
        v-if="showActions"
        #item.actions="{ item, internalItem }"
      >
        <div class="d-flex align-center ga-2">
          <slot
            name="item.actions"
            :item="item"
            :internal-item="internalItem"
          >
          </slot>
        </div>
      </template>
      <!-- expand -->
      <template #item.data-table-expand="slotProps">
        <slot
          name="item.data-table-expand"
          v-bind="{ ...slotProps, handleToggle }"
        >
          <v-btn
            :icon="
              slotProps.isExpanded(slotProps.internalItem)
                ? 'arrowDown'
                : 'arrowRight'
            "
            variant="text"
            size="small"
            @click.stop="
              handleToggle(
                slotProps.internalItem,
                slotProps.item,
                slotProps.isExpanded(slotProps.internalItem),
                slotProps.toggleExpand
              )
            "
        /></slot>
        <!-- toggleExpand(internalItem);
        emit('update:expanded', item); -->
      </template>
      <template
        v-if="expandable"
        #expanded-row="{ item }"
      >
        <tr class="expand-row">
          <td
            :colspan="computedHeadersLength"
            class="pa-24"
          >
            <slot
              name="expanded-row"
              :item="item"
            >
            </slot>
          </td>
        </tr>
        <tr></tr>
      </template>
      <!-- ── 로딩 ── -->
      <template #loading>
        <v-skeleton-loader type="table-row@10" />
      </template>
      <!-- ── 빈화면 ── -->
      <template #no-data>
        <div
          class="d-flex flex-column align-center justify-center py-10 text-medium-emphasis"
          :height="`calc(${props.height != 'fit-content' ? props.height : '200px'} - ${isMultiHeader ? 50 : 40}px)`"
        >
          <v-icon
            icon="emptyTable"
            size="50"
            color="line-navy"
          />
          <span class="text-body-2 mt-18">{{ noDataText }}</span>
        </div>
      </template>
      <template
        #tfoot
        v-if="items.length > 0 && $slots['tfoot']"
      >
        <tfoot class="ks-table-summary ks-table-summary--tfoot">
          <slot name="tfoot"></slot>
        </tfoot>
      </template>
      <!-- 페이징 -->
      <template #bottom>
        <template v-if="$slots['summary-footer']">
          <div class="ks-table-summary">
            <table>
              <colgroup>
                <col
                  v-for="col in computedHeaders"
                  :key="col.key"
                  :style="{
                    width: col.width
                      ? typeof col.width == 'number'
                        ? col.width + 'px'
                        : col.width
                      : 'auto',
                    minWidth: col.minWidth
                      ? typeof col.minWidth == 'number'
                        ? col.minWidth + 'px'
                        : col.minWidth
                      : '50px',
                  }"
                />
              </colgroup>
              <tbody>
                <slot name="summary-footer"> </slot>
              </tbody>
            </table>
          </div>
        </template>
        <pagingComp
          v-if="hidePaging"
          :model-value="currPage"
          :page-size="pageSize"
          :totalPage="totalPage"
          @update:model-value="onChangePage"
          @update:pageSize="onChangePageSize"
        ></pagingComp>
      </template>
    </v-data-table>
  </div>
</template>
<style lang="scss"></style>
