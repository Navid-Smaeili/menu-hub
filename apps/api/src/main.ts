import express from 'express';
import { ProductsService } from '@org/api/products';
import { ApiResponse, Product, ProductFilter, PaginatedResponse } from '@org/models';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3333;

const app = express();
const productsService = new ProductsService();
interface ReceivedOrder {
  id: string;
  customer: string;
  phone: string;
  address: string;
  items: string;
  total: number;
  createdAt: string;
  status: 'new' | 'preparing' | 'ready';
}
interface CafeTable {
  id: string;
  name: string;
  seats: number;
  status: 'available' | 'reserved' | 'occupied';
  updatedAt: string;
}
const receivedOrders: ReceivedOrder[] = [];
const cafeTables: CafeTable[] = Array.from({ length: 12 }, (_, index) => ({
  id: `table-${index + 1}`,
  name: `میز ${index + 1}`,
  seats: index < 4 ? 2 : index < 9 ? 4 : 6,
  status: index === 2 || index === 7 ? 'occupied' : index === 5 ? 'reserved' : 'available',
  updatedAt: new Date().toISOString(),
}));

// Middleware
app.use(express.json());

// CORS configuration for Angular app
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

// Products endpoints
app.get('/api/products', (req, res) => {
  try {
    const filter: ProductFilter = {};

    if (req.query.category) {
      filter.category = req.query.category as string;
    }
    if (req.query.minPrice) {
      filter.minPrice = Number(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      filter.maxPrice = Number(req.query.maxPrice);
    }
    if (req.query.inStock !== undefined) {
      filter.inStock = req.query.inStock === 'true';
    }
    if (req.query.searchTerm) {
      filter.searchTerm = req.query.searchTerm as string;
    }

    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 12;

    const result = productsService.getAllProducts(filter, page, pageSize);

    const response: ApiResponse<PaginatedResponse<Product>> = {
      data: result,
      success: true,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(500).json(response);
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = productsService.getProductById(req.params.id);

    if (!product) {
      const response: ApiResponse<null> = {
        data: null,
        success: false,
        error: 'Product not found',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<Product> = {
      data: product,
      success: true,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(500).json(response);
  }
});

app.post('/api/products', (req, res) => {
  const { name, description, price, category, imageUrl, inStock } = req.body ?? {};
  if (!name || !category || !Number.isFinite(Number(price)) || Number(price) <= 0) {
    return res.status(400).json({ success: false, error: 'Name, category and a valid price are required' });
  }
  const product = productsService.addProduct({
    name: String(name).trim(),
    description: String(description ?? ''),
    price: Number(price),
    category: String(category).trim(),
    imageUrl: String(imageUrl ?? ''),
    inStock: inStock !== false,
  });
  res.status(201).json({ success: true, data: product });
});

app.post('/api/products-metadata/categories', (req, res) => {
  const name = String(req.body?.name ?? '').trim();
  if (!name) return res.status(400).json({ success: false, error: 'Category name is required' });
  res.status(201).json({ success: true, data: productsService.addCategory(name) });
});

app.get('/api/orders', (_req, res) => {
  res.json({ success: true, data: receivedOrders });
});

app.post('/api/orders', (req, res) => {
  const { customer, phone, address, items, total } = req.body ?? {};
  if (!customer || !phone || !address || !items || !Number.isFinite(Number(total)) || Number(total) <= 0) {
    return res.status(400).json({ success: false, error: 'Customer, phone, address, items and a valid total are required' });
  }
  const order: ReceivedOrder = {
    id: `NN-${Date.now().toString().slice(-6)}`,
    customer: String(customer),
    phone: String(phone),
    address: String(address),
    items: String(items),
    total: Number(total),
    createdAt: new Date().toISOString(),
    status: 'new',
  };
  receivedOrders.unshift(order);
  res.status(201).json({ success: true, data: order });
});

app.patch('/api/orders/:id/status', (req, res) => {
  const order = receivedOrders.find(item => item.id === req.params.id);
  const status = req.body?.status;
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
  if (!['new', 'preparing', 'ready'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid order status' });
  }
  order.status = status;
  res.json({ success: true, data: order });
});

app.get('/api/tables', (_req, res) => {
  res.json({ success: true, data: cafeTables });
});

app.post('/api/tables', (req, res) => {
  const name = String(req.body?.name ?? '').trim();
  const seats = Number(req.body?.seats);
  if (!name || !Number.isInteger(seats) || seats < 1 || seats > 20) {
    return res.status(400).json({ success: false, error: 'A table name and valid seat count are required' });
  }
  if (cafeTables.some(table => table.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
    return res.status(409).json({ success: false, error: 'A table with this name already exists' });
  }
  const table: CafeTable = {
    id: `table-${Date.now()}`,
    name,
    seats,
    status: 'available',
    updatedAt: new Date().toISOString(),
  };
  cafeTables.push(table);
  res.status(201).json({ success: true, data: table });
});

app.patch('/api/tables/:id/status', (req, res) => {
  const table = cafeTables.find(item => item.id === req.params.id);
  const status = req.body?.status;
  if (!table) return res.status(404).json({ success: false, error: 'Table not found' });
  if (!['available', 'reserved', 'occupied'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid table status' });
  }
  table.status = status;
  table.updatedAt = new Date().toISOString();
  res.json({ success: true, data: table });
});

app.get('/api/products-metadata/categories', (req, res) => {
  try {
    const categories = productsService.getCategories();
    const response: ApiResponse<string[]> = {
      data: categories,
      success: true,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(500).json(response);
  }
});

app.get('/api/products-metadata/price-range', (req, res) => {
  try {
    const priceRange = productsService.getPriceRange();
    const response: ApiResponse<{ min: number; max: number }> = {
      data: priceRange,
      success: true,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(500).json(response);
  }
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
