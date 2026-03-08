// useDataTable.ts

import { ref } from "vue";

export function useDataTable(fetchApi) {
  const items = ref([]);
  const total = ref(0);
  const loading = ref(false);

  const page = ref(1);
  const size = ref(10);

  const sortKey = ref();
  const sortOrder = ref();

  const load = async () => {
    loading.value = true;

    const res = await fetchApi({
      page: page.value,
      size: size.value,
      sortKey: sortKey.value,
      sortOrder: sortOrder.value,
    });

    items.value = res.list;
    total.value = res.total;

    loading.value = false;
  };

  return {
    items,
    total,
    loading,
    page,
    size,
    sortKey,
    sortOrder,
    load,
  };
}
