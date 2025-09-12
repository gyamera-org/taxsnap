import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { X, Send, Camera, Mic, Image as ImageIcon } from 'lucide-react-native';
import { RobotIcon } from '@/components/ui/robot-icon';
import { useThemedStyles } from '@/lib/utils/theme';
import { useTheme } from '@/context/theme-provider';
import * as ImagePicker from 'expo-image-picker';

type ChatMessage = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  image?: string;
};

type ChatContext = 'nutrition' | 'cycle' | 'exercise';

interface QuickAction {
  id: string;
  text: string;
  emoji: string;
}

interface AIChatInterfaceProps {
  visible: boolean;
  onClose: () => void;
  context: ChatContext;
  title: string;
  introMessages?: string[];
  quickActions?: QuickAction[];
  onSendMessage?: (message: string, image?: string) => Promise<string>;
}

export function AIChatInterface({
  visible,
  onClose,
  context,
  title,
  introMessages = [],
  quickActions = [],
  onSendMessage,
}: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const themed = useThemedStyles();
  const { isDark } = useTheme();

  // Initialize with intro messages
  useEffect(() => {
    if (visible && introMessages.length > 0) {
      const introMsgs: ChatMessage[] = introMessages.map((text, index) => ({
        id: `intro-${index}`,
        text,
        isUser: false,
        timestamp: new Date(),
      }));
      setMessages(introMsgs);
    }
  }, [visible, introMessages]);

  const getContextColor = () => {
    switch (context) {
      case 'nutrition':
        return '#10b981';
      case 'cycle':
        return '#f59e0b';
      case 'exercise':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !selectedImage) || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
      image: selectedImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await onSendMessage?.(inputText.trim(), selectedImage || undefined);

      if (response) {
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          text: response,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        text: "Sorry, I couldn't process your request right now. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const contextColor = getContextColor();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView className={themed('flex-1 bg-white', 'flex-1 bg-black')}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'height' : 'height'}
          keyboardVerticalOffset={0}
        >
          <View className={themed('flex-1 bg-white', 'flex-1 bg-black')}>
            {/* Modern Header */}
            <View
              className={themed(
                'px-6 py-4 bg-white/95 backdrop-blur-md',
                'px-6 py-4 bg-black/95 backdrop-blur-md'
              )}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: contextColor + '20' }}
                  >
                    <RobotIcon size={20} theme={context} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={themed(
                        'text-lg font-bold text-gray-900',
                        'text-lg font-bold text-white'
                      )}
                    >
                      {title}
                    </Text>
                    <Text className={themed('text-sm text-gray-500', 'text-sm text-gray-400')}>
                      AI Assistant
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  className={themed(
                    'w-8 h-8 rounded-full items-center justify-center bg-gray-100',
                    'w-8 h-8 rounded-full items-center justify-center bg-gray-800'
                  )}
                >
                  <X size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Messages */}
            <ScrollView
              ref={scrollViewRef}
              className="flex-1 px-6"
              contentContainerStyle={{ paddingVertical: 20, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((message) => (
                <View
                  key={message.id}
                  className={`mb-6 ${message.isUser ? 'items-end' : 'items-start'}`}
                >
                  <View
                    className={`max-w-[85%] px-4 py-3 ${
                      message.isUser
                        ? 'bg-blue-500 rounded-3xl rounded-br-lg shadow-lg'
                        : themed(
                            'bg-gray-50 rounded-3xl rounded-bl-lg shadow-sm',
                            'bg-gray-800 rounded-3xl rounded-bl-lg shadow-lg'
                          )
                    }`}
                  >
                    {message.image && (
                      <View className="mb-2">
                        <Text className="text-xs text-gray-500 mb-1">Image attached</Text>
                      </View>
                    )}
                    <Text
                      className={`text-base leading-relaxed ${
                        message.isUser ? 'text-white' : themed('text-gray-800', 'text-gray-100')
                      }`}
                    >
                      {message.text}
                    </Text>
                  </View>
                </View>
              ))}

              {isLoading && (
                <View className="items-start mb-6">
                  <View
                    className={themed(
                      'bg-gray-50 rounded-3xl rounded-bl-lg px-4 py-3 shadow-sm',
                      'bg-gray-800 rounded-3xl rounded-bl-lg px-4 py-3 shadow-lg'
                    )}
                  >
                    <Text className={themed('text-gray-600 text-base', 'text-gray-300 text-base')}>
                      Thinking... 🤔
                    </Text>
                  </View>
                </View>
              )}

              {/* Quick Actions */}
              {quickActions.length > 0 && messages.length <= introMessages.length && (
                <View className="mb-6">
                  <Text
                    className={themed(
                      'text-sm font-medium text-gray-600 mb-3',
                      'text-sm font-medium text-gray-400 mb-3'
                    )}
                  >
                    Suggestions
                  </Text>
                  <View className="flex-row flex-wrap gap-3">
                    {quickActions.map((action) => (
                      <TouchableOpacity
                        key={action.id}
                        onPress={() => {
                          setInputText(action.text);
                          setTimeout(() => handleSendMessage(), 50);
                        }}
                        className={themed(
                          'bg-white border border-gray-200 rounded-full px-5 py-3 shadow-sm',
                          'bg-gray-900 border border-gray-800 rounded-full px-5 py-3 shadow-lg'
                        )}
                      >
                        <Text
                          className={themed(
                            'text-sm font-medium text-gray-800',
                            'text-sm font-medium text-gray-300'
                          )}
                        >
                          {action.emoji} {action.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Image Preview */}
            {selectedImage && (
              <View className="px-6 py-3">
                <View
                  className={themed(
                    'flex-row items-center justify-between bg-blue-50 rounded-2xl p-3',
                    'flex-row items-center justify-between bg-blue-900/20 rounded-2xl p-3'
                  )}
                >
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
                      <ImageIcon size={16} color="#3B82F6" />
                    </View>
                    <Text
                      className={themed(
                        'text-sm font-medium text-blue-800',
                        'text-sm font-medium text-blue-200'
                      )}
                    >
                      Image ready to send
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedImage(null)}
                    className="w-6 h-6 rounded-full bg-blue-200 items-center justify-center"
                  >
                    <X size={12} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Input Area */}
            <View className="px-6 py-4">
              <View
                className={themed(
                  'flex-row items-end bg-gray-50 rounded-3xl px-5 py-3',
                  'flex-row items-end bg-gray-900 rounded-3xl px-5 py-3'
                )}
              >
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder={`Ask about ${context}...`}
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  multiline
                  className={themed(
                    'flex-1 text-base leading-relaxed text-gray-900 py-1',
                    'flex-1 text-base leading-relaxed text-white py-1'
                  )}
                  style={{ maxHeight: 100, minHeight: 24 }}
                />
                <View className="flex-row items-center ml-3 space-x-2">
                  <TouchableOpacity onPress={handleImagePicker} className="p-2">
                    <ImageIcon size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCamera} className="p-2">
                    <Camera size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSendMessage}
                    disabled={(!inputText.trim() && !selectedImage) || isLoading}
                    className="w-8 h-8 rounded-full items-center justify-center ml-1"
                    style={{
                      backgroundColor:
                        (inputText.trim() || selectedImage) && !isLoading
                          ? contextColor
                          : isDark
                          ? '#4B5563'
                          : '#D1D5DB',
                    }}
                  >
                    <Send size={14} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
