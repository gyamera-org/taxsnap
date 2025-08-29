import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from './text';
import { Button } from './button';
import { X, Send } from 'lucide-react-native';
import { SafeAreaView } from 'react-native';
import { useAIAssistant } from '@/lib/hooks/use-ai-assistant';

// AI Assistant Icon Component (React Native compatible)
const AIAssistantIcon = ({ size = 24, color = '#EC4899' }: { size?: number; color?: string }) => {
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: size / 2,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* Face */}
      <View
        style={{
          width: size * 0.7,
          height: size * 0.7,
          backgroundColor: 'white',
          borderRadius: (size * 0.7) / 2,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Eyes */}
        <View style={{ flexDirection: 'row', marginBottom: size * 0.05 }}>
          <View
            style={{
              width: size * 0.08,
              height: size * 0.08,
              backgroundColor: color,
              borderRadius: size * 0.04,
              marginHorizontal: size * 0.05,
            }}
          />
          <View
            style={{
              width: size * 0.08,
              height: size * 0.08,
              backgroundColor: color,
              borderRadius: size * 0.04,
              marginHorizontal: size * 0.05,
            }}
          />
        </View>

        {/* Smile */}
        <View
          style={{
            width: size * 0.25,
            height: size * 0.12,
            borderBottomWidth: 2,
            borderBottomColor: color,
            borderRadius: size * 0.15,
            marginTop: size * 0.02,
          }}
        />
      </View>

      {/* Sparkle effect */}
      <View
        style={{
          position: 'absolute',
          top: -2,
          right: -2,
          width: 8,
          height: 8,
          backgroundColor: '#FFD700',
          borderRadius: 4,
        }}
      />
    </View>
  );
};

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIAssistantProps {
  context: 'cycle' | 'nutrition' | 'fitness' | 'weight';
  size?: number;
}

const contextConfig = {
  cycle: {
    title: 'Cycle Assistant',
    placeholder: 'Ask me about periods, symptoms, fertility...',
    welcome:
      "Hi! I'm here to help with all your cycle-related questions. Ask me about periods, symptoms, fertility windows, or anything else!",
    color: '#EC4899',
  },
  nutrition: {
    title: 'Nutrition Assistant',
    placeholder: 'Ask me about nutrition, meal planning...',
    welcome:
      "Hi! I'm your nutrition assistant. Ask me about healthy eating, meal planning, or nutrition for your cycle phases!",
    color: '#10B981',
  },
  fitness: {
    title: 'Fitness Assistant',
    placeholder: 'Ask me about workouts, exercises...',
    welcome:
      "Hi! I'm your fitness assistant. Ask me about workouts, exercises that match your cycle, or fitness goals!",
    color: '#A856F6',
  },
  weight: {
    title: 'Weight Assistant',
    placeholder: 'Ask me about weight management...',
    welcome:
      "Hi! I'm your weight management assistant. Ask me about healthy weight loss, tracking, or weight-related questions!",
    color: '#8B5CF6',
  },
};

// Simple storage for chat history (in a real app, this would be in context/database)
const chatStorage: { [key: string]: Message[] } = {};

export const AIAssistant = ({ context, size = 24 }: AIAssistantProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const aiAssistant = useAIAssistant();

  const config = contextConfig[context];
  const storageKey = `chat_${context}`;

  // Load chat history on mount
  useEffect(() => {
    const savedMessages = chatStorage[storageKey] || [];

    // Check if chat is older than 24 hours
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Filter out messages older than 24 hours
    const recentMessages = savedMessages.filter((msg) => new Date(msg.timestamp) > dayAgo);

    if (recentMessages.length === 0) {
      // Add welcome message if no recent messages
      const welcomeMessage: Message = {
        id: 'welcome',
        text: config.welcome,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      chatStorage[storageKey] = [welcomeMessage];
    } else {
      setMessages(recentMessages);
      chatStorage[storageKey] = recentMessages;
    }
  }, [storageKey, config.welcome]);

  // Save messages to storage
  const saveMessages = (newMessages: Message[]) => {
    chatStorage[storageKey] = newMessages;
    setMessages(newMessages);
  };

  // Fallback response for when AI fails
  const getFallbackResponse = (userMessage: string): string => {
    const responses = {
      cycle: [
        "I'm having connection issues right now! Try asking again in a moment 💜",
        "Oops, can't connect to give you a full answer. Every woman's cycle is unique though!",
      ],
      nutrition: [
        'Connection hiccup! Quick tip: focus on whole foods and stay hydrated 🥗',
        "I'm having trouble connecting, but balanced meals with protein, healthy fats, and carbs are always good!",
      ],
      fitness: [
        "Can't connect right now! Remember to start slowly and listen to your body 💪",
        'Connection issue! Key tip: consistency beats intensity every time.',
      ],
      weight: [
        'Having connection troubles! Focus on sustainable habits, not quick fixes 💖',
        "Can't connect fully, but remember: it's about healthy lifestyle, not restrictions!",
      ],
    };

    const contextResponses = responses[context];
    return contextResponses[Math.floor(Math.random() * contextResponses.length)];
  };

  const sendMessage = async () => {
    if (!inputText.trim() || aiAssistant.isPending) return;

    const userInputText = inputText.trim();

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userInputText,
      isUser: true,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    saveMessages(updatedMessages);
    setInputText('');
    setIsTyping(true);

    try {
      // Call actual AI assistant
      const result = await aiAssistant.mutateAsync({
        message: userInputText,
        context: context as 'fitness' | 'general',
      });

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: result.response,
        isUser: false,
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, aiResponse];
      saveMessages(finalMessages);
      setIsTyping(false);

      // Auto scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('AI Assistant error:', error);

      // Show fallback response
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getFallbackResponse(userInputText),
        isUser: false,
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, fallbackResponse];
      saveMessages(finalMessages);
      setIsTyping(false);

      // Auto scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <>
      {/* AI Assistant Button */}
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        style={{
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <AIAssistantIcon size={size} color={config.color} />
      </TouchableOpacity>

      {/* Chat Modal */}
      <Modal visible={isVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
          {/* Header */}
          <View style={{ backgroundColor: config.color }} className="px-4 py-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  className="rounded-full p-2 mr-3"
                >
                  <AIAssistantIcon size={20} color="white" />
                </View>
                <View>
                  <Text className="text-xl font-bold text-white">{config.title}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.8)' }} className="text-sm">
                    Your personal health assistant
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                className="rounded-full p-2"
              >
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Chat Messages */}
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView
              ref={scrollViewRef}
              className="flex-1 px-4 py-4"
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((message) => (
                <View
                  key={message.id}
                  className={`mb-4 ${message.isUser ? 'items-end' : 'items-start'}`}
                >
                  <View
                    style={{
                      backgroundColor: message.isUser ? config.color : 'white',
                      maxWidth: '80%',
                      borderRadius: 16,
                      padding: 12,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2,
                    }}
                  >
                    <Text
                      className={`text-sm leading-5 ${
                        message.isUser ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {message.text}
                    </Text>
                    <Text
                      className={`text-xs mt-1 ${
                        message.isUser ? 'text-white/70' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </Text>
                  </View>
                </View>
              ))}

              {/* Typing Indicator */}
              {(isTyping || aiAssistant.isPending) && (
                <View className="items-start mb-4">
                  <View
                    style={{
                      backgroundColor: 'white',
                      borderRadius: 16,
                      padding: 12,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2,
                    }}
                  >
                    <Text className="text-gray-600 text-sm">AI is typing...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input Area */}
            <View
              style={{ backgroundColor: 'white' }}
              className="px-4 py-3 border-t border-gray-200"
            >
              <View className="flex-row items-center">
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder={config.placeholder}
                  placeholderTextColor="#9CA3AF"
                  style={{
                    flex: 1,
                    backgroundColor: '#F3F4F6',
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    marginRight: 12,
                    fontSize: 16,
                  }}
                  multiline
                  maxLength={500}
                  onSubmitEditing={sendMessage}
                  returnKeyType="send"
                />
                <TouchableOpacity
                  onPress={sendMessage}
                  disabled={!inputText.trim() || isTyping || aiAssistant.isPending}
                  style={{
                    backgroundColor:
                      inputText.trim() && !aiAssistant.isPending ? config.color : '#E5E7EB',
                    borderRadius: 20,
                    padding: 12,
                  }}
                >
                  <Send size={20} color={inputText.trim() ? 'white' : '#9CA3AF'} />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default AIAssistant;
