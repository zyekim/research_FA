module.exports = {
  plugins: ["stylelint-scss", "stylelint-order"],
  extends: [
    "stylelint-config-standard-scss",
    "stylelint-config-recommended-vue/scss",
  ],
  customSyntax: "postcss-html",
  rules: {
    // BEM 규칙
    "selector-class-pattern": null,
    "rule-empty-line-before": null,
    "no-empty-source": null,
    "no-descending-specificity": null,
    "selector-no-vendor-prefix": null,
  },
};
