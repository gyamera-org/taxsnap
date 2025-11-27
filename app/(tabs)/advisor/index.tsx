import { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, Trash2, ChevronLeft } from 'lucide-react-native';
import { useChat, ChatMessage } from '@/lib/hooks/use-chat';
import { useDebtSummary } from '@/lib/hooks/use-debts';
import { useTabBar } from '@/context/tab-bar-provider';
import { AdvisorIcon } from '@/components/icons/tab-icons';
import * as Haptics from 'expo-haptics';

const QUICK_PROMPTS = [
  'Should I consolidate my debts?',
  'Which debt should I pay first?',
  'How can I pay off debt faster?',
  'What is the avalanche method?',
];

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <View
      style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.assistantBubble,
      ]}
    >
      {!isUser && (
        <View style={styles.assistantIcon}>
          <AdvisorIcon size={16} color="#10B981" />
        </View>
      )}
      <View
        style={[
          styles.messageContent,
          isUser ? styles.userContent : styles.assistantContent,
        ]}
      >
        <Text style={[styles.messageText, isUser && styles.userText]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

function EmptyState({ onPromptPress }: { onPromptPress: (prompt: string) => void }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <AdvisorIcon size={32} color="#10B981" />
      </View>
      <Text style={styles.emptyTitle}>Debt Advisor</Text>
      <Text style={styles.emptySubtitle}>
        Ask me anything about your debts, payment strategies, or financial decisions.
      </Text>
      <View style={styles.promptsContainer}>
        {QUICK_PROMPTS.map((prompt) => (
          <Pressable
            key={prompt}
            style={styles.promptButton}
            onPress={() => onPromptPress(prompt)}
          >
            <Text style={styles.promptText}>{prompt}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function AdvisorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState('');

  const { hideTabBar, showTabBar } = useTabBar();
  const {
    messages,
    isLoading,
    isSending,
    sendMessage,
    clearChat,
    isClearing,
    hasMore,
    isFetchingMore,
    fetchMore,
  } = useChat();
  const { data: summary } = useDebtSummary();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Hide tab bar when entering, show when leaving
  useEffect(() => {
    hideTabBar();
    return () => showTabBar();
  }, [hideTabBar, showTabBar]);

  // Scroll to bottom on initial load only
  useEffect(() => {
    if (messages.length > 0 && isInitialLoad) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
        setIsInitialLoad(false);
      }, 100);
    }
  }, [messages.length, isInitialLoad]);

  // Scroll to bottom when sending a new message
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showTabBar();
    router.back();
  };

  // Load more messages when scrolling near the top
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset } = event.nativeEvent;
      // When user scrolls near the top (within 100px), fetch more
      if (contentOffset.y < 100 && hasMore && !isFetchingMore) {
        fetchMore();
      }
    },
    [hasMore, isFetchingMore, fetchMore]
  );

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const text = inputText.trim();
    setInputText('');
    await sendMessage(text);
    scrollToBottom();
  };

  const handlePromptPress = (prompt: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputText(prompt);
  };

  const handleClearChat = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await clearChat();
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <MessageBubble message={item} />
  );

  const hasMessages = messages.length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={28} color="#FFFFFF" strokeWidth={2} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Advisor</Text>
          {summary && (
            <Text style={styles.headerSubtitle}>
              ${summary.total_balance.toLocaleString()} total debt
            </Text>
          )}
        </View>
        <View style={styles.headerRight}>
          {hasMessages && (
            <Pressable
              onPress={handleClearChat}
              disabled={isClearing}
              style={styles.clearButton}
            >
              {isClearing ? (
                <ActivityIndicator size="small" color="#6B7280" />
              ) : (
                <Trash2 size={20} color="#6B7280" />
              )}
            </Pressable>
          )}
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
          </View>
        ) : hasMessages ? (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={100}
            ListHeaderComponent={
              isFetchingMore ? (
                <View style={styles.loadMoreContainer}>
                  <ActivityIndicator size="small" color="#10B981" />
                </View>
              ) : null
            }
          />
        ) : (
          <EmptyState onPromptPress={handlePromptPress} />
        )}

        {/* Input */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.inputWrapper}>
            <LinearGradient
              colors={['#1a1a1f', '#141418']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.inputBorder} />
            <TextInput
              style={styles.input}
              placeholder="Ask about your debt..."
              placeholderTextColor="#6B7280"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              editable={!isSending}
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
              keyboardAppearance="dark"
            />
            <Pressable
              onPress={handleSend}
              disabled={!inputText.trim() || isSending}
              style={[
                styles.sendButton,
                (!inputText.trim() || isSending) && styles.sendButtonDisabled,
              ]}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Send size={20} color="#FFFFFF" />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
  },
  headerRight: {
    width: 44,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  clearButton: {
    padding: 8,
  },
  keyboardAvoid: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  loadMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  messageBubble: {
    flexDirection: 'row',
    marginVertical: 6,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
  },
  assistantIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  messageContent: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '100%',
  },
  userContent: {
    backgroundColor: '#10B981',
  },
  assistantContent: {
    backgroundColor: '#1a1a1f',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#E5E7EB',
  },
  userText: {
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  promptsContainer: {
    width: '100%',
    gap: 10,
  },
  promptButton: {
    backgroundColor: '#1a1a1f',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  promptText: {
    fontSize: 14,
    color: '#E5E7EB',
    textAlign: 'center',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    overflow: 'hidden',
    minHeight: 48,
  },
  inputBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    marginBottom: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#374151',
  },
});
