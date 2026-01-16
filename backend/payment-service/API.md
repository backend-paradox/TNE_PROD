# Payment Service - API Endpoints Reference

Base URL: `http://localhost:3005`

All endpoints require `Authorization: Bearer <token>` header except webhooks.

---

## Health Check

### GET /api/v1/health
**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "payment-service"
}
```

---

## Payment Orders

### POST /api/v1/payments/orders
Create a new payment order.

**Request Body:**
```json
{
  "bookingId": 123,
  "amount": 15000,
  "currency": "INR",
  "description": "Hotel booking payment",
  "notes": {
    "booking_type": "hotel",
    "hotel_name": "Grand Hotel"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Payment order created",
  "data": {
    "id": 1,
    "orderId": "ORD_1234567890",
    "razorpayOrderId": "order_xxx",
    "razorpayKeyId": "rzp_test_xxx",
    "amount": 15000,
    "currency": "INR",
    "status": "PENDING"
  }
}
```

---

### POST /api/v1/payments/verify
Verify payment after successful Razorpay transaction.

**Request Body:**
```json
{
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "signature_xxx"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "id": 1,
    "orderId": "ORD_1234567890",
    "status": "SUCCESS",
    "amount": 15000,
    "paidAt": "2025-12-21T10:00:00.000Z",
    "paymentMethod": "UPI",
    "upiId": "user@upi"
  }
}
```

---

### POST /api/v1/payments/failure
Handle payment failure.

**Request Body:**
```json
{
  "razorpayOrderId": "order_xxx",
  "errorCode": "BAD_REQUEST_ERROR",
  "errorDescription": "Payment was not completed"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment failure recorded",
  "data": {
    "id": 1,
    "status": "FAILED",
    "errorCode": "BAD_REQUEST_ERROR",
    "errorDescription": "Payment was not completed"
  }
}
```

---

### GET /api/v1/payments/:id
Get payment by ID.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderId": "ORD_1234567890",
    "bookingId": 123,
    "userId": 1,
    "amount": 15000,
    "currency": "INR",
    "status": "SUCCESS",
    "paymentMethod": "UPI",
    "razorpayOrderId": "order_xxx",
    "razorpayPaymentId": "pay_xxx",
    "upiId": "user@upi",
    "paidAt": "2025-12-21T10:00:00.000Z",
    "createdAt": "2025-12-21T09:55:00.000Z"
  }
}
```

---

### GET /api/v1/payments/order/:orderId
Get payment by order ID.

---

### GET /api/v1/payments/booking/:bookingId
Get all payments for a booking.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "orderId": "ORD_1234567890",
      "amount": 15000,
      "status": "SUCCESS",
      "paidAt": "2025-12-21T10:00:00.000Z"
    }
  ]
}
```

---

### GET /api/v1/payments
Get user's payment history (paginated).

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `status` | string | - | Filter by status |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "payments": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

---

## Refunds

### POST /api/v1/payments/:id/refund
Initiate a refund.

**Request Body:**
```json
{
  "amount": 5000,
  "reason": "Customer requested cancellation",
  "notes": {
    "cancelled_by": "user"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Refund initiated",
  "data": {
    "id": 1,
    "refundId": "REF_1234567890",
    "razorpayRefundId": "rfnd_xxx",
    "amount": 5000,
    "status": "PENDING",
    "reason": "Customer requested cancellation"
  }
}
```

---

### GET /api/v1/payments/:id/refunds
Get all refunds for a payment.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "refundId": "REF_1234567890",
      "amount": 5000,
      "status": "SUCCESS",
      "reason": "Customer requested cancellation",
      "processedAt": "2025-12-21T11:00:00.000Z"
    }
  ]
}
```

---

## Webhooks

### POST /api/v1/webhooks/razorpay
Handle Razorpay webhook events. **No Auth Required**

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `X-Razorpay-Signature` | Yes | Webhook signature for verification |

**Handled Events:**
- `payment.authorized` - Payment authorized
- `payment.captured` - Payment captured
- `payment.failed` - Payment failed
- `order.paid` - Order paid
- `refund.created` - Refund created
- `refund.processed` - Refund processed
- `refund.failed` - Refund failed

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Webhook processed"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid payment amount"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token is missing or invalid"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Payment not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Payment already verified"
}
```

### 422 Unprocessable Entity
```json
{
  "success": false,
  "message": "Invalid payment signature"
}
```

---

## Enums Reference

### PaymentStatus
`PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`, `REFUNDED`, `CANCELLED`

### PaymentMethod
`CARD`, `UPI`, `NETBANKING`, `WALLET`, `EMI`

### RefundStatus
`PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`

---

## Frontend Integration Example

```javascript
// 1. Create payment order
const { data } = await axios.post('/api/v1/payments/orders', {
  bookingId: 123,
  amount: 15000,
});

// 2. Initialize Razorpay
const options = {
  key: data.data.razorpayKeyId,
  amount: data.data.amount * 100, // Razorpay expects paise
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
};

const razorpay = new window.Razorpay(options);
razorpay.open();
```

---

*Last Updated: December 22, 2025*
