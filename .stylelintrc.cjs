module.exports = {
  extends: [
    "stylelint-config-standard-scss",
    "stylelint-config-recommended-vue/scss",
  ],
  plugins: ["stylelint-order"],
  customSyntax: "postcss-html",
  rules: {
    "color-hex-case": "lower",
    "selector-class-pattern": null,
    "order/properties-order": [
      [
        "position",
        "top",
        "right",
        "bottom",
        "left",
        "z-index",

        "display",
        "flex",
        "flex-direction",
        "justify-content",
        "align-items",

        "width",
        "height",
        "margin",
        "padding",

        "font",
        "font-size",
        "color",
        "background",
      ],
      {
        unspecified: "bottomAlphabetical",
      },
    ],
  },
};
