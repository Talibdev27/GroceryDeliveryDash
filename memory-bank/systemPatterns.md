# System Patterns: Diyor Market Architecture

## System Architecture Overview

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React SPA)   │◄──►│   (Express.js)  │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ • Wouter Router │    │ • REST API      │    │ • Drizzle ORM   │
│ • Context State │    │ • Session Mgmt  │    │ • User Data     │
│ • i18n Support  │    │ • Auth (Passport)│   │ • Product Data  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend Architecture Patterns

#### Component Organization
```
src/
├── components/
│   ├── layout/          # Layout components (Header, Footer, MobileMenu)
│   ├── home/           # Homepage-specific components
│   ├── shop/           # Shopping-related components
│   └── ui/             # Reusable UI components (Radix-based)
├── pages/              # Route-level components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── data/               # Mock data and constants
├── types/              # TypeScript type definitions
└── lib/                # Utility functions and configurations
```

#### State Management Pattern
- **Context-Based State**: React Context for global state (Cart, Language, Theme)
- **Local State**: useState for component-specific state
- **Persistence**: localStorage for cart persistence across sessions
- **No External State Library**: Avoids Redux complexity for this scale

#### Routing Pattern
- **Wouter**: Lightweight routing library
- **Route Structure**:
  - `/` - Homepage
  - `/products` - Product listing
  - `/product/:id` - Product details
  - `/checkout` - Checkout process
  - `/account` - User account management

### Backend Architecture Patterns

#### API Design
- **RESTful Endpoints**: Standard HTTP methods and status codes
- **JSON Responses**: Consistent JSON response format
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Request Logging**: Comprehensive API request/response logging

#### Authentication Pattern
- **Session-Based Auth**: Express-session with PostgreSQL store
- **Passport.js**: Local strategy for username/password authentication
- **Session Persistence**: Database-backed session storage
- **Security**: CSRF protection and secure session configuration

#### Database Pattern
- **Drizzle ORM**: Type-safe database operations
- **Schema-First**: Database schema defined in shared/schema.ts
- **Migration Support**: Drizzle Kit for database migrations
- **Type Safety**: Full TypeScript integration with database operations

### Key Design Patterns

#### 1. Component Composition Pattern
```typescript
// Layout composition with providers
function App() {
  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Router />
        </main>
        <Footer />
      </div>
    </TooltipProvider>
  );
}
```

#### 2. Context Provider Pattern
```typescript
// Centralized state management
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  // ... cart logic
  
  return (
    <CartContext.Provider value={{ cartItems, addToCart, ... }}>
      {children}
    </CartContext.Provider>
  );
};
```

#### 3. Custom Hook Pattern
```typescript
// Reusable logic extraction
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
```

#### 4. Type-Safe API Pattern
```typescript
// Shared types between frontend and backend
export interface Product {
  id: number;
  name: string;
  price: number;
  // ... other properties
}
```

#### 5. Internationalization Pattern
```typescript
// i18n integration with React
const { t } = useTranslation();
return <h1>{t('hero.title')}</h1>;
```

### Component Relationships

#### Layout Hierarchy
```
App
├── TooltipProvider
├── Header
│   ├── LanguageSelector
│   ├── CartButton
│   └── MobileMenu
├── Router
│   ├── Home
│   ├── Products
│   ├── Product
│   ├── Checkout
│   └── Account
├── ShoppingCart (Sidebar)
└── Footer
```

#### Context Dependencies
```
App
├── CartContext (CartProvider)
├── LanguageContext (LanguageProvider)
└── ThemeContext (ThemeProvider)
```

### Data Flow Patterns

#### 1. Product Data Flow
```
Mock Data → Product Components → Cart Context → Checkout → Order
```

#### 2. User Interaction Flow
```
User Action → Component Handler → Context Update → UI Re-render → localStorage Sync
```

#### 3. Language Change Flow
```
Language Selector → LanguageContext → i18n → Component Re-render → HTML Attributes Update
```

### Performance Patterns

#### 1. Code Splitting
- **Route-based**: Each page component loaded on demand
- **Component-based**: Large components split into smaller chunks

#### 2. Image Optimization
- **External CDN**: Unsplash and Pixabay for product images
- **Responsive Images**: Different sizes for different viewports
- **Lazy Loading**: Images loaded as needed

#### 3. State Optimization
- **localStorage Sync**: Cart persistence without server round-trips
- **Context Memoization**: Prevent unnecessary re-renders
- **Component Memoization**: React.memo for expensive components

### Security Patterns

#### 1. Input Validation
- **Zod Schemas**: Runtime type validation
- **Form Validation**: React Hook Form with validation
- **XSS Prevention**: Sanitized user inputs

#### 2. Session Security
- **Secure Cookies**: HTTPOnly, Secure, SameSite attributes
- **Session Rotation**: Regular session regeneration
- **CSRF Protection**: Cross-site request forgery prevention

### Error Handling Patterns

#### 1. Frontend Error Boundaries
```typescript
// Global error boundary for unhandled errors
class ErrorBoundary extends React.Component {
  // Error boundary implementation
}
```

#### 2. API Error Handling
```typescript
// Consistent error response format
{
  "error": "ValidationError",
  "message": "Invalid input data",
  "details": { /* specific error details */ }
}
```

#### 3. User-Friendly Error Messages
- **i18n Error Messages**: Localized error messages
- **Fallback UI**: Graceful degradation for errors
- **Retry Mechanisms**: Automatic retry for transient errors

### Testing Patterns

#### 1. Component Testing
- **React Testing Library**: User-centric testing approach
- **Mock Data**: Consistent test data across tests
- **Accessibility Testing**: Automated a11y testing

#### 2. Integration Testing
- **API Testing**: End-to-end API testing
- **Database Testing**: Database operation testing
- **User Flow Testing**: Complete user journey testing

### Deployment Patterns

#### 1. Build Optimization
- **Vite Build**: Fast, optimized production builds
- **Asset Optimization**: Minification and compression
- **Bundle Analysis**: Bundle size monitoring

#### 2. Environment Configuration
- **Environment Variables**: Configuration management
- **Feature Flags**: Gradual feature rollouts
- **Monitoring**: Application performance monitoring
