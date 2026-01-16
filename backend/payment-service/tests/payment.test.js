const request = require('supertest');
const app = require('../src/app');

describe('Payment Service', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.service).toBe('payment-service');
    });
  });

  describe('POST /api/v1/payments/orders', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/payments/orders')
        .send({
          bookingId: 1,
          amount: 1000,
        });

      expect(response.status).toBe(401);
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/v1/payments/orders')
        .set('Authorization', 'Bearer mock-token')
        .send({
          // Missing required fields
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/payments/verify', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/payments/verify')
        .send({
          razorpayOrderId: 'order_xxx',
          razorpayPaymentId: 'pay_xxx',
          razorpaySignature: 'sig_xxx',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/v1/unknown');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
