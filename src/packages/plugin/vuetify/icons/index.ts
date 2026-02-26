import { defineAsyncComponent, h } from "vue";
import type { IconSet, IconProps } from "vuetify";

const iconFiles = import.meta.glob("./svgs/*.vue");

function camelize(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index == 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}

const customSvgNameToComponent = Object.fromEntries(
  Object.entries(iconFiles).map(([path, loader]) => {
    const fileName = path.split("/").pop()?.replace(".vue", "") ?? "";
    return [
      camelize(fileName),
      defineAsyncComponent(loader as any), // 각 아이콘이 별도 chunk로 분리됨
    ];
  })
);

// 아이콘 비동기호출
const customIcons: IconSet = {
  component: (props: IconProps) => {
    const name = typeof props.icon == "string" ? props.icon : "";
    const component = customSvgNameToComponent[name];

    if (!component) {
      console.warn(`[customIcons] "${name}" 아이콘 없음`);
      return h("span");
    }

    return h(component);
  },
};

export { customIcons };
