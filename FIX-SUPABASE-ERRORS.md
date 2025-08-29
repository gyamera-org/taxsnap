# 🚨 Fix Supabase Errors - Quick Setup Guide

## 🔍 **Issues Identified**

1. **404 Error**: `get_account_for_user` function doesn't exist
2. **RLS Error**: "new row violates row-level security policy"

## ✅ **Quick Fix - Run These SQL Scripts**

### Step 1: Fix Missing Functions

Copy and run this in **Supabase Dashboard → SQL Editor**:

```sql
-- File: supabase-missing-functions.sql
```

### Step 2: Fix RLS Policies

Copy and run this in **Supabase Dashboard → SQL Editor**:

```sql
-- File: supabase-fix-rls-policies.sql
```

### Step 3: Original Setup (if not done)

If you haven't run the original scripts, also run these in order:

```sql
-- 1. supabase-setup-tables.sql
-- 2. supabase-onboarding-functions.sql
-- 3. supabase-storage-setup.sql
```

## 🎯 **What These Fixes Do**

### **Missing Functions Fix**

- ✅ Creates `get_account_for_user()` function
- ✅ Creates `update_account_profile()` function
- ✅ Ensures `user_profiles` table exists with RLS
- ✅ Fixes the 404 errors

### **RLS Policies Fix**

- ✅ Proper INSERT/UPDATE/DELETE policies for all tables
- ✅ Auto-creates user profiles on signup
- ✅ Ensures users can only access their own data
- ✅ Fixes "row violates security policy" errors

## 🧪 **Test After Running Scripts**

1. **Open your app** - Settings page should load without errors
2. **Check Setup Verification** (if enabled) - All checks should pass
3. **Try avatar upload** - Should work without permission errors
4. **Edit name/age** - Should save properly
5. **Console should be clean** - No more 404 or RLS errors

## 🔍 **What Was Wrong**

### **404 Error Cause**

```typescript
// This was failing because function didn't exist
const { data, error } = await supabase.rpc('get_account_for_user');
```

### **RLS Error Cause**

```sql
-- Users couldn't insert/update because policies were missing
INSERT INTO user_profiles (...) -- ❌ RLS violation
```

### **Fixed With**

```sql
-- Now users can manage their own data
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 🎉 **After Running Fixes**

Your app should now:

- ✅ **Load settings page** without 404 errors
- ✅ **Display user profile** with avatar, name, age
- ✅ **Allow editing** name, date of birth, avatar
- ✅ **Save onboarding data** without RLS violations
- ✅ **Have clean console** with no Supabase errors

## 🚀 **Ready to Go!**

Once you run these two SQL scripts in your Supabase dashboard, your settings integration will be fully functional!

The 404 and RLS errors will be completely resolved. 🎯
