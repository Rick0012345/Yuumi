import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

app.use(cors());
app.use(express.json());

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
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json(user);
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
