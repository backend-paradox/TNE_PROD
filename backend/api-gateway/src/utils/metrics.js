// backend/api-gateway/src/utils/metrics.js
const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const requestDuration = new client.Histogram({
  name: 'gateway_request_duration_seconds',
  help: 'Request duration in seconds',
  labelNames: ['route', 'method'],
  buckets: [0.05, 0.1, 0.3, 1, 3, 5]
});
register.registerMetric(requestDuration);

const circuitSuccess = new client.Counter({
  name: 'gateway_circuit_success_total',
  help: 'Circuit success count',
  labelNames: ['service']
});
register.registerMetric(circuitSuccess);

const circuitFailure = new client.Counter({
  name: 'gateway_circuit_failure_total',
  help: 'Circuit failure count',
  labelNames: ['service']
});
register.registerMetric(circuitFailure);

module.exports = { register, requestDuration, circuitSuccess, circuitFailure };
