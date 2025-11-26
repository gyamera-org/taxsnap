import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-provider';
import { useAccount, useUpdateAccount } from '@/lib/hooks/use-accounts';
import { toast } from 'sonner-native';
import { FormPage, FormField, SaveButton } from '@/components/ui/form-page';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { data: account, isLoading } = useAccount();
  const updateAccount = useUpdateAccount();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (account) {
      setName(account.name || '');
      setUsername(account.username || '');
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      const nameChanged = name !== (account.name || '');
      const usernameChanged = username !== (account.username || '');
      setHasChanges(nameChanged || usernameChanged);
    }
  }, [name, username, account]);

  const handleSave = async () => {
    if (!hasChanges) return;

    // Validate username
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error('Username can only contain letters, numbers, and underscores');
      return;
    }

    try {
      await updateAccount.mutateAsync({ name, username });
      toast.success('Profile updated successfully');
      setHasChanges(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const email = account?.email || user?.email || '';

  return (
    <FormPage
      title="Profile"
      isLoading={isLoading}
      skeletonFields={3}
      rightAction={
        <SaveButton
          onPress={handleSave}
          disabled={!hasChanges}
          loading={updateAccount.isPending}
        />
      }
    >
      <FormField
        label="Name"
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
      />

      <FormField
        label="Username"
        value={username}
        onChangeText={(text) => setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
        placeholder="Enter username"
      />

      <FormField
        label="Email"
        value={email}
        editable={false}
      />
    </FormPage>
  );
}
