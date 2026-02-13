import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { requireAuth, requireRole } from './middleware/auth.js';
import { errorHandler, notFound } from './middleware/error.js';
import adminRouter from './routes/admin.js';
import appointmentsRouter from './routes/appointments.js';
import authRouter from './routes/auth.js';
import doctorsRouter from './routes/doctors.js';
import reviewsRouter from './routes/reviews.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: false }));
app.use(express.json());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'maurisante-backend' });
});

app.use('/api/auth', authRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/appointments', requireAuth, appointmentsRouter);
app.use('/api/reviews', requireAuth, reviewsRouter);
app.use('/api/admin', requireAuth, requireRole('ADMIN'), adminRouter);

app.use(notFound);
app.use(errorHandler);
