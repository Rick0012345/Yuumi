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
    if (err) {
      console.log("JWT verify error:", err);
      return res.sendStatus(403);
    }
    console.log("JWT decoded user:", user);
    req.user = user;
    next();
  });
};

// Middleware de Role
const authorizeRole = (roles) => {
  return (req, res, next) => {
    console.log("AuthorizeRole - User role:", req.user?.role, "Required roles:", roles);
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

    const token = jwt.sign({ 
        id: user.id, 
        role: user.role, 
        name: user.name,
        restaurantId: user.restaurantId 
    }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, restaurantId: user.restaurantId } });
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

// --- RESTAURANT ROUTES ---

app.get('/api/restaurants', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: { _count: { select: { users: true, orders: true } } }
    });
    res.json(restaurants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching restaurants' });
  }
});

app.post('/api/restaurants', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  const { name, phone_id, token_meta, status_stripe, stripe_cust_id } = req.body;
  
  try {
    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        phone_id,
        token_meta,
        status_stripe,
        stripe_cust_id
      }
    });
    res.json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error creating restaurant' });
  }
});

app.put('/api/restaurants/:id', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { name, phone_id, token_meta, status_stripe, stripe_cust_id } = req.body;
  
  try {
    const restaurant = await prisma.restaurant.update({
      where: { id: parseInt(id) },
      data: {
        name,
        phone_id,
        token_meta,
        status_stripe,
        stripe_cust_id
      }
    });
    res.json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error updating restaurant' });
  }
});

app.delete('/api/restaurants/:id', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.restaurant.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error deleting restaurant' });
  }
});

// --- SETTINGS ROUTES ---

app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    let userSettings = await prisma.userSettings.findUnique({
      where: { userId: req.user.id }
    });
    
    let notificationSettings = await prisma.notificationSettings.findUnique({
      where: { userId: req.user.id }
    });

    // Se não existirem, cria padrões
    if (!userSettings) {
        userSettings = await prisma.userSettings.create({ data: { userId: req.user.id } });
    }
    if (!notificationSettings) {
        notificationSettings = await prisma.notificationSettings.create({ data: { userId: req.user.id } });
    }

    res.json({
      ...userSettings,
      notifications: notificationSettings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Error fetching settings' });
  }
});

app.put('/api/settings', authenticateToken, async (req, res) => {
  const { 
    theme, language, fontSize, 
    emailNotifications, pushNotifications, orderNotifications,
    notifications // nested object for notification settings
  } = req.body;

  try {
    // Update General Settings
    const updatedSettings = await prisma.userSettings.upsert({
      where: { userId: req.user.id },
      update: {
        theme,
        language,
        fontSize,
        emailNotifications,
        pushNotifications,
        orderNotifications
      },
      create: {
        userId: req.user.id,
        theme,
        language,
        fontSize,
        emailNotifications,
        pushNotifications,
        orderNotifications
      }
    });

    // Update Notification Settings if provided
    let updatedNotifications = null;
    if (notifications) {
      updatedNotifications = await prisma.notificationSettings.upsert({
        where: { userId: req.user.id },
        update: {
          emailFrequency: notifications.emailFrequency,
          pushFrequency: notifications.pushFrequency,
          soundEnabled: notifications.soundEnabled,
          vibrationEnabled: notifications.vibrationEnabled,
          quietHoursEnabled: notifications.quietHoursEnabled,
          quietHoursStart: notifications.quietHoursStart,
          quietHoursEnd: notifications.quietHoursEnd
        },
        create: {
          userId: req.user.id,
          emailFrequency: notifications.emailFrequency,
          pushFrequency: notifications.pushFrequency,
          soundEnabled: notifications.soundEnabled,
          vibrationEnabled: notifications.vibrationEnabled,
          quietHoursEnabled: notifications.quietHoursEnabled,
          quietHoursStart: notifications.quietHoursStart,
          quietHoursEnd: notifications.quietHoursEnd
        }
      });
    } else {
        // Fetch existing if not updated
        updatedNotifications = await prisma.notificationSettings.findUnique({
            where: { userId: req.user.id }
        });
    }

    res.json({
      ...updatedSettings,
      notifications: updatedNotifications
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Error updating settings' });
  }
});

// --- USER ROUTES ---

app.get('/api/users', authenticateToken, authorizeRole(['ADMIN', 'MANAGER']), async (req, res) => {
  const where = req.user.role === 'ADMIN' ? {} : { restaurantId: req.user.restaurantId };
  
  try {
    const users = await prisma.user.findMany({
        where,
        select: { 
            id: true, 
            name: true, 
            email: true, 
            role: true, 
            createdAt: true,
            restaurant: { select: { name: true } }
        }
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

app.post('/api/users', authenticateToken, authorizeRole(['ADMIN', 'MANAGER']), async (req, res) => {
   const { email, password, name, role, restaurantId } = req.body;
   
   // Validation Rules
   let finalRestaurantId = restaurantId;

   if (req.user.role === 'ADMIN') {
       if (role !== 'MANAGER') {
           return res.status(403).json({ error: 'Admins can only create Managers' });
       }
       if (!restaurantId) {
           return res.status(400).json({ error: 'Restaurant ID is required for Managers' });
       }
   }
   
   if (req.user.role === 'MANAGER') {
       if (role === 'ADMIN' || role === 'MANAGER') {
           return res.status(403).json({ error: 'Managers can only create Staff (Cooks/Drivers)' });
       }
       if (!req.user.restaurantId) {
           return res.status(403).json({ error: 'Manager not associated with a restaurant' });
       }
       finalRestaurantId = req.user.restaurantId;
   }

   try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        name, 
        role,
        restaurantId: finalRestaurantId ? parseInt(finalRestaurantId) : undefined
      },
    });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error creating user' });
  }
});

// --- MOCK DATA ROUTES (Para Dashboard/Pedidos) ---

app.get('/api/dashboard/saas-stats', authenticateToken, authorizeRole(['ADMIN']), async (req, res) => {
    try {
        const totalRestaurants = await prisma.restaurant.count();
        const activeManagers = await prisma.user.count({ where: { role: 'MANAGER' } });
        
        // Mocked Financial Data
        const monthlyRevenue = totalRestaurants * 150.00; // Ex: R$ 150 por lanchonete
        const growth = 12; // 12% growth (mock)

        res.json({
            totalRestaurants,
            activeManagers,
            monthlyRevenue,
            growth
        });
    } catch (error) {
        console.error('Error fetching SaaS stats:', error);
        res.status(500).json({ error: 'Error fetching SaaS stats' });
    }
});

app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    // Apenas para MANAGER ou quem tem restaurantId
    if (!req.user.restaurantId) {
        return res.status(400).json({ error: 'User not associated with a restaurant' });
    }

    try {
        const totalOrders = await prisma.order.count({ where: { restaurantId: req.user.restaurantId } });
        
        // Calculate Revenue
        const orders = await prisma.order.findMany({ 
            where: { restaurantId: req.user.restaurantId },
            select: { total: true }
        });
        const totalRevenue = orders.reduce((acc, curr) => acc + curr.total, 0);

        const pendingOrders = await prisma.order.count({ 
            where: { restaurantId: req.user.restaurantId, status: 'PENDING' } 
        });
        
        const activeDrivers = await prisma.user.count({ 
            where: { restaurantId: req.user.restaurantId, role: 'DRIVER' } // Assumindo drivers vinculados
        });

        res.json({
            totalOrders,
            totalRevenue,
            pendingOrders,
            activeDrivers
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- ORDER ROUTES ---

// --- CATEGORY ROUTES ---

app.get('/api/categories', authenticateToken, async (req, res) => {
  // Se for ADMIN, não tem cardápio para ver
  if (req.user.role === 'ADMIN') return res.json([]);

  try {
    const categories = await prisma.category.findMany({
      where: { restaurantId: req.user.restaurantId },
      include: { products: true }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching categories' });
  }
});

app.post('/api/categories', authenticateToken, authorizeRole(['MANAGER']), async (req, res) => {
  const { name, description } = req.body;
  
  try {
    const category = await prisma.category.create({
      data: { 
        name, 
        description,
        restaurantId: req.user.restaurantId
      }
    });
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: 'Error creating category' });
  }
});

// --- PRODUCT ROUTES ---

app.get('/api/products', authenticateToken, async (req, res) => {
  if (req.user.role === 'ADMIN') return res.json([]);

  try {
    const products = await prisma.product.findMany({
      where: { restaurantId: req.user.restaurantId },
      include: { category: true }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching products' });
  }
});

app.post('/api/products', authenticateToken, authorizeRole(['MANAGER']), async (req, res) => {
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
        restaurantId: req.user.restaurantId, // Always from token
        available: true
      }
    });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error creating product' });
  }
});

app.put('/api/products/:id', authenticateToken, authorizeRole(['MANAGER']), async (req, res) => {
  const { id } = req.params;
  const { name, description, price, imageUrl, available, categoryId } = req.body;
  
  // Verify ownership
  const existingProduct = await prisma.product.findUnique({ where: { id: parseInt(id) } });
  if (!existingProduct || existingProduct.restaurantId !== req.user.restaurantId) {
      return res.status(403).json({ error: 'Not authorized to edit this product' });
  }

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

app.delete('/api/products/:id', authenticateToken, authorizeRole(['MANAGER']), async (req, res) => {
  const { id } = req.params;
  
  // Verify ownership
  const existingProduct = await prisma.product.findUnique({ where: { id: parseInt(id) } });
  if (!existingProduct || existingProduct.restaurantId !== req.user.restaurantId) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
  }
  
  try {
    await prisma.product.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Error deleting product' });
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  // Admin SaaS não vê pedidos
  if (req.user.role === 'ADMIN') return res.json([]);
  
  if (!req.user.restaurantId) {
      return res.status(400).json({ error: 'User not associated with a restaurant' });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { restaurantId: req.user.restaurantId },
      include: {
        items: {
          include: {
            product: true
          }
        },
        driver: {
          select: { id: true, name: true }
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
      customer_name: order.customer_name || 'Cliente', // Use actual customer name or fallback
      driver_name: order.driver?.name
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

app.patch('/api/orders/:id/assign', authenticateToken, authorizeRole(['ADMIN', 'MANAGER']), async (req, res) => {
    const { id } = req.params;
    const { driverId } = req.body;

    if (!driverId) {
        return res.status(400).json({ error: 'Driver ID is required' });
    }

    try {
        // Verificar se o driver existe e é um DRIVER
        const driver = await prisma.user.findUnique({ where: { id: parseInt(driverId) } });
        if (!driver || driver.role !== 'DRIVER') {
            return res.status(400).json({ error: 'Invalid driver' });
        }

        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: { driverId: parseInt(driverId), status: 'DELIVERING' }, // Já muda para DELIVERING ao atribuir
            include: { driver: { select: { name: true } } }
        });
        
        res.json({ ...order, driver_name: order.driver.name });
    } catch (error) {
        console.error('Error assigning driver:', error);
        res.status(400).json({ error: 'Error assigning driver' });
    }
});

app.get('/api/drivers', authenticateToken, authorizeRole(['ADMIN', 'MANAGER']), async (req, res) => {
    try {
        const drivers = await prisma.user.findMany({
            where: { role: 'DRIVER' },
            select: { 
                id: true, 
                name: true, 
                email: true,
                currentLat: true,
                currentLng: true,
                lastLocationUpdate: true
            }
        });
        res.json(drivers);
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({ error: 'Error fetching drivers' });
    }
});

app.get('/api/orders/my-deliveries', authenticateToken, authorizeRole(['DRIVER']), async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { driverId: req.user.id, status: { in: ['DELIVERING', 'READY'] } },
            include: {
                items: {
                    include: { product: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        
        const formattedOrders = orders.map(order => ({
            ...order,
            created_at: order.createdAt,
            customer_name: order.customer_name || 'Cliente'
        }));

        res.json(formattedOrders);
    } catch (error) {
        console.error('Error fetching my deliveries:', error);
        res.status(500).json({ error: 'Error fetching deliveries' });
    }
});

app.post('/api/orders', async (req, res) => {
  // Public endpoint for creating orders (e.g. from a kiosk or app)
  const { items, address, phone, customer_name, payment_method, observations, restaurantId } = req.body; // items: [{ productId, quantity }]
  
  if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
  }
  if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
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
        restaurantId: parseInt(restaurantId),
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
