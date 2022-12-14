"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/qwik-city/adaptors/azure-swa/vite/index.ts
var vite_exports = {};
__export(vite_exports, {
  azureSwaAdaptor: () => azureSwaAdaptor
});
module.exports = __toCommonJS(vite_exports);
var import_vite = require("../../shared/vite/index.cjs");
var import_node_path = require("path");
var import_node_fs = __toESM(require("fs"), 1);
function azureSwaAdaptor(opts = {}) {
  var _a;
  return (0, import_vite.viteAdaptor)({
    name: "azure-swa",
    origin: ((_a = process == null ? void 0 : process.env) == null ? void 0 : _a.URL) || "https://yoursitename.region.2.azurestaticapps.net",
    staticGenerate: opts.staticGenerate,
    ssg: opts.ssg,
    cleanStaticGenerated: true,
    async generate({ outputEntries, serverOutDir }) {
      const serverPackageJsonPath = (0, import_node_path.join)(serverOutDir, "package.json");
      const serverPackageJsonCode = `{"type":"module"}`;
      await import_node_fs.default.promises.mkdir(serverOutDir, { recursive: true });
      await import_node_fs.default.promises.writeFile(serverPackageJsonPath, serverPackageJsonCode);
      const azureSwaModulePath = outputEntries.find((entryName) => entryName === "entry.azure-swa");
      const funcJsonPath = (0, import_node_path.join)(serverOutDir, "function.json");
      const funcJson = JSON.stringify(
        {
          bindings: [
            {
              authLevel: "anonymous",
              type: "httpTrigger",
              direction: "in",
              name: "req",
              methods: [
                "get",
                "head",
                "post",
                "put",
                "delete",
                "connect",
                "options",
                "trace",
                "patch"
              ]
            },
            {
              type: "http",
              direction: "out",
              name: "response"
            }
          ],
          scriptFile: azureSwaModulePath
        },
        null,
        2
      );
      await import_node_fs.default.promises.writeFile(funcJsonPath, funcJson);
    }
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  azureSwaAdaptor
});
