import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Flame } from 'lucide-react-native';
import { useThemedStyles } from '@/lib/utils/theme';
import { RobotIcon } from '@/components/ui/robot-icon';
import { AIChatInterface } from '@/components/ui/ai-chat-interface';
import { useAIChat } from '@/lib/hooks/use-ai-chat';

interface StreakDisplayProps {
  currentStreak: number;
  isLoading?: boolean;
}

export default function StreakDisplay({
  currentStreak,
  isLoading = false,
}: StreakDisplayProps) {
  const themed = useThemedStyles();
  const { isVisible, openChat, closeChat, handleSendMessage, config } = useAIChat('nutrition');
  
  if (isLoading) {
    // Show skeleton for streak
    return (
      <View className="flex-row items-center">
        <View className={themed("mr-3 bg-gray-200 rounded-xl px-3 py-2 w-16 h-8", "mr-3 bg-gray-600 rounded-xl px-3 py-2 w-16 h-8")} />
        <TouchableOpacity
          onPress={openChat}
          className="bg-green-500 w-10 h-10 rounded-full items-center justify-center"
        >
          <RobotIcon size={20} color="white" theme="nutrition" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-row items-center">
      {/* Streak Display */}
      <View className={themed("mr-3 bg-orange-100 rounded-xl px-3 py-2 flex-row items-center", "mr-3 bg-orange-900/30 rounded-xl px-3 py-2 flex-row items-center")}>
        <Flame size={16} color="#F59E0B" />
        <Text className={themed("text-orange-700 font-semibold text-sm ml-1", "text-orange-400 font-semibold text-sm ml-1")}>{currentStreak}</Text>
      </View>

      {/* Add Meal Button */}
      <TouchableOpacity
        onPress={openChat}
        className="bg-green-500 w-10 h-10 rounded-full items-center justify-center"
      >
        <RobotIcon size={20} color="white" theme="nutrition" />
      </TouchableOpacity>
      
      <AIChatInterface
        visible={isVisible}
        onClose={closeChat}
        context="nutrition"
        title={config.title}
        introMessages={config.introMessages}
        quickActions={config.quickActions}
        onSendMessage={handleSendMessage}
      />
    </View>
  );
}
