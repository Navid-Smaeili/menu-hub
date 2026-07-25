var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var import_express = __toESM(require("express"));
var import_products = require("@org/api/products");
const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 3333;
const app = (0, import_express.default)();
const productsService = new import_products.ProductsService();
app.use(import_express.default.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.get("/", (req, res) => {
  res.send({ message: "Hello API" });
});
app.get("/api/products", (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.minPrice) {
      filter.minPrice = Number(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      filter.maxPrice = Number(req.query.maxPrice);
    }
    if (req.query.inStock !== void 0) {
      filter.inStock = req.query.inStock === "true";
    }
    if (req.query.searchTerm) {
      filter.searchTerm = req.query.searchTerm;
    }
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 12;
    const result = productsService.getAllProducts(filter, page, pageSize);
    const response = {
      data: result,
      success: true
    };
    res.json(response);
  } catch (error) {
    const response = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
    res.status(500).json(response);
  }
});
app.get("/api/products/:id", (req, res) => {
  try {
    const product = productsService.getProductById(req.params.id);
    if (!product) {
      const response2 = {
        data: null,
        success: false,
        error: "Product not found"
      };
      return res.status(404).json(response2);
    }
    const response = {
      data: product,
      success: true
    };
    res.json(response);
  } catch (error) {
    const response = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
    res.status(500).json(response);
  }
});
app.get("/api/products-metadata/categories", (req, res) => {
  try {
    const categories = productsService.getCategories();
    const response = {
      data: categories,
      success: true
    };
    res.json(response);
  } catch (error) {
    const response = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
    res.status(500).json(response);
  }
});
app.get("/api/products-metadata/price-range", (req, res) => {
  try {
    const priceRange = productsService.getPriceRange();
    const response = {
      data: priceRange,
      success: true
    };
    res.json(response);
  } catch (error) {
    const response = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
    res.status(500).json(response);
  }
});
app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
//# sourceMappingURL=main.js.map
