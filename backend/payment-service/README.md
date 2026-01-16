# Payment Service

Payment processing microservice for TripAndEvent with Razorpay integration.

## Features

- 💳 **Payment Order Creation**: Create Razorpay orders for bookings
- ✅ **Payment Verification**: Verify payment signatures and capture payments
- 🔄 **Refund Management**: Initiate and track refunds
- 🪝 **Webhook Handling**: Process Razorpay webhooks for payment events
- 📊 **Payment History**: Track all payments and refunds
- 🔐 **Secure**: Payment signature verification, JWT authentication
- 📝 **Comprehensive Logging**: Track all payment activities

## Tech Stack

- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Payment Gateway**: Razorpay
- **Authentication**: JWT
- **Validation**: Zod
- **Logging**: Winston

## Prerequisites

- Node.js >= 18
- PostgreSQL >= 15
- Razorpay account (Key ID and Secret)

## Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Configure Razorpay credentials in .env

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate:dev

# Start development server
npm run dev
```

## Environment Variables

```env
NODE_ENV=development
PORT=3005
DATABASE_URL=postgresql://user:password@localhost:5432/tne_paymentdb
JWT_SECRET=your-jwt-secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
BOOKING_SERVICE_URL=http://booking-service:3004
NOTIFICATION_SERVICE_URL=http://notification-service:3007
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

### Payments

- `POST /api/v1/payments/orders` - Create payment order
- `POST /api/v1/payments/verify` - Verify payment
- `POST /api/v1/payments/failure` - Handle payment failure
- `GET /api/v1/payments/:id` - Get payment by ID
- `GET /api/v1/payments/order/:orderId` - Get payment by order ID
- `GET /api/v1/payments/booking/:bookingId` - Get payments by booking ID
- `GET /api/v1/payments` - Get user's payment history (paginated)

### Refunds

- `POST /api/v1/payments/:id/refund` - Initiate refund
- `GET /api/v1/payments/:id/refunds` - Get refunds for a payment

### Webhooks

- `POST /api/v1/webhooks/razorpay` - Razorpay webhook handler

## Usage Examples

### Create Payment Order

```javascript
POST /api/v1/payments/orders
Authorization: Bearer <jwt_token>

{
  "bookingId": 123,
  "amount": 15000,
  "currency": "INR",
  "notes": {
    "booking_type": "hotel",
    "hotel_name": "Grand Hotel"
  }
}
```

### Verify Payment (Frontend Integration)

```javascript
POST /api/v1/payments/verify
Authorization: Bearer <jwt_token>

{
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "signature_xxx"
}
```

### Initiate Refund

```javascript
POST /api/v1/payments/123/refund
Authorization: Bearer <jwt_token>

{
  "amount": 5000,  // Partial refund (optional, defaults to full)
  "reason": "Customer requested cancellation",
  "notes": {
    "cancelled_by": "user"
  }
}
```

## Razorpay Integration

### Frontend Integration Example

```javascript
const createPayment = async (bookingId, amount) => {
  // 1. Create order
  const { data } = await axios.post('/api/v1/payments/orders', {
    bookingId,
    amount,
  });

  // 2. Initialize Razorpay
  const options = {
    key: data.data.razorpayKeyId,
    amount: data.data.amount,
    currency: data.data.currency,
    order_id: data.data.razorpayOrderId,
    name: 'TripAndEvent',
    description: 'Booking Payment',
    handler: async (response) => {
      // 3. Verify payment
      await axios.post('/api/v1/payments/verify', {
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      });
    },
    prefill: {
      email: user.email,
      contact: user.phone,
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};
```

### Webhook Configuration

Configure Razorpay webhook URL in Razorpay Dashboard:
```
https://yourdomain.com/api/v1/webhooks/razorpay
```

Subscribed Events:
- payment.authorized
- payment.captured
- payment.failed
- order.paid
- refund.created
- refund.processed
- refund.failed

## Database Schema

### Payments Table
- Payment order details
- Razorpay IDs and signatures
- Payment method details
- Status tracking
- Failure reasons

### Refunds Table
- Refund details
- Razorpay refund IDs
- Status tracking
- Processing information

### Webhook Logs Table
- Webhook event tracking
- Processing status
- Error logging

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm run test:watch
```

## Docker

```bash
# Build image
docker build -t payment-service .

# Run container
docker run -p 3005:3005 --env-file .env payment-service
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database URL
3. Set secure JWT secret
4. Configure real Razorpay credentials
5. Set up webhook URL in Razorpay Dashboard
6. Enable HTTPS for webhook endpoint
7. Configure proper CORS origins
8. Set up monitoring and alerts

## Security Considerations

- ✅ Payment signature verification
- ✅ Webhook signature verification
- ✅ JWT authentication on all endpoints (except webhooks)
- ✅ Role-based access control
- ✅ Input validation with Zod
- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ Sensitive data encryption in transit

## Support

For issues or questions, please contact the development team.

## License

MIT

---

*Last Updated: December 22, 2025*
