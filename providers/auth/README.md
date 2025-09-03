# Authentication Providers

## Overview

This directory contains authentication providers for protecting routes in the PlanetPal application. There are two main providers:

1. `WithAuth` - A client-side component for protecting client components
2. `WithServerAuth` - A server-side component for protecting server components

Both providers support optional role-based access control.

## Usage Examples

### Server Component Protection

```tsx
// app/admin/page.tsx
import { WithServerAuth } from '@/providers/auth';

export default async function AdminPage() {
  return (
    <WithServerAuth requiredRole="admin">
      <div>
        <h1>Admin Dashboard</h1>
        {/* Admin content here */}
      </div>
    </WithServerAuth>
  );
}
```

### Client Component Protection

```tsx
// app/profile/page.tsx
'use client';

import { WithAuth } from '@/providers/auth';

export default function ProfilePage() {
  return (
    <WithAuth>
      <div>
        <h1>User Profile</h1>
        {/* Profile content here */}
      </div>
    </WithAuth>
  );
}
```

### Role-Based Protection

```tsx
// app/moderator/page.tsx
import { WithServerAuth } from '@/providers/auth';

export default async function ModeratorPage() {
  return (
    <WithServerAuth requiredRole="moderator">
      <div>
        <h1>Moderator Dashboard</h1>
        {/* Moderator content here */}
      </div>
    </WithServerAuth>
  );
}
```

## Available Roles

The role is stored in `session.user.user_metadata.role` and can be any string value. Common roles might include:

- `admin`
- `moderator`
- `user`

You can customize the roles based on your application's needs.