<script lang="ts" setup>
import { useDisplay } from "vuetify";
const { mdAndDown } = useDisplay();

import { usePagingStore } from "@/packages/common/store/pagingStore";
const pagingStore = usePagingStore();

const props = defineProps({
  modelValue: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 30,
  },
  totalPage: {
    type: Number,
    required: true,
  },
  pageSizes: {
    type: Array as () => number[],
    default: [],
  },
  showPaging: {
    type: Boolean,
    default: true,
  },
});

const pageSizes = computed(() => {
  return props.pageSizes.length > 0 ? props.pageSizes : pagingStore.pagingList;
});

const emit = defineEmits(["update:modelValue", "update:pageSize"]);

const currPage = ref(props.modelValue);
const currPageSize = ref(props.pageSize);

const onPageChange = (val: number) => {
  emit("update:modelValue", val);
};

const onPageSizeChange = (val: number) => {
  emit("update:pageSize", val);
};

const onPrevPage = () => {
  if (currPage.value > 1) {
    currPage.value--;
    emit("update:modelValue", currPage.value); // 페이지 변경 시 부모에게 알림
  }
};

watch(
  () => props.modelValue,
  (val) => {
    currPage.value = val;
  }
);

const onNextPage = () => {
  if (currPage.value < props.totalPage) {
    currPage.value++;
    emit("update:modelValue", currPage.value); // 페이지 변경 시 부모에게 알림
  }
};
</script>
<template>
  <div class="ws-pagingComp">
    <v-pagination
      v-model="currPage"
      :length="totalPage"
      :total-visible="5"
      @update:model-value="onPageChange"
      class="ws-pagination"
    >
      <template #prev="{ disabled }">
        <v-btn
          @click="onPrevPage"
          :disabled="disabled"
          variant="outlined"
          color="primary"
          icon="arrowLeft"
          density="compact"
        >
        </v-btn>
      </template>
      <template #next="{ disabled }">
        <v-btn
          @click="onNextPage"
          :disabled="disabled"
          variant="outlined"
          color="primary"
          icon="arrowRight"
          density="compact"
        >
        </v-btn>
      </template>
    </v-pagination>
    <v-select
      v-if="showPaging"
      class="ws-pagingSelect"
      v-model="currPageSize"
      :items="pageSizes"
      :return-object="false"
      :item-value="(item) => item"
      :item-title="(item) => item + '개씩보기'"
      density="compact"
      hide-details
      :clearable="false"
      @update:modelValue="onPageSizeChange"
    >
    </v-select>
  </div>
</template>
<style lang="scss">
.ws-pagingComp {
  display: flex;
  column-gap: 6px;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  padding-top: 12px;
}
.ws-pagination {
  &.v-pagination {
    $this: ".v-pagination";
    .v-btn {
      padding-inline: 0;
      .v-btn__content:after {
        display: none;
      }
    }
    #{$this}__list {
      align-items: center;
    }
    #{$this}__item {
      align-self: center;
      .v-btn.v-btn--density-default {
        border-radius: 6px;
        min-width: 24px;
        height: 100% !important;
        color: $body-light;
        font-weight: 400;
        font-size: 14px;
        line-height: 140%;
      }
    }
    #{$this}__item--is-active {
      .v-btn__overlay {
        opacity: 1;
        background: transparent;
      }
      .v-btn__content {
        color: $primary;
        font-weight: 700;
      }
    }
    #{$this}__prev,
    #{$this}__next {
      .v-btn.v-btn--density-compact {
        // padding-inline: 12px;
        width: fit-content;
        .v-btn__content {
          column-gap: 8px;
          font-weight: 400;
          font-size: 12px;
          line-height: 140%;
          text-transform: none;
          .v-icon {
            font-size: 12px;
          }
        }
      }
    }
  }
}

.ws-pagingSelect.v-input {
  flex: 0 0 fit-content;
  width: fit-content;
  .v-field .v-field__input {
    min-height: 30px !important;
  }
  .v-select__selection-text {
    font-size: 12px;
  }
  @include respond-down("tablet") {
    .v-field .v-field__input {
      min-height: 30px !important;
    }
  }
}
</style>
