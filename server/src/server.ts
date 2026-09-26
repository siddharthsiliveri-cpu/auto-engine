import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import vehicleRoutes from './routes/vehicleRoutes';
import componentRoutes from './routes/componentRoutes';
import configuratorRoutes from './routes/configuratorRoutes';
import reviewRoutes from './routes/reviewRoutes';
import databaseRoutes from './routes/databaseRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// System Health & Telemetry
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'AUTOENGINE DIGITAL TWIN ENGINE',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: 'CONNECTED',
    uptime: process.uptime(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/configurator', configuratorRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/database', databaseRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    code: err.code,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 AUTOENGINE API & Database Systems Server Started`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🏎️ Tagline: Design the Future of Mobility`);
  console.log(`⚡ Health: http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});

export default app;
