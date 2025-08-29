# Complete Signup Flow Setup Guide

This guide walks you through setting up the complete signup flow with Supabase integration, including onboarding data processing and avatar uploads.

## 🗄️ Database Setup

### Step 1: Run SQL Scripts in Supabase

Execute these SQL files in your Supabase Dashboard → SQL Editor (in order):

1. **`supabase-setup-tables.sql`** - Creates all the main tables
2. **`supabase-onboarding-functions.sql`** - Creates functions for data processing
3. **`supabase-storage-setup.sql`** - Sets up storage bucket and policies

### Step 2: Verify Tables Created

Check that these tables exist in your Supabase Database:

- `user_profiles`
- `fitness_goals`
- `nutrition_goals`
- `body_measurements`
- `cycle_settings`
- `lifestyle_preferences`
- `weight_history`

### Step 3: Verify Storage Bucket

Check that the `avatars` bucket exists in Supabase Storage with public access enabled.

## 📱 App Dependencies

### Required Packages

Add this dependency to your `package.json`:

```bash
npx expo install expo-file-system
```

### Already Included

These packages should already be in your project:

- `expo-image-picker`
- `@tanstack/react-query`
- `@supabase/supabase-js`

## 🔧 Code Integration

### Hooks Available

Use these hooks in your components:

#### Onboarding & Settings

```typescript
import {
  useUserSettings,
  useProcessOnboarding,
  useUpdateUserSetting,
  useAddWeightEntry,
  useWeightHistory,
} from '@/lib/hooks/use-onboarding';

// Get complete user settings
const { data: settings, isLoading } = useUserSettings();

// Process onboarding data
const processOnboarding = useProcessOnboarding();
await processOnboarding.mutateAsync(onboardingData);

// Update specific settings
const updateSetting = useUpdateUserSetting();
await updateSetting.mutateAsync({
  settingType: 'fitness',
  settingData: { primary_goal: 'lose_weight' },
});
```

#### Avatar Management

```typescript
import { useAvatar, useAvatarUpload, useDeleteAvatar } from '@/lib/hooks/use-avatar';

// Get current avatar
const { data: avatarUrl } = useAvatar();

// Upload avatar (with camera/gallery choice)
const avatarUpload = useAvatarUpload();
await avatarUpload.mutateAsync({ useCamera: false });

// Delete avatar
const deleteAvatar = useDeleteAvatar();
await deleteAvatar.mutateAsync();
```

### Example Usage

#### In Settings Page

```typescript
import { AvatarUpload } from '@/components/settings/avatar-upload';
import { useUserSettings, useUpdateFitnessGoals } from '@/lib/hooks/use-onboarding';

export default function SettingsPage() {
  const { data: settings } = useUserSettings();
  const updateFitness = useUpdateFitnessGoals();

  return (
    <View>
      <AvatarUpload size={100} />
      <Text>Welcome {settings?.personal.display_name}</Text>

      <Button
        title="Update Fitness Goal"
        onPress={() => updateFitness.mutate({
          primary_goal: 'build_muscle'
        })}
      />
    </View>
  );
}
```

#### In Onboarding Completion

```typescript
import { useProcessOnboarding } from '@/lib/hooks/use-onboarding';

const processOnboarding = useProcessOnboarding();

const handleCompleteOnboarding = async (onboardingData) => {
  try {
    await processOnboarding.mutateAsync(onboardingData);
    // Success is handled automatically with toast
    router.replace('/(tabs)/nutrition');
  } catch (error) {
    // Error is handled automatically with toast
  }
};
```

## 🔄 How It Works

### Signup Flow

1. **User completes onboarding** → Data collected in `OnboardingData` format
2. **User signs up** (email/Apple) → Account created in Supabase Auth
3. **Onboarding data processed** → Automatically saved to database tables
4. **User redirected** → To main app with settings populated

### Settings Management

1. **Data fetched** → `useUserSettings()` gets complete user profile
2. **Updates made** → Individual hooks update specific setting categories
3. **Cache updated** → React Query automatically refreshes UI
4. **Toast feedback** → Success/error messages shown automatically

### Avatar Uploads

1. **Permission check** → Camera/gallery permissions requested
2. **Image picked** → From camera or photo library
3. **Upload to storage** → Supabase Storage with user-specific path
4. **Profile updated** → Avatar URL saved to user profile
5. **Old avatar cleaned** → Previous avatar file automatically deleted

## 🚀 Testing

### Test Onboarding Flow

1. Complete onboarding with test data
2. Sign up with email or Apple
3. Check Supabase tables for populated data
4. Verify user can access main app

### Test Settings

1. Navigate to settings page
2. Update fitness/nutrition goals
3. Upload/change avatar
4. Add weight entries
5. Verify data persists in database

### Test Avatar Upload

1. Try uploading from camera
2. Try uploading from gallery
3. Verify old avatar is replaced
4. Test avatar deletion

## 🔐 Security Features

- **Row Level Security (RLS)** - Users only see their own data
- **Storage policies** - Users can only upload/modify their own avatars
- **File validation** - Only images under 5MB allowed
- **Automatic cleanup** - Old avatar files removed when new ones uploaded

## 📊 Database Functions

### Main Functions Available

- `process_onboarding_data(user_id, onboarding_data)` - Save complete onboarding
- `get_user_complete_settings(user_id)` - Get all user settings
- `update_user_setting(user_id, type, data)` - Update specific settings
- `add_weight_entry(user_id, weight, units, note, date)` - Add weight entry
- `get_weight_history(user_id, limit)` - Get weight history

### Usage in App

The hooks automatically call these functions with proper error handling and cache invalidation.

## 🎯 Next Steps

1. **Run the SQL scripts** in your Supabase dashboard
2. **Install expo-file-system** if not already installed
3. **Test the signup flow** with onboarding data
4. **Implement settings pages** using the provided hooks
5. **Add avatar upload** to your settings/profile pages

The complete signup flow with settings and avatar upload is now ready to use! 🎉
