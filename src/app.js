import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import apiRoutes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------- Security & core middleware ----------
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Basic API rate limiting — protects login and general API abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// ---------- Health check ----------
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'KSIE Cargo Management API is running', uptime: process.uptime() });
});

// ---------- API routes ----------
app.use('/api/v1', apiRoutes);

// ---------- 404 + error handling ----------
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
