# Smart Home Cloud Platform - Frontend

Next.js 14 frontend application for the Smart Home Cloud Platform dashboard.

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Development](#development)
- [Pages and Routes](#pages-and-routes)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Styling and UI](#styling-and-ui)

## Overview

The frontend provides a role-based dashboard for:
- **Owners** - View alerts, devices, configure models, manage settings
- **Technicians** - Manage assigned homes, devices, upload test clips
- **Staff** - Operations dashboard, manage escalated alerts, audit logs
- **Admins** - User and home management, full system access

## Technology Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Material UI (MUI v5)** - Component library
- **Redux Toolkit** - State management
- **RTK Query** - Data fetching and caching
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **MUI DataGrid** - Data tables
- **Day.js** - Date/time formatting

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/              # Auth route group
│   │   └── login/
│   │       └── page.tsx    # Login page
│   ├── (dashboard)/        # Dashboard route group
│   │   ├── layout.tsx      # Dashboard layout with AppShell
│   │   ├── overview/       # Owner overview
│   │   ├── alerts/         # Alerts page
│   │   ├── devices/        # Devices page
│   │   ├── models/         # Model configs
│   │   ├── settings/       # Settings (contacts, policies)
│   │   ├── tech/          # Technician pages
│   │   ├── ops/           # Operations pages
│   │   └── admin/         # Admin pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Root redirect
├── src/
│   ├── api/
│   │   ├── base.ts        # RTK Query base API
│   │   ├── auth.ts        # Auth endpoints
│   │   ├── devices.ts     # Device endpoints
│   │   ├── alerts.ts     # Alert endpoints
│   │   ├── models.ts     # Model config endpoints
│   │   ├── settings.ts   # Settings endpoints
│   │   ├── ingest.ts    # Ingestion endpoints
│   │   ├── assignments.ts # Assignment endpoints
│   │   ├── ops.ts        # Operations endpoints
│   │   └── admin.ts      # Admin endpoints
│   ├── components/
│   │   ├── AppShell.tsx      # Main layout shell
│   │   ├── TopNav.tsx        # Top navigation bar
│   │   ├── SideNav.tsx       # Side navigation drawer
│   │   ├── RoleGuard.tsx    # Role-based route protection
│   │   ├── KpiCard.tsx      # KPI card component
│   │   ├── AlertsTable.tsx  # Alerts DataGrid
│   │   ├── AlertDetailDrawer.tsx # Alert detail drawer
│   │   └── DeviceDetailDrawer.tsx # Device detail drawer
│   ├── store/
│   │   ├── index.ts       # Redux store configuration
│   │   └── slices/
│   │       └── authSlice.ts # Auth state slice
│   ├── theme/
│   │   └── index.ts       # MUI theme configuration
│   ├── types/
│   │   └── index.ts       # TypeScript type definitions
│   ├── ws/
│   │   └── index.ts       # WebSocket hooks
│   └── utils/
│       └── roles.ts       # Role utility functions
├── package.json
├── tsconfig.json
├── next.config.mjs
└── Dockerfile.frontend
```

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

### Docker

```bash
# Build image
docker build -f Dockerfile.frontend -t smart-home-frontend .

# Run container
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:8000 smart-home-frontend
```

## Development

### Code Structure

- **Pages** (`app/`) - Next.js App Router pages
- **Components** (`src/components/`) - Reusable React components
- **API** (`src/api/`) - RTK Query API endpoints
- **Store** (`src/store/`) - Redux store and slices
- **Types** (`src/types/`) - TypeScript type definitions

### Adding New Pages

1. Create page file in `app/(dashboard)/your-page/page.tsx`
2. Add route to `SideNav.tsx` if needed
3. Create API endpoints in `src/api/` if needed
4. Add types in `src/types/index.ts`

### Adding New API Endpoints

1. Add endpoint to appropriate file in `src/api/`
2. Use RTK Query `injectEndpoints`
3. Export hooks for use in components

Example:

```typescript
// src/api/example.ts
import { api } from "./base";

export const exampleApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getExample: builder.query<ExampleType, string>({
      query: (id) => `/example/${id}`,
      providesTags: ["Example"],
    }),
  }),
});

export const { useGetExampleQuery } = exampleApi;
```

## Pages and Routes

### Owner Routes

- `/overview` - Dashboard with KPIs and live alerts feed
- `/alerts` - Alerts list with filters and actions
- `/devices` - Devices list (read-only)
- `/models` - Model configuration management
- `/settings/contacts` - Alert contacts CRUD
- `/settings/policies` - Alert policies configuration

### Technician Routes

- `/tech/assignments` - Assigned homes list
- `/tech/devices` - Device management (CRUD)
- `/tech/tests` - Audio test clip upload
- `/tech/network` - Device network status

### Operations Routes (Staff/Admin)

- `/ops/overview` - Operations dashboard
- `/ops/alerts` - Escalation queue
- `/ops/houses` - All homes overview
- `/ops/audit` - Audit logs
- `/ops/models` - Global model defaults

### Admin Routes

- `/admin/users` - User management (CRUD)
- `/admin/homes` - Home management (CRUD)

## State Management

### Redux Store

The app uses Redux Toolkit for state management:

- **Auth Slice** - User authentication state (user, token)
- **RTK Query** - API data caching and fetching

### Using Redux

```typescript
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/src/store";
import { setCredentials } from "@/src/store/slices/authSlice";

// In component
const user = useSelector((state: RootState) => state.auth.user);
const dispatch = useDispatch();

dispatch(setCredentials({ user, token }));
```

## API Integration

### RTK Query

All API calls use RTK Query for automatic caching and refetching:

```typescript
import { useListAlertsQuery } from "@/src/api/alerts";

function AlertsPage() {
  const { data, isLoading, error } = useListAlertsQuery({
    home_id: homeId,
    status: "open",
  });
  
  // data is automatically cached and refetched
}
```

### Authentication

The API base automatically includes the JWT token from Redux store:

```typescript
// src/api/base.ts
prepareHeaders: (headers, { getState }) => {
  const token = (getState() as RootState).auth.token;
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }
  return headers;
}
```

## Styling and UI

### Material UI

The app uses MUI v5 components following the design system in `.cursorrules`:

- **8px spacing system** - All spacing uses multiples of 8px
- **Typography hierarchy** - h4 for page titles, h6 for sections
- **Color palette** - Primary blue, error red, warning orange
- **Responsive design** - Mobile-first with breakpoints

### Theme

Custom theme configuration in `src/theme/index.ts`:

```typescript
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#9c27b0" },
    background: { default: "#f5f5f7" },
  },
  // ... more theme config
});
```

### Component Patterns

**Cards and Layouts:**
```typescript
<Card elevation={1}>
  <CardContent>
    <Typography variant="h6">Title</Typography>
    {/* Content */}
  </CardContent>
</Card>
```

**DataGrid:**
```typescript
<DataGrid
  rows={data}
  columns={columns}
  loading={isLoading}
  pageSizeOptions={[10, 25, 50]}
/>
```

**Forms:**
```typescript
const { control, handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
```

## WebSocket Integration

Real-time updates via WebSocket:

```typescript
import { useAlertsWS } from "@/src/ws";

function AlertsPage() {
  useAlertsWS(homeId); // Automatically connects and invalidates cache
}
```

## Design System

Follow the `.cursorrules` file for:
- Layout patterns (AppShell, 12-column grid)
- Spacing (8px system)
- Typography (MUI variants)
- Color usage (theme colors)
- Component usage (MUI components)
- Responsive behavior

## Building for Production

```bash
# Build
npm run build

# Start production server
npm start

# Or use Docker
docker build -f Dockerfile.frontend -t smart-home-frontend .
docker run -p 3000:3000 smart-home-frontend
```

## Troubleshooting

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### API Connection Issues

- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS settings on backend
- Verify API is running: `curl http://localhost:8000/healthz`

### Type Errors

```bash
# Run type check
npm run type-check

# Or with Next.js
npm run build
```

## License

Educational project for CMPE 281.
