var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var products_service_exports = {};
__export(products_service_exports, {
  ProductsService: () => ProductsService
});
module.exports = __toCommonJS(products_service_exports);
class ProductsService {
  constructor() {
    this.categories = ["Electronics", "Clothing", "Books", "Home & Garden", "Sports"];
    this.products = this.generateMockProducts();
  }
  generateMockProducts() {
    const products = [];
    for (let i = 1; i <= 50; i++) {
      const category = this.categories[Math.floor(Math.random() * this.categories.length)];
      products.push({
        id: `prod-${i}`,
        name: `Product ${i}`,
        description: `This is a high-quality ${category.toLowerCase()} product with excellent features and great value for money.`,
        price: Math.round(Math.random() * 500 * 100) / 100 + 10,
        category,
        imageUrl: `https://placehold.co/300x300?text=Product+${i}`,
        inStock: Math.random() > 0.2,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 500)
      });
    }
    return products;
  }
  getAllProducts(filter, page = 1, pageSize = 12) {
    let filteredProducts = [...this.products];
    if (filter) {
      if (filter.category) {
        filteredProducts = filteredProducts.filter(
          (p) => p.category === filter.category
        );
      }
      if (filter.minPrice !== void 0) {
        filteredProducts = filteredProducts.filter(
          (p) => p.price >= filter.minPrice
        );
      }
      if (filter.maxPrice !== void 0) {
        filteredProducts = filteredProducts.filter(
          (p) => p.price <= filter.maxPrice
        );
      }
      if (filter.inStock !== void 0) {
        filteredProducts = filteredProducts.filter(
          (p) => p.inStock === filter.inStock
        );
      }
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        filteredProducts = filteredProducts.filter(
          (p) => p.name.toLowerCase().includes(searchLower) || p.description.toLowerCase().includes(searchLower) || p.category.toLowerCase().includes(searchLower)
        );
      }
    }
    const total = filteredProducts.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = filteredProducts.slice(startIndex, endIndex);
    return {
      items,
      total,
      page,
      pageSize,
      totalPages
    };
  }
  getProductById(id) {
    return this.products.find((p) => p.id === id) || null;
  }
  getCategories() {
    return [.../* @__PURE__ */ new Set([...this.categories, ...this.products.map((p) => p.category)])];
  }
  addCategory(name) {
    const category = name.trim();
    if (category && !this.categories.includes(category)) this.categories.push(category);
    return this.getCategories();
  }
  addProduct(product) {
    const created = {
      ...product,
      id: `prod-${Date.now()}`,
      rating: 0,
      reviewCount: 0
    };
    this.products.unshift(created);
    this.addCategory(created.category);
    return created;
  }
  getPriceRange() {
    const prices = this.products.map((p) => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ProductsService
});
//# sourceMappingURL=products.service.js.map
