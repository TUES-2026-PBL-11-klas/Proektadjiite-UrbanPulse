import express from 'express';
import { AppError } from './errors/AppError.js';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import routes from './routes/index.js';
import { fileURLToPath } from 'url';
import { register, httpRequestDurationSeconds, httpRequestsTotal } from './metrics.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../uploads');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Prometheus timing middleware — excludes /metrics itself to avoid self-referential data
app.use((req, res, next) => {
  if (req.path === '/metrics') return next();
  const end = httpRequestDurationSeconds.startTimer();
  res.on('finish', () => {
    const route = req.route ? `${req.baseUrl}${req.route.path}` : 'unmatched';
    const labels = { method: req.method, route, status_code: res.statusCode };
    end(labels);
    httpRequestsTotal.inc(labels);
  });
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  if (err?.name === 'MulterError' || err?.message === 'only image uploads are allowed') {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error(err.stack);
  return res.status(500).json({ error: 'Internal server error' });
});

export default app;
