<script setup lang="ts">
/**
 * Vtable.vue
 *
 * 레이아웃:
 * ┌─────────────────────────────────────────────┐  ← .vtable-wrapper
 * │  v-data-table  ($attrs 직접 전달)           │  ← height prop or 100%
 * │  ┌───────────────────────────────────────┐  │
 * │  │  thead (sticky)                       │  │
 * │  ├───────────────────────────────────────┤  │
 * │  │  tbody (scroll)                       │  │
 * │  ├───────────────────────────────────────┤  │
 * │  │  #bottom (스크롤 밖 고정)             │  │
 * │  │    └─ [summary table]  (hasSummary)   │  │  ← 헤더 col 너비 동기화
 * │  │    └─ [pagingComp]                    │  │
 * │  └───────────────────────────────────────┘  │
 * └─────────────────────────────────────────────┘
 *
 * ┌───────────────────────────────────────────┐   (hasSubTable)
 * │  sub-table slot                           │   ← subTableHeight px
 * └───────────────────────────────────────────┘
 *
 * Props:
 *   headers          DataTableHeader[]   (value: fn 지원, Vuetify 그대로)
 *   items            any[]
 *   loading          boolean
 *   height           string              테이블 높이 (default '60vh')
 *                                        '100%' + headerOffset 조합 가능
 *   headerOffset     number              height='100%'일 때 calc(100vh - N)
 *
 *   addIndex         boolean             No. 컬럼 자동 추가
 *   showActions      boolean             Actions 컬럼 자동 추가
 *   expandable       boolean
 *
 *   selectionType    'checkbox'|'radio'|'none'
 *   itemSelectable   string|Function     Vuetify item-selectable 그대로
 *   selectedItems    any[]               초기 선택값
 *
 *   totalPage        number              (required) 페이징용 총 페이지
 *
 *   hasSummary       boolean             합계 영역 표시
 *   subTableHeight   number              서브 테이블 높이(px), 0=없음
 *   subTableGap      number              메인↔서브 간격(px, default 16)
 *
 * Emits:
 *   update:selected     선택 아이템 배열 (return-object)
 *   update:select-all   전체선택 boolean
 *   update:expand       expand 이벤트
 *   update:page         페이지 번호
 *   update:pageSize     페이지 사이즈
 *   update:loading      loading boolean
 *
 * Slots:
 *   item.{key}        셀 커스텀  (value fn 있는 컬럼도 슬롯으로 override 가능)
 *   item.actions      액션 셀
 *   expanded-row      expand 영역
 *   summary           합계 <td> 들을 직접 작성
 *                     ※ computedHeaders 순서에 맞게 <td> 배치
 *   sub-table         서브 테이블 전체 영역
 */

import { usePagingStore } from "@/packages/common/store/pagingStore";

defineOptions({
  inheritAttrs: false,
  name: "Vtable",
});

const pagingStore = usePagingStore();
const { pageLim, pageNo, totalPage: storeTotalPage } = storeToRefs(pagingStore);

// ── Emits ─────────────────────────────────────────────────────────────────
const emit = defineEmits([
  "update:page",
  "update:pageSize",
  "update:loading",
  "update:selected",
  "update:select-all",
  "update:expand",
]);

// ── Props ─────────────────────────────────────────────────────────────────
const props = defineProps({
  headers: { type: Array as PropType<any[]>, required: true },
  items: { type: Array as PropType<any[]>, required: true },
  loading: { type: Boolean, default: false },
  /**
   * 테이블 높이.
   * '100%' + headerOffset 조합으로 전체화면 사용 가능.
   * 그 외 '60vh', '400px' 등 CSS 값 그대로 사용.
   */
  height: { type: String, default: "60vh" },
  /**
   * height='100%' 일 때 상단 고정 UI(appbar 등) 높이(px).
   * wrapper 높이 = calc(100vh - N)
   */
  headerOffset: { type: Number, default: 0 },

  // 컬럼
  addIndex: { type: Boolean, default: false },
  showActions: { type: Boolean, default: false },
  expandable: { type: Boolean, default: false },

  // 선택
  selectionType: {
    type: String as PropType<"checkbox" | "radio" | "none">,
    default: "none",
    validator: (v: string) => ["checkbox", "radio", "none"].includes(v),
  },
  /**
   * Vuetify item-selectable 그대로.
   * string  → item[key] 가 truthy면 선택 가능
   * Function → (item) => boolean
   */
  itemSelectable: {
    type: [String, Function, Array] as PropType<any>,
    default: "selectable",
  },
  selectedItems: {
    type: Array as PropType<any[]>,
    default: () => [],
  },

  // 페이징
  totalPage: { type: Number, required: true, default: 0 },

  // 합계/서브
  hasSummary: { type: Boolean, default: false },
  subTableHeight: { type: Number, default: 0 },
  subTableGap: { type: Number, default: 16 },
});

// ── 높이 ─────────────────────────────────────────────────────────────────
const hasSubTable = computed(() => props.subTableHeight > 0);

/**
 * wrapper 스타일.
 * height='100%' + headerOffset > 0 → calc(100vh - N)
 * height='100%' 단독              → 100%
 * 그 외('60vh' 등)                → height 값 그대로
 */
const wrapperStyle = computed(() => {
  if (props.height === "100%" && props.headerOffset > 0) {
    return {
      height: `calc(100vh - ${props.headerOffset}px)`,
      display: "flex",
      flexDirection: "column" as const,
      overflow: "hidden",
    };
  }
  if (props.height === "100%") {
    return {
      height: "100%",
      display: "flex",
      flexDirection: "column" as const,
      overflow: "hidden",
    };
  }
  // 고정 높이 or vh: 서브 테이블 있으면 flex로 분할
  return {
    height: props.height,
    display: hasSubTable.value ? ("flex" as const) : undefined,
    flexDirection: hasSubTable.value ? ("column" as const) : undefined,
    overflow: hasSubTable.value ? ("hidden" as const) : undefined,
  };
});

/**
 * v-data-table height.
 * 서브 테이블이 있으면 남은 높이에서 subTableHeight + gap 차감.
 * 없으면 wrapper 높이 그대로 ('100%' or '60vh').
 */
const tableHeight = computed(() => {
  if (!hasSubTable.value) return props.height;
  // wrapper가 flex column이므로 calc 가능
  return `calc(100% - ${props.subTableHeight + props.subTableGap}px)`;
});

// ── 헤더 계산 ─────────────────────────────────────────────────────────────
const checkAlign = (h: any) => h.align || "center";

const computedHeaders = computed(() => {
  const base = props.headers.map((h: any) => ({
    ...h,
    sortable: false,
    minWidth: h.minWidth ?? "60px",
    align: checkAlign(h),
  }));

  const selectCol = {
    title: "",
    key: "data-table-select",
    fixed: "start",
    width: "40px",
    align: "center",
    sortable: false,
  };

  const noCol = {
    title: "No",
    key: "no",
    fixed: "start",
    width: "60px",
    align: "center",
    sortable: false,
  };

  const actionCol = {
    title: "",
    key: "actions",
    fixed: "end",
    align: "center",
    sortable: false,
  };

  // 순서: [select] [no] [...data] [actions]
  return [
    ...(props.selectionType !== "none" ? [selectCol] : []),
    ...(props.addIndex ? [noCol] : []),
    ...base,
    ...(props.showActions ? [actionCol] : []),
  ];
});

// 동적 슬롯 위임 대상 (시스템 컬럼 제외)
const SYSTEM_KEYS = new Set([
  "data-table-select",
  "data-table-expand",
  "actions",
  "no",
]);
const passableColumns = computed(() =>
  props.headers.filter((h: any) => !SYSTEM_KEYS.has(h.key))
);

// ── 페이징 ────────────────────────────────────────────────────────────────
const onChangePage = (page: number) => {
  emit("update:loading", true);
  emit("update:page", page);
};

const onChangePageSize = (size: number) => {
  emit("update:loading", true);
  emit("update:pageSize", size);
  emit("update:page", 1);
};

const itemDisabled = (item: any) => {
  return item.disabled;
};
</script>

<template>
  <div
    class="vtable-wrapper"
    :style="wrapperStyle"
  >
    <!--
      ★ 핵심: $attrs를 여기(v-data-table)에만 전달.
         wrapper div는 레이아웃 전담, Vuetify attr은 테이블로.
         → 헤더 value 함수도 Vuetify 내부에서 그대로 처리됨.
    -->
    <v-data-table
      v-bind="$attrs"
      :headers="computedHeaders"
      :items="items"
      :height="tableHeight"
      fixed-header
      striped="even"
      hover
      hide-default-footer
      :item-selectable="itemSelectable"
      :items-per-page="pageLim"
      :page="pageNo"
      :loading="loading"
      return-object
      :show-expand="expandable"
      @update:select-all="emit('update:select-all', $event)"
      @update:selected="emit('update:selected', $event)"
      @update:expand="emit('update:expand', $event)"
      @update:page="onChangePage"
      @update:items-per-page="onChangePageSize"
      @update:loading="emit('update:loading', $event)"
    >
      <!-- ── 체크박스 헤더 ── -->

      <template
        v-if="selectionType == 'checkbox'"
        v-slot:header.data-table-select="{
          allSelected,
          selectAll,
          someSelected,
        }"
      >
        <v-checkbox-btn
          :indeterminate="someSelected && !allSelected"
          :model-value="allSelected"
          color="primary"
          @update:model-value="selectAll(!allSelected)"
          :disabled=""
        ></v-checkbox-btn>
      </template>

      <template
        v-if="selectionType == 'checkbox'"
        v-slot:item.data-table-select="{
          internalItem,
          isSelected,
          toggleSelect,
        }"
      >
        <v-checkbox-btn
          :model-value="isSelected(internalItem)"
          color="primary"
          @update:model-value="toggleSelect(internalItem)"
        ></v-checkbox-btn>
      </template>
      <!-- ── 셀: 체크박스 / 라디오 ── -->
      <template #item.data-table-select="{ item }">
        <v-checkbox-btn
          v-if="selectionType == 'checkbox'"
          @click="emit('update:selected', item)"
        />
        <v-radio
          v-else-if="selectionType == 'radio'"
          @click="emit('update:selected', item)"
        />
      </template>

      <!-- ── No. 컬럼 ── -->
      <template
        v-if="addIndex"
        #item.no="{ index }"
      >
        {{ (pageNo - 1) * pageLim + index + 1 }}
      </template>

      <!-- ── 동적 셀 슬롯 위임 ──
           value 함수는 $attrs를 통해 v-data-table에 그대로 전달되므로
           Vuetify 내부에서 처리됨. 슬롯이 없으면 Vuetify 기본 렌더링 사용.
      ── -->
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
          <!--
            슬롯 미정의 시: Vuetify가 value fn을 이미 처리했으므로
            slotProps.value 를 그대로 사용
          -->
          {{ slotProps.value ?? slotProps.item[(col as any).key] }}
        </slot>
      </template>

      <!-- ── 액션 ── -->
      <template
        v-if="showActions"
        #item.actions="{ item }"
      >
        <slot
          name="item.actions"
          :item="item"
        />
      </template>

      <!-- ── Expand ── -->
      <template
        v-if="expandable"
        #expanded-row="{ item }"
      >
        <slot
          name="expanded-row"
          :item="item"
        >
          <td
            :colspan="computedHeaders.length"
            class="pa-4 bg-grey-lighten-4"
          />
        </slot>
      </template>

      <!-- ── 로딩 ── -->
      <template #loading>
        <v-skeleton-loader type="table-row@6" />
      </template>

      <!-- ── 빈 화면 ── -->
      <template #no-data>
        <div
          class="d-flex flex-column align-center justify-center py-10 text-medium-emphasis"
        >
          <v-icon
            icon="mdi:mdi-table-off"
            size="40"
            class="mb-2"
          />
          <span class="text-body-2">데이터가 없습니다</span>
        </div>
      </template>

      <!-- ══ #bottom: [합계 table] + [pagingComp] ══════════════════════
           #bottom은 tbody 스크롤 밖 하단 고정.
           합계 table은 colgroup으로 헤더 컬럼 너비와 동기화.
      ══════════════════════════════════════════════════════════════════ -->
      <template #bottom>
        <!-- 합계 영역 -->
        <div
          v-if="hasSummary"
          class="vtable-summary"
        >
          <!--
            <colgroup>이 computedHeaders width를 미러링 → 본체 테이블과 셀 너비 동기화.
            슬롯에서 <td class="vtable-summary__cell"> 들을 작성하면 됨.

            예시:
            <template #summary>
              <td class="vtable-summary__cell">합계</td>
              <td class="vtable-summary__cell text-right font-weight-bold">1,234</td>
            </template>
          -->
          <table class="vtable-summary__table">
            <colgroup>
              <col
                v-for="col in computedHeaders"
                :key="(col as any).key"
                :style="{
                  width: (col as any).width
                    ? typeof (col as any).width == 'number'
                      ? `${(col as any).width}px`
                      : (col as any).width
                    : undefined,
                }"
              />
            </colgroup>
            <tbody>
              <tr>
                <slot
                  name="summary"
                  :headers="computedHeaders"
                >
                  <!-- 기본: 첫 셀 '합계', 나머지 빈 셀 -->
                  <td class="vtable-summary__cell font-weight-bold">합계</td>
                  <td
                    v-for="col in computedHeaders.slice(1)"
                    :key="(col as any).key"
                    class="vtable-summary__cell"
                  />
                </slot>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 페이징 -->
        <pagingComp
          :model-value="pageNo"
          class="ws-pagingComp"
          :page-size="pageLim"
          :totalPage="totalPage"
          @update:model-value="onChangePage"
          @update:pageSize="onChangePageSize"
        />
      </template>
    </v-data-table>

    <!-- ══ 서브 테이블 ══════════════════════════════════════════════════ -->
    <div
      v-if="hasSubTable"
      class="vtable-sub"
      :style="{
        height: `${subTableHeight}px`,
        marginTop: `${subTableGap}px`,
      }"
    >
      <slot name="sub-table">
        <div class="vtable-sub__placeholder">sub-table slot을 채워주세요</div>
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* ── wrapper ─────────────────────────────────────────────────── */
.vtable-wrapper {
  // flex/height는 wrapperStyle에서 inline으로 처리
  // 전역 스타일(v-data-table.v-table--fixed-header)과 충돌 방지용 래퍼
}

/* ── 합계 영역 ────────────────────────────────────────────────── */
.vtable-summary {
  border-top: 1px solid #ddd;
  background: #f9f9f9;
  overflow-x: auto; // 가로 스크롤 테이블과 함께 스크롤
  overflow-y: hidden;
}

.vtable-summary__table {
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
}

.vtable-summary__cell {
  vertical-align: middle;
  border: none;
  padding: 6px 16px;
  color: #424145;
  font-size: 12px;
  white-space: nowrap;

  &.text-right {
    text-align: right;
  }
  &.text-center {
    text-align: center;
  }
  &.text-left {
    text-align: left;
  }
}

/* ── 서브 테이블 ──────────────────────────────────────────────── */
.vtable-sub {
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  overflow: hidden;
}

.vtable-sub__placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: rgba(0, 0, 0, 0.38);
  font-size: 0.875rem;
}
</style>
