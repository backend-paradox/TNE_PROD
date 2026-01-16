# TNE Shared Utilities

Shared utilities, middleware, and configurations for TNE microservices.

## Installation

```bash
npm install
```

## Usage

```javascript
const {
  ApiError,
  ApiResponse,
  asyncHandler,
  createLogger,
  constants,
} = require('../shared/src/utils');

const {
  authenticate,
  authorize,
  validate,
  rateLimiter,
  errorHandler,
} = require('../shared/src/middleware');
```

## Utilities

### ApiError
```javascript
const { ApiError } = require('../shared/src/utils');

throw ApiError.unauthorized('Invalid credentials');
throw ApiError.notFound('User not found');
throw ApiError.badRequest('Invalid input');
```

### ApiResponse
```javascript
const { ApiResponse } = require('../shared/src/utils');

res.json(ApiResponse.success(data, 'Success'));
res.status(201).json(ApiResponse.created(data, 'Created'));
```

### Logger
```javascript
const { createLogger } = require('../shared/src/utils/logger');
const logger = createLogger('service-name');

logger.info('Message', { data: value });
logger.error('Error', { error: err.message });
```

### asyncHandler
```javascript
const { asyncHandler } = require('../shared/src/middleware/asyncHandler');

const handler = asyncHandler(async (req, res) => {
  // async code - errors auto-caught
});
```

## Middleware

### Authentication
```javascript
const { authenticate, authorize } = require('../shared/src/middleware/auth');

router.get('/profile', authenticate, handler);
router.delete('/users/:id', authenticate, authorize(['ADMIN']), handler);
```

### Validation
```javascript
const { validate } = require('../shared/src/middleware/validate');
const { z } = require('zod');

const schema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

router.post('/login', validate(schema), handler);
```

### Rate Limiting
```javascript
const { rateLimiter, authLimiter } = require('../shared/src/middleware/rateLimiter');

app.use(rateLimiter);  // Default: 100 req/15min
router.post('/login', authLimiter, handler);  // Strict: 5 req/15min
```

### Error Handler
```javascript
const { errorHandler } = require('../shared/src/middleware/errorHandler');

app.use(errorHandler);  // Must be last middleware
```

## Structure

```
shared/
├── src/
│   ├── middleware/
│   │   ├── auth.js         # JWT authentication
│   │   ├── asyncHandler.js # Async error wrapper
│   │   ├── errorHandler.js # Error handling
│   │   ├── rateLimiter.js  # Rate limiting
│   │   └── validate.js     # Zod/Joi validation
│   ├── utils/
│   │   ├── ApiError.js     # Error classes
│   │   ├── ApiResponse.js  # Response format
│   │   ├── asyncHandler.js # Async wrapper
│   │   ├── constants.js    # Constants
│   │   ├── logger.js       # Winston logger
│   │   └── index.js        # Exports
│   └── index.js            # Main exports
└── package.json
```

---

*Last Updated: December 20, 2025*
