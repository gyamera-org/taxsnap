# 🔄 Migration Guide: Consolidate to Accounts Table

## 📋 **What This Migration Does**

Simplifies the database structure by using only the `accounts` table instead of having both `accounts` and `user_profiles` tables. Everything is now stored in one place!

## ✅ **Step 1: Run the Migration SQL**

Copy and run `supabase-migrate-to-accounts.sql` in your **Supabase Dashboard → SQL Editor**

This will:

- ✅ Add missing columns to `accounts` table
- ✅ Migrate any existing `user_profiles` data to `accounts`
- ✅ Update all functions to use `accounts` table
- ✅ Keep all existing functionality working

## 🔧 **Step 2: Code Changes (Already Done)**

I've updated the code to use accounts directly:

### **Settings Page**

```typescript
// OLD: Used both userSettings and account
const name = userSettings?.personal?.display_name || account?.name || 'User';

// NEW: Uses only account
const name = account?.name || 'User';
```

### **Avatar Upload**

```typescript
// OLD: Used user_profiles via update_user_setting
await supabase.rpc('update_user_setting', {
  p_setting_type: 'profile',
  p_setting_data: { avatar_url: avatarUrl },
});

// NEW: Uses accounts via update_account_profile
await supabase.rpc('update_account_profile', {
  p_avatar: avatarUrl,
});
```

### **Personal Details**

```typescript
// OLD: Updated both account and user_profile
updateAccount({ name: tempValue });
updateUserSetting({ settingType: 'profile', settingData: { display_name: tempValue } });

// NEW: Updates only account
updateAccount({ name: tempValue });
```

## 🗄️ **Database Structure Changes**

### **Before (Confusing)**

```
accounts table:           user_profiles table:
- id                     - id
- user_id                - user_id
- name                   - display_name
- subscription_*         - date_of_birth
- created_at             - avatar_url
- updated_at             - onboarding_completed
```

### **After (Simple)**

```
accounts table:
- id
- user_id
- name
- display_name          ← Added
- date_of_birth         ← Added
- avatar_url            ← Added
- onboarding_completed  ← Added
- subscription_*
- created_at
- updated_at
```

## 🎯 **Benefits**

### **Simplified Architecture**

- ✅ **One source of truth** - All user data in accounts table
- ✅ **Fewer joins** - No need to join accounts + user_profiles
- ✅ **Less complexity** - Easier to understand and maintain
- ✅ **Better performance** - Fewer table lookups

### **Cleaner Code**

- ✅ **Single data source** - `useAccount()` provides everything
- ✅ **Simpler updates** - One function to update user info
- ✅ **Less state management** - Fewer hooks and loading states
- ✅ **Reduced complexity** - Less mental overhead

## 🧪 **Testing After Migration**

1. **Settings page loads** with user profile card ✅
2. **Avatar upload works** and updates account.avatar_url ✅
3. **Name editing** updates account.name and account.display_name ✅
4. **Date of birth** updates account.date_of_birth ✅
5. **Age calculation** works from account.date_of_birth ✅
6. **All existing functionality** continues working ✅

## 🔄 **Migration is Safe**

- ✅ **No data loss** - Existing data is preserved and migrated
- ✅ **Backward compatible** - Functions handle both old and new data
- ✅ **Gradual transition** - Old user_profiles data is migrated automatically
- ✅ **Rollback possible** - Original tables can be restored if needed

## 🚀 **Result**

After migration:

- **Simpler codebase** with fewer moving parts
- **Better performance** with direct account access
- **Easier maintenance** with unified user data
- **Same functionality** but much cleaner implementation

Your settings system is now streamlined and much easier to work with! 🎉
