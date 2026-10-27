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
const receivedOrders = [];
const cafeTables = Array.from({ length: 12 }, (_, index) => ({
  id: `table-${index + 1}`,
  name: `\u0645\u06CC\u0632 ${index + 1}`,
  seats: index < 4 ? 2 : index < 9 ? 4 : 6,
  status: index === 2 || index === 7 ? "occupied" : index === 5 ? "reserved" : "available",
  updatedAt: (/* @__PURE__ */ new Date()).toISOString()
}));
app.use(import_express.default.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
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
app.post("/api/products", (req, res) => {
  const { name, description, price, category, imageUrl, inStock } = req.body ?? {};
  if (!name || !category || !Number.isFinite(Number(price)) || Number(price) <= 0) {
    return res.status(400).json({ success: false, error: "Name, category and a valid price are required" });
  }
  const product = productsService.addProduct({
    name: String(name).trim(),
    description: String(description ?? ""),
    price: Number(price),
    category: String(category).trim(),
    imageUrl: String(imageUrl ?? ""),
    inStock: inStock !== false
  });
  res.status(201).json({ success: true, data: product });
});
app.post("/api/products-metadata/categories", (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  if (!name) return res.status(400).json({ success: false, error: "Category name is required" });
  res.status(201).json({ success: true, data: productsService.addCategory(name) });
});
app.get("/api/orders", (_req, res) => {
  res.json({ success: true, data: receivedOrders });
});
app.post("/api/orders", (req, res) => {
  const { customer, phone, address, items, total } = req.body ?? {};
  if (!customer || !phone || !address || !items || !Number.isFinite(Number(total)) || Number(total) <= 0) {
    return res.status(400).json({ success: false, error: "Customer, phone, address, items and a valid total are required" });
  }
  const order = {
    id: `NN-${Date.now().toString().slice(-6)}`,
    customer: String(customer),
    phone: String(phone),
    address: String(address),
    items: String(items),
    total: Number(total),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    status: "new"
  };
  receivedOrders.unshift(order);
  res.status(201).json({ success: true, data: order });
});
app.patch("/api/orders/:id/status", (req, res) => {
  const order = receivedOrders.find((item) => item.id === req.params.id);
  const status = req.body?.status;
  if (!order) return res.status(404).json({ success: false, error: "Order not found" });
  if (!["new", "preparing", "ready"].includes(status)) {
    return res.status(400).json({ success: false, error: "Invalid order status" });
  }
  order.status = status;
  res.json({ success: true, data: order });
});
app.get("/api/tables", (_req, res) => {
  res.json({ success: true, data: cafeTables });
});
app.post("/api/tables", (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const seats = Number(req.body?.seats);
  if (!name || !Number.isInteger(seats) || seats < 1 || seats > 20) {
    return res.status(400).json({ success: false, error: "A table name and valid seat count are required" });
  }
  if (cafeTables.some((table2) => table2.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
    return res.status(409).json({ success: false, error: "A table with this name already exists" });
  }
  const table = {
    id: `table-${Date.now()}`,
    name,
    seats,
    status: "available",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  cafeTables.push(table);
  res.status(201).json({ success: true, data: table });
});
app.patch("/api/tables/:id/status", (req, res) => {
  const table = cafeTables.find((item) => item.id === req.params.id);
  const status = req.body?.status;
  if (!table) return res.status(404).json({ success: false, error: "Table not found" });
  if (!["available", "reserved", "occupied"].includes(status)) {
    return res.status(400).json({ success: false, error: "Invalid table status" });
  }
  table.status = status;
  table.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  res.json({ success: true, data: table });
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
