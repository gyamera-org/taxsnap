import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react-native';
import { supabase } from '@/lib/supabase/client';

interface SetupCheck {
  name: string;
  status: 'checking' | 'success' | 'error';
  error?: string;
}

export const SetupVerification = () => {
  const [checks, setChecks] = useState<SetupCheck[]>([
    { name: 'Database Tables', status: 'checking' },
    { name: 'Functions', status: 'checking' },
    { name: 'Storage Bucket', status: 'checking' },
    { name: 'User Profile', status: 'checking' },
  ]);

  const runChecks = async () => {
    setChecks((prev) => prev.map((check) => ({ ...check, status: 'checking' })));

    // Check 1: Database Tables
    try {
      const { data, error } = await supabase.from('user_profiles').select('id').limit(1);

      setChecks((prev) =>
        prev.map((check) =>
          check.name === 'Database Tables'
            ? { ...check, status: error ? 'error' : 'success', error: error?.message }
            : check
        )
      );
    } catch (err) {
      setChecks((prev) =>
        prev.map((check) =>
          check.name === 'Database Tables'
            ? { ...check, status: 'error', error: 'Table access failed' }
            : check
        )
      );
    }

    // Check 2: Functions
    try {
      const { data, error } = await supabase.rpc('get_user_complete_settings', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
      });

      setChecks((prev) =>
        prev.map((check) =>
          check.name === 'Functions'
            ? { ...check, status: error ? 'error' : 'success', error: error?.message }
            : check
        )
      );
    } catch (err) {
      setChecks((prev) =>
        prev.map((check) =>
          check.name === 'Functions'
            ? { ...check, status: 'error', error: 'Function call failed' }
            : check
        )
      );
    }

    // Check 3: Storage Bucket
    try {
      const { data, error } = await supabase.storage.from('avatars').list('', { limit: 1 });

      setChecks((prev) =>
        prev.map((check) =>
          check.name === 'Storage Bucket'
            ? { ...check, status: error ? 'error' : 'success', error: error?.message }
            : check
        )
      );
    } catch (err) {
      setChecks((prev) =>
        prev.map((check) =>
          check.name === 'Storage Bucket'
            ? { ...check, status: 'error', error: 'Bucket access failed' }
            : check
        )
      );
    }

    // Check 4: User Profile Data
    try {
      const user = await supabase.auth.getUser();
      if (user.data.user) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.data.user.id)
          .single();

        setChecks((prev) =>
          prev.map((check) =>
            check.name === 'User Profile'
              ? {
                  ...check,
                  status: error && error.code !== 'PGRST116' ? 'error' : 'success',
                  error: error && error.code !== 'PGRST116' ? error.message : undefined,
                }
              : check
          )
        );
      }
    } catch (err) {
      setChecks((prev) =>
        prev.map((check) =>
          check.name === 'User Profile'
            ? { ...check, status: 'error', error: 'Profile check failed' }
            : check
        )
      );
    }
  };

  useEffect(() => {
    runChecks();
  }, []);

  const getStatusIcon = (status: SetupCheck['status']) => {
    switch (status) {
      case 'checking':
        return <RefreshCw size={20} color="#6B7280" className="animate-spin" />;
      case 'success':
        return <CheckCircle size={20} color="#10B981" />;
      case 'error':
        return <XCircle size={20} color="#EF4444" />;
    }
  };

  const allSuccess = checks.every((check) => check.status === 'success');
  const hasErrors = checks.some((check) => check.status === 'error');

  return (
    <View className="bg-white mx-4 rounded-2xl shadow p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold">Supabase Setup Status</Text>
        <TouchableOpacity onPress={runChecks} className="bg-gray-100 px-3 py-1 rounded-lg">
          <Text className="text-gray-600 text-sm">Refresh</Text>
        </TouchableOpacity>
      </View>

      {checks.map((check, index) => (
        <View key={check.name} className="flex-row items-center py-2">
          {getStatusIcon(check.status)}
          <View className="ml-3 flex-1">
            <Text className="font-medium">{check.name}</Text>
            {check.error && <Text className="text-red-500 text-sm">{check.error}</Text>}
          </View>
        </View>
      ))}

      <View
        className="mt-4 p-3 rounded-lg"
        style={{
          backgroundColor: allSuccess ? '#F0FDF4' : hasErrors ? '#FEF2F2' : '#F9FAFB',
        }}
      >
        <Text
          className="font-medium"
          style={{
            color: allSuccess ? '#166534' : hasErrors ? '#DC2626' : '#374151',
          }}
        >
          {allSuccess
            ? '✅ All systems working correctly!'
            : hasErrors
              ? '❌ Some issues detected - check SQL scripts'
              : '⏳ Checking setup...'}
        </Text>

        {hasErrors && (
          <Text className="text-sm mt-1" style={{ color: '#DC2626' }}>
            Run the SQL scripts in your Supabase dashboard to fix these issues.
          </Text>
        )}
      </View>
    </View>
  );
};
