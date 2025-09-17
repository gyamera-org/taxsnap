import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Flame } from 'lucide-react-native';
import { useThemedStyles } from '@/lib/utils/theme';
import { RobotIcon } from '@/components/ui/robot-icon';
import { AIChatInterface } from '@/components/ui/ai-chat-interface';
import { useAIChat } from '@/lib/hooks/use-ai-chat';

type ChatContext = 'nutrition' | 'cycle' | 'exercise';

interface StreakDisplayWithChatProps {
  currentStreak: number;
  isLoading?: boolean;
  context: ChatContext;
  streakColor?: string;
  buttonColor?: string;
}

export function StreakDisplayWithChat({
  currentStreak,
  isLoading = false,
  context,
  streakColor = '#F59E0B', // orange default
  buttonColor = '#10b981', // green default
}: StreakDisplayWithChatProps) {
  const themed = useThemedStyles();
  const { isVisible, openChat, closeChat, handleSendMessage, config } = useAIChat(context);

  if (isLoading) {
    return (
      <View className="flex-row items-center">
        <View
          className={themed(
            'mr-3 bg-gray-200 rounded-xl px-3 py-2 w-16 h-8',
            'mr-3 bg-gray-600 rounded-xl px-3 py-2 w-16 h-8'
          )}
        />
        <TouchableOpacity
          onPress={openChat}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: themed(buttonColor, buttonColor + '/30') }}
        >
          <RobotIcon size={20} color="white" theme={context} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-row items-center">
      {/* Streak Display */}
      <View
        className={themed(
          'mr-3 rounded-xl px-3 py-2 flex-row items-center',
          'mr-3 rounded-xl px-3 py-2 flex-row items-center'
        )}
        style={{
          backgroundColor: themed(streakColor + '20', streakColor + '30'),
        }}
      >
        <Flame size={16} color={streakColor} />
        <Text className="font-semibold text-sm ml-1" style={{ color: streakColor }}>
          {currentStreak}
        </Text>
      </View>

      {/* AI Chat Button */}
      {/* <TouchableOpacity
        onPress={openChat}
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: buttonColor }}
      >
        <RobotIcon size={20} color="white" theme={context} />
      </TouchableOpacity> */}

      {/* <AIChatInterface
        visible={isVisible}
        onClose={closeChat}
        context={context}
        title={config.title}
        introMessages={config.introMessages}
        quickActions={config.quickActions}
        onSendMessage={handleSendMessage}
      /> */}
    </View>
  );
}
