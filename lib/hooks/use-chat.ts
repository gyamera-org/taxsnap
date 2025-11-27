import { useEffect, useRef } from 'react';
import { useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { handleError } from './utils';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/auth-provider';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  account_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const PAGE_SIZE = 10;

/**
 * Fetch chat messages with pagination (newest first, then reverse for display)
 */
export function useChatMessages() {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: queryKeys.chat.messages(),
    queryFn: async ({ pageParam }) => {
      if (!user) return { messages: [], nextCursor: null };

      let query = supabase
        .from('chat_messages')
        .select('*')
        .eq('account_id', user.id)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      // If we have a cursor, fetch older messages
      if (pageParam) {
        query = query.lt('created_at', pageParam);
      }

      const { data, error } = await query;

      if (error) throw new Error(error.message);

      const messages = (data as ChatMessage[]) || [];
      const nextCursor = messages.length === PAGE_SIZE ? messages[messages.length - 1]?.created_at : null;

      return {
        messages,
        nextCursor,
      };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!user,
  });
}

/**
 * Hook for realtime chat subscription
 */
export function useChatRealtime() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user) return;

    // Subscribe to realtime changes
    const channel = supabase
      .channel('chat_messages_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `account_id=eq.${user.id}`,
        },
        (payload) => {
          // Add new message to the first page (most recent)
          queryClient.setQueryData(
            queryKeys.chat.messages(),
            (old: any) => {
              if (!old) return old;
              const newMessage = payload.new as ChatMessage;
              // Check if message already exists in first page
              const firstPageMessages = old.pages[0]?.messages || [];
              const exists = firstPageMessages.some((msg: ChatMessage) => msg.id === newMessage.id);
              if (exists) return old;

              // Add to the beginning of the first page (newest messages)
              return {
                ...old,
                pages: [
                  {
                    ...old.pages[0],
                    messages: [newMessage, ...firstPageMessages],
                  },
                  ...old.pages.slice(1),
                ],
              };
            }
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user, queryClient]);
}

/**
 * Send a message and get AI response
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Not authenticated');

      // First, insert the user message
      const { data: userMessage, error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          account_id: user.id,
          role: 'user',
          content,
        })
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);

      // Call the edge function for AI response
      const { data, error } = await supabase.functions.invoke('chat-advisor', {
        body: { message: content },
      });

      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error || 'Failed to get response');

      return data;
    },
    onError: (err: any) => handleError(err, 'Failed to send message'),
  });
}

/**
 * Clear chat history
 */
export function useClearChat() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('account_id', user.id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.chat.messages(), {
        pages: [{ messages: [], nextCursor: null }],
        pageParams: [null],
      });
    },
    onError: (err: any) => handleError(err, 'Failed to clear chat'),
  });
}

/**
 * Combined hook for chat functionality
 */
export function useChat() {
  const messagesQuery = useChatMessages();
  const sendMessage = useSendMessage();
  const clearChat = useClearChat();

  // Set up realtime subscription
  useChatRealtime();

  // Flatten pages and reverse to show oldest first (chronological order)
  const messages = messagesQuery.data?.pages
    .flatMap((page) => page.messages)
    .reverse() ?? [];

  return {
    messages,
    isLoading: messagesQuery.isLoading,
    isSending: sendMessage.isPending,
    sendMessage: sendMessage.mutateAsync,
    clearChat: clearChat.mutateAsync,
    isClearing: clearChat.isPending,
    // Pagination
    hasMore: messagesQuery.hasNextPage,
    isFetchingMore: messagesQuery.isFetchingNextPage,
    fetchMore: messagesQuery.fetchNextPage,
  };
}
