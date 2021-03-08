module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ["plugin:vue/essential", "eslint:recommended"],
  parserOptions: {
    parser: "babel-eslint"
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "quotes": [1, "single"],
    "semi": [ 0, "always" ],
    'space-before-function-paren': 0,
    "import/extensions": 0,
    'vue/no-parsing-error': [2, { "x-invalid-end-tag": false }]
  }
};
