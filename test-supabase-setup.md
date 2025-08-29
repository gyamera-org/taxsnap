# Testing Supabase Setup for Settings Integration

## 📋 Setup Checklist

### 1. SQL Scripts to Run (in order)

Execute these in your Supabase Dashboard → SQL Editor:

```sql
-- 1. First run the table setup
-- File: supabase-setup-tables.sql
```

```sql
-- 2. Then run the functions
-- File: supabase-onboarding-functions.sql
```

```sql
-- 3. Finally setup storage
-- File: supabase-storage-setup.sql
```

### 2. Verify Tables Exist

Check these tables exist in your Database:

- ✅ `user_profiles`
- ✅ `fitness_goals`
- ✅ `nutrition_goals`
- ✅ `body_measurements`
- ✅ `cycle_settings`
- ✅ `lifestyle_preferences`
- ✅ `weight_history`

### 3. Verify Functions Exist

Check these functions exist:

- ✅ `process_onboarding_data(user_id, onboarding_data)`
- ✅ `get_user_complete_settings(user_id)`
- ✅ `update_user_setting(user_id, type, data)`
- ✅ `add_weight_entry(user_id, weight, units, note, date)`
- ✅ `get_weight_history(user_id, limit)`

### 4. Verify Storage Bucket

Check Storage section:

- ✅ `avatars` bucket exists
- ✅ Public access enabled
- ✅ RLS policies applied

## 🧪 Testing the Settings Integration

### Test 1: User Profile Data

```typescript
// This should work in the settings page:
const { data: userSettings } = useUserSettings();
const { data: account } = useAccount();

// Should display:
// - User name from userSettings or account
// - Age calculated from date_of_birth
// - Avatar from userSettings
```

### Test 2: Avatar Upload

```typescript
// This should work in personal details:
const avatarUpload = useAvatarUpload();

// Should allow:
// - Camera capture
// - Gallery selection
// - Upload to Supabase Storage
// - Update user profile with URL
```

### Test 3: Settings Updates

```typescript
// This should work for name/date updates:
const updateUserSetting = useUpdateUserSetting();

// Should update:
// - display_name in user_profiles
// - date_of_birth in user_profiles
// - Sync with accounts table
```

## 🚨 Common Issues & Solutions

### Issue 1: `useUserSettings()` returns undefined

**Solution**: Run the SQL scripts and ensure tables exist

### Issue 2: Avatar upload fails

**Solution**:

- Check `avatars` bucket exists
- Verify RLS policies
- Install `expo-file-system`

### Issue 3: Settings updates don't persist

**Solution**:

- Verify `update_user_setting` function exists
- Check RLS policies on `user_profiles` table

### Issue 4: Age calculation fails

**Solution**:

- Ensure `date_of_birth` is stored as proper date string
- Check format is 'YYYY-MM-DD'

## 🔍 Debug Commands

### Check if functions exist:

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%user%';
```

### Check if tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user_profiles', 'fitness_goals', 'nutrition_goals');
```

### Check storage bucket:

```sql
SELECT * FROM storage.buckets WHERE id = 'avatars';
```

## ✅ Success Indicators

When everything is working:

1. **Settings page loads** with user profile card
2. **Avatar displays** or shows default icon
3. **Name and age** show correctly or "User" + "Age not set"
4. **Personal details** allows editing name, date, avatar
5. **Updates persist** across app restarts
6. **No console errors** related to Supabase

## 🔄 Migration Notes

If you have existing users:

- Old account data will still work as fallback
- New users get full profile data via onboarding
- Gradual migration as users update their profiles
- No data loss during transition
