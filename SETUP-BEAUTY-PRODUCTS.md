# Beauty Products Setup Guide

## Quick Setup Steps

### 1. Create Database Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of create-beauty-products-tables.sql
```

### 2. Deploy Edge Function

```bash
# Deploy the beauty products manager function
supabase functions deploy beauty-products-manager
```

### 3. Test the Setup

1. Open your app
2. Go to Settings → Skincare Products
3. Tap the + icon
4. Try adding a product manually
5. Check if it appears in your products list

## Troubleshooting

If manual add doesn't work:

1. Check browser console for errors
2. Verify the edge function is deployed
3. Ensure database tables exist
4. Check RLS policies are active

## Files Created

- `create-beauty-products-tables.sql` - Database schema
- `supabase/functions/beauty-products-manager/index.ts` - Edge function
- `lib/hooks/use-beauty-products.ts` - React hooks
