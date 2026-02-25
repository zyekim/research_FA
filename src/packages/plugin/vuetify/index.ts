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
  },
});
