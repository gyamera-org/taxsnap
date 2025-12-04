import { useState, useEffect } from 'react';
import { View, Image, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/auth-provider';
import { useAccount, useUpdateAccount } from '@/lib/hooks/use-accounts';
import { toast } from 'sonner-native';
import { FormPage, FormField, SaveButton } from '@/components/ui/form-page';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Camera, User } from 'lucide-react-native';
import { supabase } from '@/lib/supabase/client';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: account, isLoading } = useAccount();
  const updateAccount = useUpdateAccount();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (account) {
      setName(account.name || '');
      setUsername(account.username || '');
      setAvatarUrl(account.avatar_url || null);
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      const nameChanged = name !== (account.name || '');
      const usernameChanged = username !== (account.username || '');
      const avatarChanged = avatarUrl !== (account.avatar_url || null);
      setHasChanges(nameChanged || usernameChanged || avatarChanged);
    }
  }, [name, username, avatarUrl, account]);

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      toast.error('Sorry, we need camera roll permissions to upload an avatar');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    if (!user) return;

    setUploadingAvatar(true);
    try {
      const fileName = `${user.id}-${Date.now()}.jpg`;
      const formData = new FormData();

      // @ts-ignore
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: fileName,
      });

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, formData, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      setAvatarUrl(publicUrl);
      toast.success('Avatar uploaded successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const removeAvatar = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAvatarUrl(null);
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    // Validate username
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error('Username can only contain letters, numbers, and underscores');
      return;
    }

    try {
      await updateAccount.mutateAsync({ name, username, avatar_url: avatarUrl });
      setHasChanges(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const email = account?.email || user?.email || '';

  return (
    <FormPage
      title={t('profile.title')}
      isLoading={isLoading}
      skeletonFields={3}
      rightAction={
        <SaveButton onPress={handleSave} disabled={!hasChanges} loading={updateAccount.isPending} />
      }
    >
      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={40} color="#9CA3AF" />
            </View>
          )}
          {uploadingAvatar && (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator color="#ffffff" />
            </View>
          )}
        </View>
        <View style={styles.avatarButtons}>
          <Pressable onPress={pickImage} style={styles.avatarButton} disabled={uploadingAvatar}>
            <Camera size={16} color="#0D9488" />
          </Pressable>
          {avatarUrl && (
            <Pressable onPress={removeAvatar} style={[styles.avatarButton, styles.removeButton]} disabled={uploadingAvatar}>
              <User size={16} color="#EF4444" />
            </Pressable>
          )}
        </View>
      </View>

      <FormField label={t('profile.name')} value={name} onChangeText={setName} placeholder={t('profile.namePlaceholder')} />

      <FormField
        label={t('profile.username')}
        value={username}
        onChangeText={(text) => setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
        placeholder={t('profile.usernamePlaceholder')}
      />

      <FormField label={t('profile.email')} value={email} editable={false} />
    </FormPage>
  );
}

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
});
