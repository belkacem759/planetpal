# API Client

A unified API client utility that handles authentication automatically.

## Usage

### Basic Usage

```typescript
import { apiClient } from '@/lib/api/client';

// GET request (no auth required)
const response = await apiClient('/api/products', {
  method: 'GET'
});

// POST request with auth
const response = await apiClient('/api/cart', {
  method: 'POST',
  body: JSON.stringify({ product_id: '123', quantity: 1 }),
  requiresAuth: true
});
```

### Convenience Methods

```typescript
import { api } from '@/lib/api/client';

// GET request
const response = await api.get('/api/products');

// POST request with auth
const response = await api.post('/api/cart', 
  { product_id: '123', quantity: 1 }, 
  { requiresAuth: true }
);
```

## Options

- `requiresAuth`: Automatically includes Supabase Bearer token
- All standard `fetch` options are supported

## Features

- Automatic authentication header injection
- Simplified API with Bearer token authentication
- Standard fetch API compatibility
- TypeScript support