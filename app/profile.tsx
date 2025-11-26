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
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (account?.name) {
      setName(account.name);
    }
  }, [account?.name]);

  useEffect(() => {
    if (account?.name) {
      setHasChanges(name !== account.name);
    }
  }, [name, account?.name]);

  const handleSave = async () => {
    if (!hasChanges) return;

    try {
      await updateAccount.mutateAsync({ name });
      toast.success('Profile updated successfully');
      setHasChanges(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const email = user?.email || '';
  const username = email.split('@')[0] || '';

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
        label="Username"
        value={username}
        editable={false}
      />

      <FormField
        label="Name"
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
      />

      <FormField
        label="Email"
        value={email}
        editable={false}
      />
    </FormPage>
  );
}
