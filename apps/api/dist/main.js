const Module = require("module");
const path = require("path");
const fs = require("fs");
const originalResolveFilename = Module._resolveFilename;
const distPath = __dirname;
const manifest = [{ "module": "@org/shop/data", "exactMatch": "packages/shop/data/src/index.js", "pattern": "packages/shop/data/src/index.ts" }, { "module": "@org/shop/feature-product-detail", "exactMatch": "packages/shop/feature-product-detail/src/index.js", "pattern": "packages/shop/feature-product-detail/src/index.ts" }, { "module": "@org/shop/feature-products", "exactMatch": "packages/shop/feature-products/src/index.js", "pattern": "packages/shop/feature-products/src/index.ts" }, { "module": "@org/shop/shared-ui", "exactMatch": "packages/shop/shared-ui/src/index.js", "pattern": "packages/shop/shared-ui/src/index.ts" }, { "module": "@org/api/products", "exactMatch": "packages/api/products/src/index.js", "pattern": "packages/api/products/src/index.ts" }, { "module": "@org/models", "exactMatch": "packages/shared/models/src/index.js", "pattern": "packages/shared/models/src/index.ts" }, { "module": "@org/ui", "exactMatch": "libs/ui/src/index.js", "pattern": "./libs/ui/src/index.ts" }, { "module": "@org/shared", "exactMatch": "libs/shared/src/index.js", "pattern": "./libs/shared/src/index.ts" }, { "module": "@org/auth", "exactMatch": "libs/auth/src/index.js", "pattern": "./libs/auth/src/index.ts" }];
Module._resolveFilename = function(request, parent) {
  let found;
  for (const entry of manifest) {
    if (request === entry.module && entry.exactMatch) {
      const entry2 = manifest.find((x) => request === x.module || request.startsWith(x.module + "/"));
      const candidate = path.join(distPath, entry2.exactMatch);
      if (isFile(candidate)) {
        found = candidate;
        break;
      }
    } else {
      const re = new RegExp(entry.module.replace(/\*$/, "(?<rest>.*)"));
      const match = request.match(re);
      if (match?.groups) {
        const candidate = path.join(distPath, entry.pattern.replace("*", ""), match.groups.rest);
        if (isFile(candidate)) {
          found = candidate;
        }
      }
    }
  }
  if (found) {
    const modifiedArguments = [found, ...[].slice.call(arguments, 1)];
    return originalResolveFilename.apply(this, modifiedArguments);
  } else {
    return originalResolveFilename.apply(this, arguments);
  }
};
function isFile(s) {
  try {
    require.resolve(s);
    return true;
  } catch (_e) {
    return false;
  }
}
module.exports = require("./apps/api/src/main.js");
//# sourceMappingURL=main.js.map
