/** @type {(function(Object): *)|{}} */
const withMT = require("@material-tailwind/html/utils/withMT");

module.exports = withMT({
  content: ["./index.html", "./src/assets/**/*.js"],
  theme: {
    extend: {}
  },
  plugins: []
});
