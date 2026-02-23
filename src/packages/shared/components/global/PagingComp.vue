<script lang="ts" setup>
  import {useDisplay} from "vuetify";
  const {mdAndDown} = useDisplay();
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
    },
    showPaging: {
      type: Boolean,
      default: true,
    },
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
    },
  );

  const onNextPage = () => {
    if (currPage.value < props.totalPage) {
      currPage.value++;
      emit("update:modelValue", currPage.value); // 페이지 변경 시 부모에게 알림
    }
  };
</script>
<template>
  <div class="rt-pagingComp">
    <v-pagination
      v-model="currPage"
      :length="totalPage"
      :total-visible="mdAndDown ? 3 : 5"
      @update:model-value="onPageChange"
    >
      <template #prev="{disabled}">
        <v-btn
          @click="onPrevPage"
          :disabled="disabled"
          variant="outlined"
          color="line-navy"
        >
          <v-icon>custom:arrowLeft</v-icon>
          Previous
        </v-btn>
      </template>
      <template #next="{disabled}">
        <v-btn
          @click="onNextPage"
          :disabled="disabled"
          variant="outlined"
          color="line-navy"
        >
          Next
          <v-icon>custom:arrowRight</v-icon>
        </v-btn>
      </template>
    </v-pagination>
    <v-select
      v-if="showPaging"
      class="rt-pagingSelect"
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
  .rt-pagingComp {
    display: flex;
    column-gap: 6px;
    justify-content: center;
    align-items: center;
    margin-top: 16px;
    padding-top: 12px;
    @include respond-down("mobile") {
      column-gap: 0;
      row-gap: 16px;
      flex-direction: column;
    }
  }
  .rt-pagination {
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
        .v-btn.v-btn--density-default {
          padding-inline: 12px;
          width: fit-content;
          height: 30px;
          .v-btn__content {
            column-gap: 8px;
            color: $primary;
            font-weight: 400;
            font-size: 12px;
            line-height: 140%;
            text-transform: none;
            .v-icon {
              font-size: 14px !important;
            }
          }
        }
      }
    }
  }
  .rt-pagingSelect.v-input {
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
