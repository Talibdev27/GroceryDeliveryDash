# FreshCart - Grocery Delivery Platform

## Overview

FreshCart is a modern, multi-language grocery delivery platform that promises 30-minute delivery of fresh products from local farms and stores. The application is built as a full-stack web application with React frontend and Express.js backend, featuring real-time shopping cart management, user authentication, and comprehensive admin/super-admin dashboards.

**Core Purpose**: Enable customers to quickly order fresh groceries with ultra-fast delivery while providing robust management tools for administrators and delivery riders.

**Key Features**:
- Multi-language support (English, Russian, Uzbek, Spanish, Arabic with RTL)
- Real-time shopping cart with localStorage persistence
- User authentication and role-based access control
- Admin dashboard for product and order management
- Super Admin dashboard for user and system management
- Rider dashboard for delivery management
- Mobile-first responsive design

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**:
- **React 18.3.1** with TypeScript for type safety and modern hooks
- **Vite 5.4.14** as build tool for fast development and optimized production builds
- **Wouter 3.7.0** for lightweight client-side routing (chosen over React Router for smaller bundle size)

**State Management Strategy**:
- **React Context API** for global state (cart, language, theme, authentication)
- **Local component state** with useState for UI-specific state
- **localStorage** for cart persistence across sessions
- **TanStack Query** for server state and API data fetching
- **Decision rationale**: Avoids Redux complexity while maintaining clean state management for the application's scale

**UI Component System**:
- **Radix UI** primitives for accessible, unstyled components
- **Tailwind CSS 3.4.17** for utility-first styling
- **Custom design system** with CSS variables for theming
- **shadcn/ui** component patterns for consistent UI

**Internationalization (i18n)**:
- **i18next** with react-i18next for translation management
- **5 supported languages**: English (en), Spanish (es), Arabic (ar), Russian (ru), Uzbek (uz)
- **RTL support** for Arabic with directional context
- **Browser language detection** with localStorage preference persistence
- **Translation files** organized in JSON format under `/client/src/data/locales/`

**Routing Structure**:
```
/ - Homepage with hero, categories, featured products
/products - Product catalog with search/filter
/product/:id - Individual product details
/checkout - Multi-step checkout process
/account - User account management
/auth - Login/registration
/admin - Admin dashboard (role-protected)
/super-admin - Super admin dashboard (role-protected)
/rider - Rider dashboard (role-protected)
```

### Backend Architecture

**Server Framework**:
- **Express.js 4.21.2** with TypeScript
- **Node.js** runtime environment
- **Session-based authentication** using express-session

**Database Layer**:
- **PostgreSQL** as primary database (using Neon serverless PostgreSQL in production)
- **Drizzle ORM 0.39.1** for type-safe database operations
- **Schema-first approach** with migrations in `/migrations` directory
- **Connection pooling** via pg Pool for efficient database connections

**Database Schema Design**:
- **users**: User accounts with role-based permissions (customer, admin, super_admin)
- **addresses**: User delivery addresses with default address support
- **categories**: Product categories with multi-language names
- **products**: Product catalog with pricing, stock, and multi-language descriptions
- **orders**: Order management with status tracking
- **order_items**: Line items for each order
- **user_sessions**: Session storage in PostgreSQL
- **system_logs**: Audit trail for admin actions

**Authentication & Authorization**:
- **Passport.js** with local strategy for username/password authentication
- **bcrypt** for password hashing (10 rounds)
- **Role-based access control** with three roles: customer, admin, super_admin
- **Permission system**: JSON array of granular permissions stored per user
- **Session management**: Express-session with PostgreSQL store (connect-pg-simple)
- **Secure cookies**: httpOnly, secure flag in production, 24-hour expiry

**API Design Pattern**:
- **RESTful endpoints** under `/api` prefix
- **Authentication middleware** for protected routes
- **Role verification middleware** for admin/super-admin routes
- **Zod validation** for request body validation using drizzle-zod schemas
- **Error handling**: Centralized error handling with appropriate HTTP status codes

**Key API Endpoints**:
```
POST /api/auth/register - User registration
POST /api/auth/login - User login
POST /api/auth/logout - User logout
GET /api/auth/me - Get current user session
GET /api/products - List all products
GET /api/products/:id - Get single product
GET /api/categories - List all categories
POST /api/admin/products - Create product (admin only)
GET /api/super-admin/users - List all users (super admin only)
GET /api/super-admin/logs - System logs (super admin only)
```

### Data Flow Architecture

**Client-Server Communication**:
- **HTTP/JSON API** for all client-server communication
- **Credentials included** in fetch requests for session cookies
- **CORS configuration**: Same-origin in production, configurable origins in development
- **API base URL**: Configurable via VITE_API_BASE environment variable

**Cart Management Flow**:
1. User adds product → Cart Context updates
2. Cart state persists to localStorage
3. Checkout reads from Cart Context
4. Order submission sends to backend API
5. Backend creates order and order_items in database

**Authentication Flow**:
1. User submits credentials → POST /api/auth/login
2. Backend validates with bcrypt → Creates session
3. Session stored in PostgreSQL with connect-pg-simple
4. Session cookie returned to client (httpOnly, secure)
5. Subsequent requests include session cookie
6. Middleware verifies session and loads user

### Development & Deployment Strategy

**Development Environment**:
- **npm scripts**: Separate dev/build/start scripts
- **tsx** for TypeScript execution in development
- **Hot module replacement** via Vite for fast development
- **TypeScript strict mode** for type safety

**Build Process**:
- **Frontend**: Vite builds React app to `/dist/public`
- **Backend**: esbuild bundles Express server to `/dist`
- **Type checking**: tsc with noEmit for validation
- **Production build**: `npm run build` creates optimized bundles

**Database Operations**:
```bash
npm run db:push - Push schema changes to database
npm run db:generate - Generate migrations
npm run db:studio - Open Drizzle Studio GUI
npm run seed - Seed database with initial data
npm run setup-db - Complete database setup
```

## External Dependencies

### Third-Party Services

**Database & Storage**:
- **Neon PostgreSQL**: Serverless PostgreSQL database platform (recommended for production)
- **Connection**: Via DATABASE_URL environment variable
- **Alternative**: Local PostgreSQL installation supported

**UI Component Libraries**:
- **Radix UI**: Complete set of accessible primitives (@radix-ui/react-*)
  - Accordion, Alert Dialog, Avatar, Checkbox, Dialog, Dropdown Menu
  - Navigation Menu, Popover, Radio Group, Select, Slider, Switch, Tabs, Toast, Tooltip
- **Lucide React**: Icon library for consistent iconography

**Form Management**:
- **React Hook Form** (@hookform/resolvers): Form state and validation
- **Zod**: Schema validation with TypeScript integration
- **Integration**: drizzle-zod for automatic schema validation from database models

**Internationalization**:
- **i18next**: Core internationalization framework
- **react-i18next**: React bindings for i18next
- **Browser language detection**: Automatic language detection from browser settings

**State & Data Fetching**:
- **TanStack Query** (@tanstack/react-query): Server state management and caching
- **React Context**: Global state (cart, auth, language, theme)

**Styling & Theming**:
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **class-variance-authority**: Component variant styling
- **clsx + tailwind-merge**: Conditional class composition
- **PostCSS**: CSS processing with autoprefixer

**Development Tools**:
- **Vite plugins**: 
  - @vitejs/plugin-react for React Fast Refresh
  - @replit/vite-plugin-runtime-error-modal for error overlay
  - @replit/vite-plugin-cartographer for Replit integration
- **TypeScript**: Full type coverage across frontend and backend
- **ESBuild**: Fast production bundling

### Environment Variables Required

```env
DATABASE_URL - PostgreSQL connection string (required)
SESSION_SECRET - Secret key for session encryption (required)
NODE_ENV - Environment: development or production
CORS_ORIGIN - Comma-separated list of allowed origins (optional)
VITE_API_BASE - API base URL for frontend (optional, defaults to /api)
```

### Key NPM Dependencies

**Backend Core**:
- express, cors, pg, bcrypt
- drizzle-orm, drizzle-kit, @neondatabase/serverless
- express-session, connect-pg-simple

**Frontend Core**:
- react, react-dom, wouter
- @tanstack/react-query
- i18next, react-i18next
- react-helmet-async for SEO

**Development**:
- typescript, tsx, esbuild, vite
- @types/* for TypeScript definitions