import { h, type Component } from "vue";
import type { IconSet, IconProps } from "vuetify";

const iconFiles = import.meta.glob("./svgs/*.vue", { eager: true });

/**
 * Converts a string to camelCase.
 * @param {string} str
 * @returns {string}
 */
function camelize(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index == 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}

const customSvgNameToComponent: Record<string, Component> = Object.fromEntries(
  Object.entries(iconFiles).map(([path, module]) => {
    const fileName = path.split("/").pop()?.replace(".vue", "");
    const camelCaseName = fileName ? camelize(fileName) : "";
    return [camelCaseName, (module as any).default];
  })
);

const customIcons: IconSet = {
  component: (props: IconProps) =>
    h(customSvgNameToComponent[props.icon as string]),
};

export { customIcons };
