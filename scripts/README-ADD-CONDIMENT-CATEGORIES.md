# Add Condiment Categories Script

## Overview
This script adds three essential grocery categories to your database:
- **Canned Goods** (Kanservantlar / Консервы)
- **Spices** (Ziravorlar / Специи)  
- **Sauces** (Souslar / Соусы)

These categories are defined in the frontend mock data but may not exist in your database, which is why they don't appear in the "Shop by Category" carousel.

## Quick Start

### Prerequisites
1. Database must be initialized (run `npm run db:push` first)
2. `DATABASE_URL` environment variable must be set in `.env` file

### Run the Script

```bash
npx tsx scripts/add-condiment-categories.ts
```

Or if you prefer using npm script (add to package.json):
```bash
npm run add-condiments
```

## What the Script Does

1. **Checks for existing categories** by slug (`kanservantlar`, `ziravorlar`, `souslar`)
2. **If category doesn't exist**: Inserts it with all translations and sets `is_active = true`
3. **If category exists but is inactive**: Activates it and updates all fields
4. **If category exists and is active**: Updates fields to match current definitions

## Expected Output

```
🛍️ Adding 3 condiment categories to database...
📊 Database: postgresql://user:****@host/dbname
✅ Added new category: Canned Goods (Kanservantlar)
✅ Added new category: Spices (Ziravorlar)
✅ Added new category: Sauces (Souslar)

🎉 Category migration completed!
   Added: 3
   Updated/Activated: 0
   Already exists: 0

📋 Categories processed:
   - Canned Goods / Kanservantlar / Консервы (slug: kanservantlar)
   - Spices / Ziravorlar / Специи (slug: ziravorlar)
   - Sauces / Souslar / Соусы (slug: souslar)

✅ Script completed successfully!
```

## Verification Steps

After running the script, verify the categories were added:

### 1. Check API Endpoint
```bash
curl http://localhost:5000/api/categories | jq '.categories[] | select(.slug == "kanservantlar" or .slug == "ziravorlar" or .slug == "souslar")'
```

Or visit in browser:
```
http://localhost:5000/api/categories
```

You should see all three categories with:
- `is_active: true`
- All translation fields populated
- Correct image URLs
- Correct slugs

### 2. Check Frontend Carousel
1. Start the dev server: `npm run dev`
2. Navigate to homepage: `http://localhost:5000`
3. Scroll the "Shop by Category" carousel
4. You should see **Canned Goods**, **Spices**, and **Sauces** after **Beverages**

### 3. Check Product Filters
1. Navigate to `/products`
2. Open the "Filter by Category" accordion
3. You should see checkboxes for all three new categories

## Troubleshooting

### Error: DATABASE_URL not set
```
Error: DATABASE_URL environment variable is required
```
**Solution**: Create a `.env` file in the project root with:
```env
DATABASE_URL="postgresql://user:password@host:port/database"
```

### Error: Connection refused
```
Error: connect ECONNREFUSED
```
**Solution**: 
- Verify your database is running
- Check the connection string is correct
- For cloud databases (Neon), ensure your IP is whitelisted

### Categories still not showing
1. Check if categories were actually inserted:
   ```sql
   SELECT * FROM categories WHERE slug IN ('kanservantlar', 'ziravorlar', 'souslar');
   ```
2. Verify `is_active = true` for all three
3. Restart your dev server to clear any caching
4. Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)

## Production Deployment

For production databases:

1. **Set DATABASE_URL in production environment**
   ```bash
   export DATABASE_URL="postgresql://prod-user:prod-pass@prod-host:5432/prod-db"
   ```

2. **Run the script**
   ```bash
   npx tsx scripts/add-condiment-categories.ts
   ```

3. **Verify via production API**
   ```bash
   curl https://your-production-domain.com/api/categories
   ```

4. **Deploy frontend changes** (if any) and verify carousel shows new categories

## Related Files

- **Schema Definition**: `shared/schema.ts` - Category table structure
- **Mock Data**: `client/src/data/categories.ts` - Frontend category definitions
- **API Endpoint**: `server/routes.ts` - `/api/categories` route
- **Storage Layer**: `server/storage.ts` - `getCategories()` method
- **Frontend Component**: `client/src/components/home/CategoriesCarousel.tsx` - Carousel display

## Notes

- The script is **idempotent** - safe to run multiple times
- It will not create duplicate categories (uses `slug` as unique identifier)
- All categories are set to `is_active = true` to ensure they appear in the API
- Image URLs point to Unsplash CDN and should be accessible


