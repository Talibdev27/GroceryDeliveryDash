# Database Setup Guide for Diyor Market

## Overview
This guide will help you set up the database and authentication system for Diyor Market. The application now uses PostgreSQL with Drizzle ORM for real data persistence.

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- npm or yarn package manager

## Database Options

### Option 1: Neon PostgreSQL (Recommended)
Neon is a serverless PostgreSQL platform that's perfect for development and production.

1. **Sign up for Neon**: Go to [neon.tech](https://neon.tech) and create a free account
2. **Create a database**: Create a new project and database
3. **Get connection string**: Copy the connection string from your Neon dashboard
4. **Set environment variable**: Add to your `.env` file:
   ```
   DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb"
   ```

### Option 2: Local PostgreSQL
If you prefer to run PostgreSQL locally:

1. **Install PostgreSQL**: Follow the installation guide for your OS
2. **Create database**: Create a database named `diyormarket`
3. **Set environment variable**: Add to your `.env` file:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/diyormarket"
   ```

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="your-database-connection-string"
SESSION_SECRET="your-super-secret-session-key"
NODE_ENV="development"
```

### 3. Push Database Schema
```bash
npm run db:push
```
This will create all the necessary tables in your database.

### 4. Seed Initial Data
```bash
npm run seed
```
This will populate your database with categories and products from the mock data.

### 5. Start Development Server
```bash
npm run dev
```

## Database Maintenance Scripts

### Adding New Categories

To add the Canned Goods, Spices, and Sauces categories to your database:

```bash
npx tsx scripts/add-condiment-categories.ts
```

**Prerequisites:**
- `DATABASE_URL` environment variable must be set in your `.env` file
- Database must be accessible and schema must be initialized

**What it does:**
- Checks if each category (by slug) already exists
- If missing, inserts the new category with all translations
- If exists but inactive, activates it and updates fields
- If exists and active, updates fields to match current definitions

**Categories added:**
- Canned Goods (Kanservantlar / Консервы)
- Spices (Ziravorlar / Специи)
- Sauces (Souslar / Соусы)

**For Production:**
1. Ensure `DATABASE_URL` is set in your production environment
2. Run the script: `npx tsx scripts/add-condiment-categories.ts`
3. Verify categories appear via `/api/categories` endpoint
4. Check the frontend carousel shows the new categories

## Database Schema

The database includes the following tables:

- **users**: User accounts with authentication
- **addresses**: User delivery addresses
- **categories**: Product categories
- **products**: Product catalog
- **orders**: Order records
- **order_items**: Individual items in orders
- **user_sessions**: Session management

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/addresses` - Get user addresses
- `POST /api/user/addresses` - Create address
- `PUT /api/user/addresses/:id` - Update address
- `DELETE /api/user/addresses/:id` - Delete address

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/categories` - Get all categories
- `GET /api/products/featured` - Get featured products

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order

## Testing the Setup

### 1. Test Database Connection
```bash
npm run setup-db
```

### 2. Test API Endpoints
You can test the API endpoints using curl or a tool like Postman:

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'

# Get products
curl http://localhost:5000/api/products
```

### 3. Test Frontend Authentication
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:5000`
3. Try registering a new account
4. Test login/logout functionality

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify your DATABASE_URL is correct
   - Ensure your database is running and accessible
   - Check firewall settings if using cloud database

2. **Schema Push Fails**
   - Make sure you have the correct permissions on your database
   - Check if tables already exist and need to be dropped

3. **Session Issues**
   - Ensure SESSION_SECRET is set
   - Check that cookies are enabled in your browser

4. **API Errors**
   - Check the server console for error messages
   - Verify all environment variables are set
   - Ensure the database is properly seeded

### Useful Commands

```bash
# Generate new migration files
npm run db:generate

# Open Drizzle Studio (database GUI)
npm run db:studio

# Check TypeScript types
npm run check

# Reset and reseed database
npm run db:push
npm run seed
```

## Next Steps

Once the database is set up and working:

1. **Test Authentication**: Register and login with test accounts
2. **Test Product Data**: Verify products and categories are loaded
3. **Test Cart Functionality**: Add products to cart and test persistence
4. **Test Order Creation**: Create test orders through the API
5. **Frontend Integration**: Update frontend components to use real API data

## Production Considerations

For production deployment:

1. **Use Environment Variables**: Never hardcode database credentials
2. **Secure Session Secret**: Use a strong, random session secret
3. **Database Security**: Use connection pooling and SSL
4. **Error Handling**: Implement proper error logging and monitoring
5. **Backup Strategy**: Set up regular database backups

## Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure your database is accessible and properly configured
4. Check the Drizzle documentation for schema-related issues
