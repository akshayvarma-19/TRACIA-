import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import { supabase } from './lib/supabase.js';
import authRouter from './routes/auth.js';
import recordsRouter from './routes/records.js';
import citizenLandRouter from './routes/citizenLandRoutes.js';
import publicLandRouter from './routes/publicLandRoutes.js';
import officerLandRouter from './routes/officerLandRoutes.js';
import citizenGrievanceRouter from './routes/citizenGrievanceRoutes.js';
import officerGrievanceRouter from './routes/officerGrievanceRoutes.js';
import ocrExtractionRouter from './routes/ocrExtractionRoutes.js';
import assistantRouter from './routes/assistantRoutes.js';
import mapRouter from './routes/mapRoutes.js';
import notificationRouter from './routes/notificationRoutes.js';
import citizenApplicationRouter from './routes/citizenApplicationRoutes.js';
import officerApplicationRouter from './routes/officerApplicationRoutes.js';
import officerOcrRouter from './routes/officerOcrRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // 1. Allow requests with no origin (e.g. mobile apps, curl, Postman, server-to-server, health checks)
    if (!origin) {
      return callback(null, true);
    }

    // 2. If ALLOWED_ORIGINS is unconfigured or contains '*', allow all origins
    if (allowedOrigins.length === 0 || allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    // 3. Allow exact matches in ALLOWED_ORIGINS
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // 4. Allow any Vercel deployment domain (*.vercel.app) if vercel.app is configured in ALLOWED_ORIGINS
    const isVercelOrigin = origin.endsWith('.vercel.app');
    const permitsVercel = allowedOrigins.some((o) => o.includes('vercel.app'));
    if (isVercelOrigin && permitsVercel) {
      return callback(null, true);
    }

    // 5. Allow localhost development origins by default
    const isLocalhost = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
    if (isLocalhost) {
      return callback(null, true);
    }

    // 6. Deny unconfigured origins gracefully without throwing Express 500 error
    console.warn(`[CORS] Blocked request from origin: ${origin}`);
    return callback(null, false);
  },
  credentials: false
}));
app.use(express.json());

// Sanitize requested URL to trim trailing %0A, newlines or spaces
app.use((req, _res, next) => {
  req.url = req.url.replace(/(%0[aA]|%0[dD]|\s|\r|\n)+$/g, '');
  next();
});

app.use('/api/auth', authRouter);
app.use('/api/records', recordsRouter);
app.use('/api/citizen/lands', citizenLandRouter);
app.use('/api/lands', publicLandRouter);
app.use('/api/officer/lands', officerLandRouter);
app.use('/api/citizen/grievances', citizenGrievanceRouter);
app.use('/api/officer/grievances', officerGrievanceRouter);
app.use('/api/citizen/ocr', ocrExtractionRouter);
app.use('/api/assistant', assistantRouter);
app.use('/api/map', mapRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/citizen/applications', citizenApplicationRouter);
app.use('/api/officer/applications', officerApplicationRouter);
app.use('/api/officer/ocr', officerOcrRouter);







app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/api/db-test', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to communicate with Supabase',
        error: error.message
      });
      return;
    }

    res.json({
      status: 'ok',
      message: 'Supabase connection successful',
      sessionData: data
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: 'Unexpected error testing Supabase connection',
      error: err?.message || String(err)
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
