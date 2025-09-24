# Technical Context: FreshCart Technology Stack

## Technology Stack Overview

### Frontend Technologies
- **React 18.3.1**: Modern React with concurrent features and hooks
- **TypeScript 5.6.3**: Full type safety across the application
- **Vite 5.4.14**: Fast build tool and development server
- **Wouter 3.7.0**: Lightweight client-side routing
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **Radix UI**: Accessible, unstyled UI primitives

### Backend Technologies
- **Node.js**: JavaScript runtime for server-side development
- **Express.js 4.21.2**: Web application framework
- **TypeScript**: Shared type definitions between frontend and backend
- **Drizzle ORM 0.39.1**: Type-safe database operations
- **PostgreSQL**: Relational database with Neon serverless support

### Development Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for development
- **Drizzle Kit**: Database migration and introspection tools
- **PostCSS**: CSS processing with Tailwind CSS

## Development Setup

### Prerequisites
- **Node.js**: Version 18+ recommended
- **npm**: Package manager (comes with Node.js)
- **PostgreSQL**: Database server (or Neon cloud database)

### Installation Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run check

# Database operations
npm run db:push
```

### Project Structure
```
GroceryDeliveryDash/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Route components
│   │   ├── context/       # React Context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── data/          # Mock data and constants
│   │   ├── types/         # TypeScript type definitions
│   │   └── lib/           # Utility functions
│   └── index.html         # HTML entry point
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   └── storage.ts        # Database connection
├── shared/               # Shared code between frontend and backend
│   └── schema.ts         # Database schema definitions
├── memory-bank/          # Project documentation
└── dist/                 # Production build output
```

## Key Dependencies

### Frontend Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "wouter": "^3.7.0",
  "i18next": "^25.2.0",
  "react-i18next": "^15.5.1",
  "framer-motion": "^11.13.1",
  "lucide-react": "^0.453.0",
  "react-helmet-async": "^2.0.5",
  "react-hook-form": "^7.56.4",
  "react-icons": "^5.5.0",
  "next-themes": "^0.4.6",
  "tailwind-merge": "^2.6.0",
  "class-variance-authority": "^0.7.1"
}
```

### Backend Dependencies
```json
{
  "express": "^4.21.2",
  "drizzle-orm": "^0.39.1",
  "drizzle-zod": "^0.7.0",
  "passport": "^0.7.0",
  "passport-local": "^1.0.0",
  "express-session": "^1.18.1",
  "connect-pg-simple": "^10.0.0",
  "memorystore": "^1.6.7",
  "zod": "^3.25.7",
  "zod-validation-error": "^3.4.0"
}
```

### UI Component Libraries
```json
{
  "@radix-ui/react-*": "Latest versions",
  "embla-carousel-react": "^8.6.0",
  "cmdk": "^1.1.1",
  "vaul": "^1.1.2",
  "input-otp": "^1.4.2"
}
```

## Configuration Files

### Vite Configuration (`vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [react(), runtimeErrorOverlay()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
});
```

### TypeScript Configuration (`tsconfig.json`)
- **Strict Mode**: Enabled for maximum type safety
- **Path Mapping**: Configured for clean imports
- **Target**: ES2020 for modern JavaScript features
- **Module Resolution**: Node16 for proper module handling

### Tailwind Configuration (`tailwind.config.ts`)
- **Custom Design System**: Extended with project-specific colors and spacing
- **Animation Support**: Custom animations for smooth interactions
- **Plugin Integration**: Typography and form plugins

## Database Configuration

### Drizzle Configuration (`drizzle.config.ts`)
```typescript
export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
};
```

### Database Schema (`shared/schema.ts`)
```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});
```

## Internationalization Setup

### i18n Configuration (`client/src/lib/i18n.ts`)
- **Language Detection**: Browser language detection
- **Fallback Language**: English as default
- **Supported Languages**: English, Spanish, Arabic, Russian, Uzbek
- **RTL Support**: Automatic RTL layout for Arabic

### Translation Files Structure
```
client/src/data/locales/
├── en.json          # English translations
├── ru.json          # Russian translations
├── uz.json          # Uzbek translations
└── client/src/locales/
    ├── ar/translation.json  # Arabic translations
    ├── en/translation.json  # English translations
    └── es/translation.json  # Spanish translations
```

## Build and Deployment

### Development Server
- **Port**: 5000 (configured for Replit compatibility)
- **Hot Reload**: Vite HMR for instant updates
- **API Proxy**: Frontend and backend served from same port

### Production Build
- **Frontend**: Vite build to `dist/public`
- **Backend**: ESBuild bundle to `dist/index.js`
- **Static Assets**: Optimized and compressed
- **Environment**: Production environment variables

### Deployment Configuration
- **Netlify**: `netlify.toml` for deployment settings
- **Environment Variables**: Database URL and other secrets
- **Build Commands**: Automated build and deployment

## Development Workflow

### Code Organization
- **Feature-Based**: Components organized by feature/domain
- **Shared Types**: Common types in `shared/` directory
- **Mock Data**: Realistic mock data for development
- **Context Providers**: Centralized state management

### Type Safety
- **Strict TypeScript**: Maximum type checking enabled
- **Shared Schemas**: Database and API schemas shared
- **Runtime Validation**: Zod schemas for runtime type checking
- **Component Props**: Fully typed React component props

### Performance Considerations
- **Code Splitting**: Route-based code splitting
- **Bundle Optimization**: Tree shaking and minification
- **Image Optimization**: External CDN for product images
- **Caching**: localStorage for cart persistence

## Security Considerations

### Authentication
- **Session-Based**: Express-session with secure cookies
- **Password Hashing**: bcrypt for password security
- **CSRF Protection**: Cross-site request forgery prevention
- **Input Validation**: Zod schemas for input validation

### Data Protection
- **Environment Variables**: Sensitive data in environment variables
- **Database Security**: Parameterized queries with Drizzle ORM
- **XSS Prevention**: Sanitized user inputs
- **HTTPS**: Secure communication in production

## Monitoring and Debugging

### Development Tools
- **React DevTools**: Component inspection and debugging
- **TypeScript Compiler**: Real-time type checking
- **Vite DevTools**: Build and performance analysis
- **Browser DevTools**: Network and performance monitoring

### Error Handling
- **Error Boundaries**: React error boundaries for graceful failures
- **API Error Handling**: Consistent error response format
- **Logging**: Comprehensive request/response logging
- **User Feedback**: Toast notifications for user actions
