# Notification Service

Multi-channel notification service for the TripAndEvent platform supporting email, SMS, and push notifications.

## Features

### Email Notifications
- **Transactional Emails**: Order confirmations, password resets, booking updates
- **Template System**: Pre-built email templates with variable substitution
- **SMTP Integration**: Nodemailer with Gmail/custom SMTP support
- **HTML & Plain Text**: Both formats supported
- **Attachment Support**: PDF tickets, invoices, receipts

### SMS Notifications (Integration Ready)
- **Booking Confirmations**: Instant SMS on booking success
- **Payment Updates**: Payment status notifications
- **OTP**: One-time passwords for verification
- **SMS Gateway Ready**: Twilio/AWS SNS integration prepared

### Push Notifications (Integration Ready)
- **Real-time Alerts**: Booking updates, payment confirmations
- **Firebase Cloud Messaging**: FCM integration prepared
- **Device Token Management**: Store and manage push tokens

### Notification Types
- `VERIFICATION_EMAIL`: Email verification on registration
- `PASSWORD_RESET`: Password reset link
- `BOOKING_CONFIRMATION`: Booking success notification
- `PAYMENT_SUCCESS`: Payment confirmation
- `PAYMENT_FAILED`: Payment failure alert
- `BOOKING_CANCELLATION`: Cancellation confirmation
- `REFUND_PROCESSED`: Refund status update
- `VENDOR_APPLICATION`: Vendor registration status

## API Endpoints

### Internal Service Endpoints

#### Send Email
```http
POST /api/v1/notifications/email
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Booking Confirmation",
  "template": "booking-confirmation",
  "variables": {
    "userName": "John Doe",
    "bookingNumber": "TNE-HOTEL-12345678ABCD",
    "hotelName": "Grand Hotel Mumbai",
    "checkIn": "2025-12-25",
    "checkOut": "2025-12-27",
    "totalAmount": 15000
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "messageId": "abc123@gmail.com",
    "status": "sent"
  }
}
```

#### Send SMS (Integration Ready)
```http
POST /api/v1/notifications/sms
Content-Type: application/json

{
  "to": "+919876543210",
  "message": "Your booking TNE-HOTEL-12345678ABCD is confirmed!",
  "template": "booking-confirmation"
}
```

#### Send Push Notification (Integration Ready)
```http
POST /api/v1/notifications/push
Content-Type: application/json

{
  "userId": 123,
  "title": "Booking Confirmed",
  "body": "Your booking at Grand Hotel Mumbai is confirmed!",
  "data": {
    "bookingId": 456,
    "type": "booking_confirmation"
  }
}
```

### Admin Endpoints

#### Get Notification History
```http
GET /api/v1/notifications/history?type=EMAIL&status=SENT&page=1&limit=20
Authorization: Bearer <admin_token>
```

#### Resend Notification
```http
POST /api/v1/notifications/:id/resend
Authorization: Bearer <admin_token>
```

## Email Templates

### Template Directory Structure
```
templates/
├── verification-email.html
├── password-reset.html
├── booking-confirmation.html
├── payment-success.html
├── payment-failed.html
├── booking-cancellation.html
├── refund-processed.html
└── vendor-application.html
```

### Template Variables
Templates use Handlebars syntax:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Booking Confirmation</title>
</head>
<body>
  <h1>Hello {{userName}}!</h1>
  <p>Your booking <strong>{{bookingNumber}}</strong> is confirmed.</p>
  <p>Hotel: {{hotelName}}</p>
  <p>Check-in: {{checkIn}}</p>
  <p>Check-out: {{checkOut}}</p>
  <p>Total Amount: ₹{{totalAmount}}</p>
</body>
</html>
```

## Environment Variables

```env
PORT=3007
NODE_ENV=production

# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@tripandevent.com
SMTP_FROM_NAME=TripAndEvent

# Email Configuration (Custom SMTP)
# SMTP_HOST=smtp.yourdomain.com
# SMTP_PORT=465
# SMTP_SECURE=true
# SMTP_USER=notifications@yourdomain.com
# SMTP_PASS=your-password

# SMS Configuration (Twilio - Optional)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# SMS Configuration (AWS SNS - Optional)
AWS_SNS_REGION=ap-south-1
AWS_SNS_ACCESS_KEY_ID=your-access-key
AWS_SNS_SECRET_ACCESS_KEY=your-secret-key

# Push Notifications (FCM - Optional)
FCM_SERVER_KEY=your-fcm-server-key
FCM_SENDER_ID=your-sender-id

# Application URLs
FRONTEND_URL=http://localhost:3000
```

## Setup

### Installation
```bash
cd backend/notification-service
npm install
```

### Gmail Setup (for Development)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification
   - Scroll to "App passwords"
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password
3. Use this password in `SMTP_PASS`

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker
```bash
docker build -t notification-service .
docker run -p 3007:3007 --env-file .env notification-service
```

## Integration Examples

### Auth Service Integration
```javascript
// Send verification email
await axios.post(`${NOTIFICATION_SERVICE_URL}/api/v1/notifications/email`, {
  to: user.email,
  subject: 'Verify Your Email',
  template: 'verification-email',
  variables: {
    userName: user.name,
    verificationLink: `${FRONTEND_URL}/verify-email?token=${token}`
  }
});
```

### Booking Service Integration
```javascript
// Send booking confirmation
await axios.post(`${NOTIFICATION_SERVICE_URL}/api/v1/notifications/email`, {
  to: booking.userEmail,
  subject: 'Booking Confirmed',
  template: 'booking-confirmation',
  variables: {
    userName: booking.userName,
    bookingNumber: booking.bookingNumber,
    hotelName: booking.hotelName,
    checkIn: booking.checkInDate,
    checkOut: booking.checkOutDate,
    totalAmount: booking.totalAmount
  }
});

// Also send SMS (if enabled)
await axios.post(`${NOTIFICATION_SERVICE_URL}/api/v1/notifications/sms`, {
  to: booking.userPhone,
  message: `Your booking ${booking.bookingNumber} at ${booking.hotelName} is confirmed!`
});
```

### Payment Service Integration
```javascript
// Payment success notification
await axios.post(`${NOTIFICATION_SERVICE_URL}/api/v1/notifications/email`, {
  to: payment.userEmail,
  subject: 'Payment Successful',
  template: 'payment-success',
  variables: {
    userName: payment.userName,
    amount: payment.amount,
    transactionId: payment.razorpayPaymentId,
    bookingNumber: payment.bookingNumber
  }
});
```

## Notification Queue (Future Enhancement)

For high-volume scenarios, implement a queue:
```javascript
// Using Bull Queue with Redis
const Queue = require('bull');
const emailQueue = new Queue('email', process.env.REDIS_URL);

// Producer
emailQueue.add('send-email', { to, subject, template, variables });

// Consumer
emailQueue.process('send-email', async (job) => {
  await sendEmail(job.data);
});
```

## Error Handling

### Email Sending Errors
- **SMTP Connection Failed**: Check SMTP credentials
- **Invalid Email**: Validate email format before sending
- **Rate Limit Exceeded**: Gmail has sending limits (500/day for free accounts)
- **Attachment Too Large**: Gmail limit is 25MB

### SMS Sending Errors
- **Invalid Phone Number**: Validate format (E.164)
- **Insufficient Balance**: Check Twilio/SNS account balance
- **Carrier Rejection**: Some carriers block promotional SMS

## Monitoring

### Health Check
```bash
curl http://localhost:3007/api/v1/health
```

### Metrics to Monitor
- Email delivery rate
- Email bounce rate
- SMS delivery rate
- Average delivery time
- Failed notification count

### Logs
```bash
# View notification logs
docker logs tne-notification

# Follow logs in real-time
docker logs -f tne-notification
```

## Best Practices

### Email
- Use clear, concise subject lines
- Include both HTML and plain text versions
- Test emails across different clients (Gmail, Outlook, Apple Mail)
- Include unsubscribe links for marketing emails
- Verify SPF, DKIM, DMARC records for production

### SMS
- Keep messages under 160 characters
- Include brand name
- Add opt-out instructions for promotional SMS
- Use shortlinks for URLs

### Push Notifications
- Request permission at appropriate times
- Use clear, actionable messages
- Include deep links to relevant app sections
- Respect user notification preferences

## Rate Limiting

### Gmail Limits (Free Account)
- 500 emails per day
- 100 external recipients per message
- Consider using SendGrid/AWS SES for production

### Production Recommendations
- **SendGrid**: 100 emails/day free, then paid plans
- **AWS SES**: $0.10 per 1,000 emails
- **Mailgun**: 5,000 emails/month free
- **Postmark**: Transactional email specialist

## License

Part of the TripAndEvent Platform

*Last Updated: December 22, 2025*
