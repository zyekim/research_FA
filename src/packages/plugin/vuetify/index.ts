/**
 * iconset
 */
import { customIcons } from "./icons"; // custom 아이콘 - 메인
import { aliases, mdi } from "vuetify/iconsets/mdi"; // mdi 아이콘 - 서브

/**
 * style
 */
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
// import "vuetify/styles/core"; // Reset and structure (Required first)
// import "vuetify/styles/colors"; // Optional: standard color classes
// import "vuetify/styles/utilities"; // Optional: helper classes
import { DEFAULT_THEME } from "./theme/DefaultTheme";

/**
 * Composables
 */
import { createVuetify } from "vuetify";

export default createVuetify({
  // 색상
  theme: {
    defaultTheme: "DEFAULT_THEME",
    themes: {
      DEFAULT_THEME,
    },
  },
  // 아이콘
  icons: {
    defaultSet: "custom",
    aliases,
    sets: {
      mdi,
      custom: customIcons,
    },
  },
  defaults: {
    // 컴포넌트 기본 props 설정
    global: {
      // 전역 컨트롤
      clearIcon: "custom:close",
      hideDetails: "auto",
    },
    VAppBar: {
      tile: true,
      flat: true,
    },
    VBtn: {
      variant: "flat",
      ripple: false,
    },
    VTextField: {
      variant: "outlined",
      hideDetails: "true",
      clearable: true,
    },
    VSelect: {
      clearable: true,
      variant: "outlined",
      menuIcon: "arrowDown",
      centerAffix: true,
      noDataText: "데이터가 없습니다.",
    },
    VCheckbox: {
      falseIcon: "checkboxOff",
      trueIcon: "checkboxOn",
      indeterminateIcon: "checkboxIndeter",
    },
    VRadio: {
      falseIcon: "radioOff",
      trueIcon: "radioOn",
      density: "compact",
    },
    VCheckboxBtn: {
      falseIcon: "checkboxOff",
      trueIcon: "checkboxOn",
      density: "compact",
      indeterminateIcon: "checkboxIndeter",
    },
    VRadioGroup: {
      density: "compact",
      falseIcon: "radioOff",
      trueIcon: "radioOn",
    },
    VDataTableServer: {
      noDataText: "조회된 결과가 없습니다.",
      loadingText: "로딩중입니다. 잠시만 기다려주세요.",
      itemPerPage: 30,
      prevIcon: "arrowLeft",
      nextIcon: "arrowRight",
      firstIcon: "mdi:mdi-page-first",
      lastIcon: "mdi:mdi-page-last",
      striped: "even",
      showCurrentPage: true,
      fixedHeader: true,
      density: "compact",
      nowrap: false,
    },
  },
});
