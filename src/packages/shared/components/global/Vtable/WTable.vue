<script setup lang="ts">
import { onMounted } from "vue";
import { useDataTable } from "./useTable";
import { exportExcel } from "./excel";

const props = defineProps({
  columns: Array,
  fetch: Function,
  selectable: Boolean,
  radio: Boolean,
});

const { items, total, loading, page, size, load } = useDataTable(props.fetch);

onMounted(load);

const downloadExcel = () => {
  exportExcel(items.value);
};
</script>

<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between">
      <div>데이터 목록</div>

      <v-btn
        color="primary"
        size="small"
        @click="downloadExcel"
      >
        Excel
      </v-btn>
    </v-card-title>

    <v-data-table-server
      :headers="columns"
      :items="items"
      :items-length="total"
      :loading="loading"
      :page="page"
      :items-per-page="size"
      show-select
      @update:options="load"
    >
      <template
        v-for="col in columns"
        :key="col.key"
        #[`item.${col.key}`]="{ item }"
      >
        <slot
          :name="col.key"
          :item="item"
        >
          {{ item[col.key] }}
        </slot>
      </template>
    </v-data-table-server>
  </v-card>
</template>
