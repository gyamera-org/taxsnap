import { useState } from 'react';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import { FormPage, FormField, SaveButton } from '@/components/ui/form-page';
import { supabase } from '@/lib/supabase/client';
import { useTranslation } from 'react-i18next';

export default function FeedbackScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t('feedback.signInRequired'));
        return;
      }

      const { error } = await supabase
        .from('feedback')
        .insert({
          account_id: user.id,
          feedback: feedback.trim(),
        });

      if (error) throw error;

      toast.success(t('feedback.success'));
      router.back();
    } catch (error) {
      toast.error(t('feedback.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormPage
      title={t('feedback.title')}
      rightAction={
        <SaveButton
          onPress={handleSubmit}
          disabled={!feedback.trim()}
          loading={isSubmitting}
          label={t('feedback.submit')}
        />
      }
    >
      <Text className="text-gray-500 text-base -mt-2 mb-2">
        {t('feedback.subtitle')}
      </Text>

      <FormField
        label={t('feedback.label')}
        value={feedback}
        onChangeText={setFeedback}
        placeholder={t('feedback.placeholder')}
        multiline
        numberOfLines={4}
      />
    </FormPage>
  );
}
