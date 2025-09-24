# Project Brief: Grocery Delivery Dashboard

## Project Overview
**FreshCart** is a modern grocery delivery web application that provides fast, convenient grocery shopping with 30-minute delivery promises. The application serves as a comprehensive e-commerce platform for fresh groceries, featuring a responsive design, multi-language support, and real-time cart management.

## Core Requirements

### Primary Goals
1. **Fast Delivery Promise**: Deliver groceries within 30 minutes or less
2. **Fresh Product Focus**: Emphasize fresh, organic, and locally-sourced products
3. **User Experience**: Provide an intuitive, mobile-first shopping experience
4. **Multi-language Support**: Support English, Spanish, Arabic, Russian, and Uzbek
5. **Real-time Shopping**: Live cart updates and instant product availability

### Key Features
- **Product Catalog**: Browse categories (Fruits, Vegetables, Dairy, Bakery, Meat, Seafood, Frozen, Snacks)
- **Shopping Cart**: Real-time cart management with localStorage persistence
- **User Accounts**: Profile management, order history, saved addresses
- **Checkout Process**: Multi-step checkout with delivery options and payment
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Internationalization**: Full i18n support with RTL language handling

### Target Users
- **Primary**: Urban consumers seeking convenient grocery delivery
- **Secondary**: Busy professionals, families, elderly users
- **Geographic**: Multi-language support suggests international market focus

## Technical Scope

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context for cart and user state
- **UI Components**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS with custom design system
- **Internationalization**: i18next with browser language detection

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **Session Management**: Express-session with PostgreSQL store
- **API Design**: RESTful endpoints with JSON responses

### Development Environment
- **Build Tool**: Vite for fast development and optimized builds
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Code Quality**: ESLint, Prettier, and TypeScript strict mode
- **Deployment**: Netlify-ready with serverless functions

## Success Metrics
- **Performance**: Sub-30-minute delivery promise fulfillment
- **User Experience**: Intuitive navigation and fast checkout process
- **Accessibility**: WCAG compliance and multi-language support
- **Scalability**: Architecture ready for growth and feature expansion

## Constraints
- **Delivery Time**: Must maintain 30-minute delivery promise
- **Product Freshness**: Real-time inventory and availability management
- **Mobile Priority**: Mobile-first design is non-negotiable
- **Multi-language**: All content must be properly internationalized

## Project Status
This is a **full-stack web application** in active development, featuring a complete frontend with mock data and a backend API structure. The application demonstrates modern React patterns, comprehensive internationalization, and a scalable architecture ready for production deployment.
