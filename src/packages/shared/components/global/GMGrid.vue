<template>
  <v-card
    variant="outlined"
    class="pa-4"
  >
    <v-row
      class="mb-4"
      align="center"
    >
      <v-col
        cols="12"
        sm="4"
      >
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi:mdi-magnify"
          label="검색어 입력"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          @click:clear="onFilterChange"
          @keyup.enter="onFilterChange"
        ></v-text-field>
      </v-col>
      <v-col
        cols="12"
        sm="3"
      >
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          label="상태 선택"
          variant="outlined"
          density="compact"
          hide-details
          @update:model-value="onFilterChange"
        ></v-select>
      </v-col>
      <v-spacer></v-spacer>
      <v-col cols="auto">
        <v-btn
          color="primary"
          variant="flat"
          @click="onFilterChange"
          class="mr-2"
          >검색</v-btn
        >
        <v-btn
          color="success"
          prepend-icon="mdi:mdi-file-excel"
          @click="exportToExcel"
          >엑셀 다운로드</v-btn
        >
      </v-col>
    </v-row>

    <v-data-table-server
      v-model="selected"
      v-model:items-per-page="itemsPerPage"
      v-model:page="page"
      :headers="computedHeaders"
      :items="items"
      :items-length="totalItems"
      :loading="loading"
      :show-select="showSelect"
      fixed-header
      hover
      :height="height"
      class="custom-table"
      @update:options="loadItems"
    >
      <template v-slot:item.index="{ index }">
        {{ (page - 1) * itemsPerPage + index + 1 }}
      </template>

      <template
        v-for="col in headers"
        v-slot:[`item.${col.key}`]="{ item, index }"
      >
        <div
          :key="col.key"
          class="cell-wrapper"
          @click="enableEdit(index, col.key)"
        >
          <template v-if="isEditing(index, col.key) && col.editable">
            <slot
              :name="`edit-${col.key}`"
              :item="item"
            >
              <v-text-field
                v-model="item[col.key]"
                density="compact"
                variant="plain"
                hide-details
                autofocus
                @blur="disableEdit"
                @keyup.enter="disableEdit"
              ></v-text-field>
            </slot>
          </template>

          <template v-else>
            <v-tooltip
              :text="String(item[col.key])"
              location="top"
              v-if="col.tooltip"
            >
              <template v-slot:activator="{ props }">
                <span
                  v-bind="props"
                  class="text-truncate d-inline-block"
                  :style="{ maxWidth: col.width || '100%' }"
                >
                  <slot
                    :name="`cell-${col.key}`"
                    :item="item"
                    >{{ item[col.key] }}</slot
                  >
                </span>
              </template>
            </v-tooltip>
            <span
              v-else
              class="text-truncate d-inline-block"
              :style="{ maxWidth: col.width || '100%' }"
            >
              <slot
                :name="`cell-${col.key}`"
                :item="item"
                >{{ item[col.key] }}</slot
              >
            </span>
          </template>
        </div>
      </template>

      <template v-slot:item.actions="{ item }">
        <div class="fixed-actions">
          <slot
            name="actions"
            :item="item"
          ></slot>
        </div>
      </template>
    </v-data-table-server>
  </v-card>
</template>

<script setup>
import { ref, computed } from "vue";
import * as XLSX from "xlsx";

const props = defineProps({
  headers: Array,
  items: Array,
  totalItems: Number,
  loading: Boolean,
  statusOptions: Array,
  showSelect: Boolean,
  height: { type: String, default: "500px" },
});

const emit = defineEmits(["fetch-data", "update-item"]);

// 상태 관리
const page = ref(1);
const itemsPerPage = ref(10);
const search = ref("");
const statusFilter = ref("전체");
const selected = ref([]);

// 수정 모드 상태 (행 인덱스와 컬럼 키 저장)
const editCell = ref({ index: -1, key: "" });

const isEditing = (idx, key) =>
  editCell.value.index === idx && editCell.value.key === key;
const enableEdit = (idx, key) => {
  editCell.value = { index: idx, key };
};
const disableEdit = () => {
  editCell.value = { index: -1, key: "" };
};

const computedHeaders = computed(() => [
  { title: "No.", key: "index", sortable: false, width: "70px", fixed: true },
  ...props.headers,
  {
    title: "관리",
    key: "actions",
    sortable: false,
    align: "center",
    width: "100px",
    fixed: true,
  },
]);

// 데이터 로드 호출
const loadItems = (options) => {
  emit("fetch-data", {
    page: options.page,
    itemsPerPage: options.itemsPerPage,
    search: search.value,
    status: statusFilter.value,
  });
};

const onFilterChange = () => {
  page.value = 1;
  loadItems({ page: 1, itemsPerPage: itemsPerPage.value });
};

// 엑셀 다운로드
const exportToExcel = () => {
  const ws = XLSX.utils.json_to_sheet(props.items);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, "Table_Export.xlsx");
};
</script>

<style scoped lang="scss">
.custom-table {
  /* 짝수행 색상 */
  :deep(tbody tr:nth-of-type(even)) {
    background-color: #fafafa;
  }
  /* 선택행 색상 */
  :deep(tbody tr.v-data-table__selected) {
    background-color: #e3f2fd !important;
  }

  .cell-wrapper {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 0 4px;
    width: 100%;
    min-height: 40px;

    &:hover {
      border-radius: 4px;
      background-color: #f0f0f0;
    }
  }
}
.fixed-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}
</style>
