import client from 'prom-client';

const { register } = client;

client.collectDefaultMetrics({ register });

export const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const reportsCreatedTotal = new client.Counter({
  name: 'urbanpulse_reports_created_total',
  help: 'Total number of reports created',
  labelNames: ['category'],
  registers: [register],
});

export { register };
