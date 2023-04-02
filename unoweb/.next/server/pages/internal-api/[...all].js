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
exports.id = "pages/internal-api/[...all]";
exports.ids = ["pages/internal-api/[...all]"];
exports.modules = {

/***/ "./pages/internal-api/[...all].ts":
/*!****************************************!*\
  !*** ./pages/internal-api/[...all].ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"config\": () => (/* binding */ config),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var http_proxy__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! http-proxy */ \"http-proxy\");\n/* harmony import */ var http_proxy__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(http_proxy__WEBPACK_IMPORTED_MODULE_0__);\n\nconst config = {\n    api: {\n        // Enable `externalResolver` option in Next.js\n        externalResolver: true,\n        bodyParser: false,\n        responseLimit: false\n    }\n};\nconst proxy = (req, res)=>new Promise((resolve, reject)=>{\n        const proxy = http_proxy__WEBPACK_IMPORTED_MODULE_0___default().createProxy();\n        console.log(\"Aqui\");\n        console.log(req);\n        proxy.once(\"proxyRes\", resolve).once(\"error\", reject).web(req, res, {\n            changeOrigin: true,\n            target:  false ? 0 : \"http://api:8080\"\n        });\n    });\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (proxy);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9pbnRlcm5hbC1hcGkvWy4uLmFsbF0udHMuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNtQztBQUU1QixNQUFNQyxTQUFTO0lBQ3BCQyxLQUFLO1FBQ0gsOENBQThDO1FBQzlDQyxrQkFBa0IsSUFBSTtRQUN0QkMsWUFBWSxLQUFLO1FBQ2pCQyxlQUFlLEtBQUs7SUFDdEI7QUFDRixFQUFFO0FBRUYsTUFBTUMsUUFBUSxDQUFDQyxLQUFzQkMsTUFDbkMsSUFBSUMsUUFBUSxDQUFDQyxTQUFTQyxTQUFXO1FBQy9CLE1BQU1MLFFBQW1CTiw2REFBcUI7UUFDOUNhLFFBQVFDLEdBQUcsQ0FBQztRQUNaRCxRQUFRQyxHQUFHLENBQUNQO1FBQ1pELE1BQ0dTLElBQUksQ0FBQyxZQUFZTCxTQUNqQkssSUFBSSxDQUFDLFNBQVNKLFFBQ2RLLEdBQUcsQ0FBQ1QsS0FBS0MsS0FBSztZQUNiUyxjQUFjLElBQUk7WUFDbEJDLFFBQ0VDLE1BQXFDLEdBQ2pDLENBQTBCLEdBQzFCLGlCQUFpQjtRQUN6QjtJQUNKO0FBRUYsaUVBQWViLEtBQUtBLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly91bm93ZWIvLi9wYWdlcy9pbnRlcm5hbC1hcGkvWy4uLmFsbF0udHM/Zjg3ZCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmNvbWluZ01lc3NhZ2UsIFNlcnZlclJlc3BvbnNlIH0gZnJvbSBcImh0dHBcIjtcbmltcG9ydCBodHRwUHJveHkgZnJvbSBcImh0dHAtcHJveHlcIjtcblxuZXhwb3J0IGNvbnN0IGNvbmZpZyA9IHtcbiAgYXBpOiB7XG4gICAgLy8gRW5hYmxlIGBleHRlcm5hbFJlc29sdmVyYCBvcHRpb24gaW4gTmV4dC5qc1xuICAgIGV4dGVybmFsUmVzb2x2ZXI6IHRydWUsXG4gICAgYm9keVBhcnNlcjogZmFsc2UsXG4gICAgcmVzcG9uc2VMaW1pdDogZmFsc2UsXG4gIH0sXG59O1xuXG5jb25zdCBwcm94eSA9IChyZXE6IEluY29taW5nTWVzc2FnZSwgcmVzOiBTZXJ2ZXJSZXNwb25zZTxJbmNvbWluZ01lc3NhZ2U+KSA9PlxuICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgcHJveHk6IGh0dHBQcm94eSA9IGh0dHBQcm94eS5jcmVhdGVQcm94eSgpO1xuICAgIGNvbnNvbGUubG9nKFwiQXF1aVwiKTtcbiAgICBjb25zb2xlLmxvZyhyZXEpO1xuICAgIHByb3h5XG4gICAgICAub25jZShcInByb3h5UmVzXCIsIHJlc29sdmUpXG4gICAgICAub25jZShcImVycm9yXCIsIHJlamVjdClcbiAgICAgIC53ZWIocmVxLCByZXMsIHtcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICB0YXJnZXQ6XG4gICAgICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiXG4gICAgICAgICAgICA/IFwiaHR0cDovL2RldGktdmlvbGEudWEucHQvXCJcbiAgICAgICAgICAgIDogXCJodHRwOi8vYXBpOjgwODBcIixcbiAgICAgIH0pO1xuICB9KTtcblxuZXhwb3J0IGRlZmF1bHQgcHJveHk7XG4iXSwibmFtZXMiOlsiaHR0cFByb3h5IiwiY29uZmlnIiwiYXBpIiwiZXh0ZXJuYWxSZXNvbHZlciIsImJvZHlQYXJzZXIiLCJyZXNwb25zZUxpbWl0IiwicHJveHkiLCJyZXEiLCJyZXMiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImNyZWF0ZVByb3h5IiwiY29uc29sZSIsImxvZyIsIm9uY2UiLCJ3ZWIiLCJjaGFuZ2VPcmlnaW4iLCJ0YXJnZXQiLCJwcm9jZXNzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./pages/internal-api/[...all].ts\n");

/***/ }),

/***/ "http-proxy":
/*!*****************************!*\
  !*** external "http-proxy" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("http-proxy");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./pages/internal-api/[...all].ts"));
module.exports = __webpack_exports__;

})();