"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/api/[...all]";
exports.ids = ["pages/api/[...all]"];
exports.modules = {

/***/ "http-proxy":
/*!*****************************!*\
  !*** external "http-proxy" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("http-proxy");

/***/ }),

/***/ "(api)/./pages/api/[...all].ts":
/*!*******************************!*\
  !*** ./pages/api/[...all].ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"config\": () => (/* binding */ config),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var http_proxy__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! http-proxy */ \"http-proxy\");\n/* harmony import */ var http_proxy__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(http_proxy__WEBPACK_IMPORTED_MODULE_0__);\n\nconst config = {\n  api: {\n    // Enable `externalResolver` option in Next.js\n    externalResolver: true,\n    bodyParser: false,\n    responseLimit: false\n  }\n};\n\nconst proxy = (req, res) => new Promise((resolve, reject) => {\n  const proxy = http_proxy__WEBPACK_IMPORTED_MODULE_0___default().createProxy();\n  proxy.once(\"proxyRes\", resolve).once(\"error\", reject).web(req, res, {\n    changeOrigin: true,\n    target: \"http://localhost:8080\"\n  });\n});\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (proxy);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9wYWdlcy9hcGkvWy4uLmFsbF0udHMuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBO0FBRU8sTUFBTUMsTUFBTSxHQUFHO0VBQ3BCQyxHQUFHLEVBQUU7SUFDSDtJQUNBQyxnQkFBZ0IsRUFBRSxJQUZmO0lBR0hDLFVBQVUsRUFBRSxLQUhUO0lBSUhDLGFBQWEsRUFBRTtFQUpaO0FBRGUsQ0FBZjs7QUFTUCxNQUFNQyxLQUFLLEdBQUcsQ0FBQ0MsR0FBRCxFQUF1QkMsR0FBdkIsS0FDWixJQUFJQyxPQUFKLENBQVksQ0FBQ0MsT0FBRCxFQUFVQyxNQUFWLEtBQXFCO0VBQy9CLE1BQU1MLEtBQWdCLEdBQUdOLDZEQUFBLEVBQXpCO0VBQ0FNLEtBQUssQ0FBQ08sSUFBTixDQUFXLFVBQVgsRUFBdUJILE9BQXZCLEVBQWdDRyxJQUFoQyxDQUFxQyxPQUFyQyxFQUE4Q0YsTUFBOUMsRUFBc0RHLEdBQXRELENBQTBEUCxHQUExRCxFQUErREMsR0FBL0QsRUFBb0U7SUFDbEVPLFlBQVksRUFBRSxJQURvRDtJQUVsRUMsTUFBTSxFQUFFO0VBRjBELENBQXBFO0FBSUQsQ0FORCxDQURGOztBQVNBLGlFQUFlVixLQUFmIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdW5vd2ViLy4vcGFnZXMvYXBpL1suLi5hbGxdLnRzPzM5OWQiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5jb21pbmdNZXNzYWdlLCBTZXJ2ZXJSZXNwb25zZSB9IGZyb20gXCJodHRwXCI7XG5pbXBvcnQgaHR0cFByb3h5IGZyb20gXCJodHRwLXByb3h5XCI7XG5cbmV4cG9ydCBjb25zdCBjb25maWcgPSB7XG4gIGFwaToge1xuICAgIC8vIEVuYWJsZSBgZXh0ZXJuYWxSZXNvbHZlcmAgb3B0aW9uIGluIE5leHQuanNcbiAgICBleHRlcm5hbFJlc29sdmVyOiB0cnVlLFxuICAgIGJvZHlQYXJzZXI6IGZhbHNlLFxuICAgIHJlc3BvbnNlTGltaXQ6IGZhbHNlXG4gIH0sXG59O1xuXG5jb25zdCBwcm94eSA9IChyZXE6IEluY29taW5nTWVzc2FnZSwgcmVzOiBTZXJ2ZXJSZXNwb25zZTxJbmNvbWluZ01lc3NhZ2U+KSA9PlxuICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgcHJveHk6IGh0dHBQcm94eSA9IGh0dHBQcm94eS5jcmVhdGVQcm94eSgpO1xuICAgIHByb3h5Lm9uY2UoXCJwcm94eVJlc1wiLCByZXNvbHZlKS5vbmNlKFwiZXJyb3JcIiwgcmVqZWN0KS53ZWIocmVxLCByZXMsIHtcbiAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgIHRhcmdldDogXCJodHRwOi8vbG9jYWxob3N0OjgwODBcIixcbiAgICB9KTtcbiAgfSk7XG5cbmV4cG9ydCBkZWZhdWx0IHByb3h5O1xuIl0sIm5hbWVzIjpbImh0dHBQcm94eSIsImNvbmZpZyIsImFwaSIsImV4dGVybmFsUmVzb2x2ZXIiLCJib2R5UGFyc2VyIiwicmVzcG9uc2VMaW1pdCIsInByb3h5IiwicmVxIiwicmVzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJjcmVhdGVQcm94eSIsIm9uY2UiLCJ3ZWIiLCJjaGFuZ2VPcmlnaW4iLCJ0YXJnZXQiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(api)/./pages/api/[...all].ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("(api)/./pages/api/[...all].ts"));
module.exports = __webpack_exports__;

})();