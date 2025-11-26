import { useState } from 'react';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import { FormPage, FormField, SaveButton } from '@/components/ui/form-page';

export default function FeedbackScreen() {
  const router = useRouter();
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    try {
      // TODO: Send feedback to backend
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Thank you for your feedback!');
      router.back();
    } catch (error) {
      toast.error('Failed to send feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormPage
      title="Give Feedback"
      rightAction={
        <SaveButton
          onPress={handleSubmit}
          disabled={!feedback.trim()}
          loading={isSubmitting}
          label="Send"
        />
      }
    >
      <Text className="text-gray-400 text-base -mt-2 mb-2">
        We'd love to hear your thoughts on how we can improve.
      </Text>

      <FormField
        label="Your Feedback"
        value={feedback}
        onChangeText={setFeedback}
        placeholder="Share your feedback..."
        multiline
        numberOfLines={4}
      />
    </FormPage>
  );
}
