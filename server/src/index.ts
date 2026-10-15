import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import { authRouter } from './routes/auth.routes';
import { studentRouter } from './routes/student.routes';
import { schemeRouter } from './routes/scheme.routes';
import { eligibilityRouter } from './routes/eligibility.routes';
import { documentRouter } from './routes/document.routes';
import { applicationRouter } from './routes/application.routes';
import { assetRouter } from './routes/asset.routes';
import { paymentRouter } from './routes/payment.routes';
import { notificationRouter } from './routes/notification.routes';
import { reportRouter } from './routes/report.routes';
import { auditRouter } from './routes/audit.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting on authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts. Please try again later.' },
});

// Register API Routes
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/students', studentRouter);
app.use('/api/schemes', schemeRouter);
app.use('/api/eligibility', eligibilityRouter);
app.use('/api/documents', documentRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/assets', assetRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/reports', reportRouter);
app.use('/api/audit', auditRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    demoMode: process.env.DEMO_MODE === 'true',
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Vidya Pragati Setu Server running on port ${PORT}`);
  console.log(`📊 Demo Mode: ${process.env.DEMO_MODE === 'true' ? 'ENABLED' : 'DISABLED'}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n`);
});

export default app;
