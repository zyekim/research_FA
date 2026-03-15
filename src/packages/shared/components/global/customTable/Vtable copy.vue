<script setup lang="ts">
import { usePagingStore } from "@/packages/common/store/pagingStore";
const pagingStore = usePagingStore();

const { pageLim, pageNo, totalPage } = storeToRefs(pagingStore);

defineOptions({
  inheritAttrs: false,
  name: "Vtable",
});

const emit = defineEmits([
  "update:page",
  "update:pageSize",
  "update:loading",
  "update:selected",
  "update:select-all",
  "update:expand",
]);

const props = defineProps({
  headers: { type: Array, required: true },
  items: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  addIndex: { type: Boolean, default: false }, // no 칼럼 추가 여부
  showActions: { type: Boolean, default: false }, // action 칼럼 추가 여부
  height: { type: String, default: "60vh" },
  // 선택
  selectionType: {
    type: String,
    default: "none",
    validator: (value: string) => {
      return ["checkbox", "radio", "none"].includes(value);
    },
  },
  itemSelectable: {
    type: [String, Function, Array] as import("vue").PropType<any>,
    default: "selectable",
  },
  selectedItems: {
    type: Array as import("vue").PropType<any[]>,
    default: (): any[] => [],
  }, // 선택된 아이템
  // expand
  expandable: { type: Boolean, default: false },
  totalPage: { type: Number, required: true, default: 0 },
});

const checkAlign = (headerItem: { key: string; align?: string }) => {
  return headerItem.align || "center";
};

// 헤더
const computedHeaders = computed(() => {
  const config = {
    sortable: false,
    minWidth: "60px",
  };

  const selectColumn = {
    title: "",
    key: "data-table-select",
    fixed: "start",
    width: "40px",
    align: "center",
    sortable: false,
  };

  const noColumn = {
    title: "No",
    key: "no",
    fixed: "start",
    width: "60px",
    align: "center",
    sortable: false,
  };

  const actionColumn = {
    title: "",
    key: "actions",
    fixed: "end",
    align: "center",
    sortable: false,
  };

  const headers = props.headers.map((header: any) => {
    return {
      ...header,
      ...config,
      align: checkAlign(header),
    };
  });

  // no 칼럼 추가
  if (props.addIndex) {
    headers.unshift(noColumn);
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

// 칼럼
const passableColumns = computed(() =>
  props.headers.filter(
    (h: any) =>
      !["data-table-select", "actions", "data-table-expand"].includes(h.key)
  )
);

// 페이징
const onChangePage = async (page: number) => {
  emit("update:loading", true);
  emit("update:page", page);
};

const onChangePageSize = async (size: number) => {
  emit("update:loading", true);
  emit("update:pageSize", size);
  emit("update:page", 1);
};
</script>
<template>
  <div>
    <v-data-table
      v-bind="$attrs"
      :headers="computedHeaders"
      :items="items"
      fixedHeader
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
      <!-- 체크박스 헤더 -->
      <template
        v-if="selectionType == 'checkbox'"
        #header.data-table-select
      >
        <v-checkbox-btn />
        <!-- :model-value="isAllSelected"
        :indeterminate="isIndeterminate"
        @click.stop="toggleSelectAll" -->
      </template>
      <!-- 체크박스 / 라디오 row -->
      <template #item.data-table-select="{ item }">
        <v-checkbox-btn
          v-if="selectionType == 'checkbox'"
          @click="emit('update:selected', item)"
        />
        <v-radio
          v-else
          @click="emit('update:selected', item)"
        />
      </template>
      <!-- 인덱스 -->
      <template v-slot:item.index="{ index }">
        {{ (pageNo - 1) * pageLim + index + 1 }}
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
          <!--
            슬롯 미정의 시: Vuetify가 value fn을 이미 처리했으므로
            slotProps.value 를 그대로 사용
          -->
          {{ slotProps.value ?? slotProps.item[(col as any).key] }}
        </slot>
      </template>
      <template
        v-if="showActions"
        #item.actions="{ item }"
      >
        <slot
          name="item.actions"
          v-bind="item"
        >
        </slot>
      </template>
      <!-- expand -->
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
          ></td>
        </slot>
      </template>
      <!-- ── 로딩 ── -->
      <template #loading>
        <v-skeleton-loader type="table-row@6" />
      </template>
      <!-- ── 빈화면 ── -->
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
      <!-- 페이징 -->
      <template #bottom="{ page, itemsPerPage, sortBy }">
        <pagingComp
          :model-value="page"
          class="mt-0 pb-12"
          :page-size="itemsPerPage"
          :totalPage="totalPage"
          @update:model-value="onChangePage"
          @update:pageSize="onChangePageSize"
        ></pagingComp>
      </template>
    </v-data-table>
  </div>
</template>
