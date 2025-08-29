import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { handleError } from './utils';

export interface AIAssistantRequest {
  message: string;
  context?: 'fitness' | 'general';
}

export interface AIAssistantResponse {
  response: string;
  context: string;
}

/**
 * Hook to send messages to AI fitness assistant
 */
export function useAIAssistant() {
  return useMutation({
    mutationFn: async ({ message, context = 'fitness' }: AIAssistantRequest) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('ai-fitness-assistant', {
        body: {
          message,
          context,
        },
      });

      if (error) throw error;
      return data as AIAssistantResponse;
    },
    onError: (err: any) => handleError(err, 'Failed to get AI response'),
  });
}
