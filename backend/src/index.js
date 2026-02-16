import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'admin@lanchonete.com';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
const DEFAULT_ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME || 'Administrador';

app.use(cors());
app.use(express.json());

const ensureDefaultAdmin = async () => {
  const existingUser = await prisma.user.findUnique({ where: { email: DEFAULT_ADMIN_EMAIL } });
  if (existingUser) return;

  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  await prisma.user.create({
    data: {
      email: DEFAULT_ADMIN_EMAIL,
      password: hashedPassword,
      name: DEFAULT_ADMIN_NAME,
      role: 'ADMIN',
    },
  });
};

// Middleware de Autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Middleware de Role
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

// --- AUTH ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, role } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'COOK',
      },
    });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'User already exists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- USER ROUTES ---

app.get('/api/users', authenticateToken, authorizeRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });
  res.json(users);
});

app.post('/api/users', authenticateToken, authorizeRole(['ADMIN', 'MANAGER']), async (req, res) => {
   const { email, password, name, role } = req.body;
   
   if (req.user.role === 'MANAGER' && role === 'ADMIN') {
       return res.status(403).json({ error: 'Managers cannot create Admins' });
   }

   try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role },
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Error creating user' });
  }
});

// --- MOCK DATA ROUTES (Para Dashboard/Pedidos) ---

app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
    res.json({
        totalOrders: 150,
        totalRevenue: 4500.00,
        pendingOrders: 12,
        activeDrivers: 5
    });
});

// --- ORDER ROUTES ---

// --- CATEGORY ROUTES ---

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { products: true }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching categories' });
  }
});

app.post('/api/categories', authenticateToken, authorizeRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const { name, description } = req.body;
  try {
    const category = await prisma.category.create({
      data: { name, description }
    });
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: 'Error creating category' });
  }
});

// --- PRODUCT ROUTES ---

app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching products' });
  }
});

app.post('/api/products', authenticateToken, authorizeRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const { name, description, price, imageUrl, categoryId } = req.body;
  
  if (!categoryId) {
    return res.status(400).json({ error: 'Category ID is required' });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        categoryId: parseInt(categoryId),
        available: true
      }
    });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error creating product' });
  }
});

app.put('/api/products/:id', authenticateToken, authorizeRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const { id } = req.params;
  const { name, description, price, imageUrl, available, categoryId } = req.body;
  
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        imageUrl,
        available,
        categoryId: categoryId ? parseInt(categoryId) : undefined
      }
    });
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: 'Error updating product' });
  }
});

app.delete('/api/products/:id', authenticateToken, authorizeRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const { id } = req.params;
  
  try {
    await prisma.product.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Error deleting product' });
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Map to frontend expectations
    const formattedOrders = orders.map(order => ({
      ...order,
      created_at: order.createdAt, // Frontend expects snake_case from Supabase habits
      customer_name: order.customer_name || 'Cliente' // Use actual customer name or fallback
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  // Public endpoint for creating orders (e.g. from a kiosk or app)
  const { items, address, phone, customer_name, payment_method, observations } = req.body; // items: [{ productId, quantity }]
  
  if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
  }

  try {
    // Calculate total and prepare items
    let total = 0;
    const orderItemsData = [];
    
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
          return res.status(400).json({ error: `Product ${item.productId} not found` });
      }
      
      const itemTotal = product.price * item.quantity;
      total += itemTotal;
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      });
    }

    const order = await prisma.order.create({
      data: {
        status: 'PENDING',
        total,
        address,
        phone,
        customer_name,
        payment_method,
        observations,
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: true
      }
    });
    
    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Error creating order' });
  }
});

app.patch('/api/orders/:id/status', authenticateToken, authorizeRole(['ADMIN', 'MANAGER', 'COOK', 'DRIVER']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
    });
    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(400).json({ error: 'Error updating order' });
  }
});

const startServer = async () => {
  try {
    await ensureDefaultAdmin();
  } catch (error) {
    console.error(error);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
