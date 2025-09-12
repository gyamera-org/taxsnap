import { useState, useCallback } from 'react';

type ChatContext = 'nutrition' | 'cycle' | 'exercise';


interface QuickAction {
  id: string;
  text: string;
  emoji: string;
}

interface ChatConfig {
  title: string;
  introMessages: string[];
  placeholderText: string;
  quickActions: QuickAction[];
}

const getChatConfig = (context: ChatContext): ChatConfig => {
  switch (context) {
    case 'nutrition':
      return {
        title: 'Nutrition',
        introMessages: [
          "Hey! 👋 I want to log my food",
          "Next, you can write what you eat, or you can also send a picture 📸"
        ],
        placeholderText: "Tell me what you ate or ask anything...",
        quickActions: [
          { id: 'log-food', text: 'Write what I ate', emoji: '🍽️' },
          { id: 'photo', text: 'Take/upload photo', emoji: '📸' },
          { id: 'meal-plan', text: 'Plan meals', emoji: '📅' },
          { id: 'calories', text: 'Adjust goals', emoji: '⚖️' },
        ],
      };
    case 'cycle':
      return {
        title: 'Cycle',
        introMessages: [
          "Hi! 🌸 Ready to track your cycle?",
          "What would you like to log today?"
        ],
        placeholderText: "How are you feeling or what's happening...",
        quickActions: [
          { id: 'period', text: 'Log period', emoji: '🩸' },
          { id: 'mood', text: 'Track mood', emoji: '😊' },
          { id: 'symptoms', text: 'Log symptoms', emoji: '🤕' },
          { id: 'questions', text: 'Ask questions', emoji: '❓' },
        ],
      };
    case 'exercise':
      return {
        title: 'Exercise',
        introMessages: [
          "Hey! 💪 Ready for your workout?",
          "What would you like to do today?"
        ],
        placeholderText: "What workout or fitness goal are you thinking about...",
        quickActions: [
          { id: 'workout', text: 'Plan workout', emoji: '🏋️‍♀️' },
          { id: 'log-exercise', text: 'Log workout', emoji: '✅' },
          { id: 'weekly-plan', text: 'Weekly plan', emoji: '📅' },
          { id: 'goals', text: 'Set goals', emoji: '🎯' },
        ],
      };
    default:
      return {
        title: 'Assistant',
        introMessages: ["How can I help you today?"],
        placeholderText: "Ask me anything...",
        quickActions: [],
      };
  }
};

export function useAIChat(context: ChatContext) {
  const [isVisible, setIsVisible] = useState(false);
  const config = getChatConfig(context);

  const openChat = useCallback(() => {
    setIsVisible(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleSendMessage = useCallback(async (message: string, image?: string): Promise<string> => {
    // Simulate processing - in real implementation, this would call your backend for actionable items only
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Handle quick actions and controlled interactions
    const lowerMessage = message.toLowerCase();
    
    if (context === 'nutrition') {
      // Food logging interactions
      if (lowerMessage.includes('write what i ate') || lowerMessage.includes('log food')) {
        return "Great! 📝 What did you eat? (e.g., 'grilled chicken with rice' or 'pizza slice')";
      }
      if (lowerMessage.includes('take') || lowerMessage.includes('photo') || lowerMessage.includes('picture')) {
        return "Perfect! 📸 Take a photo of your food and I'll estimate the calories and nutrients";
      }
      if (lowerMessage.includes('plan meals')) {
        return "Let's plan! 🗓️ What type of meals are you looking for? (breakfast, lunch, dinner, or full day)";
      }
      if (lowerMessage.includes('adjust goals')) {
        return "Got it! ⚖️ Current goal: 2000 calories. Want to increase, decrease, or adjust macros?";
      }
      // For actual food entries, this would call AI
      if (lowerMessage.includes('chicken') || lowerMessage.includes('rice') || lowerMessage.includes('pizza') || image) {
        return "Nice! 🍽️ I've logged that for you. Estimated: 450 calories, 35g protein, 40g carbs, 12g fat. Anything else?";
      }
      return "What would you like to do? 😊";
    }
    
    if (context === 'cycle') {
      if (lowerMessage.includes('log period')) {
        return "When did it start? 📅 (Today, yesterday, or specific date)";
      }
      if (lowerMessage.includes('track mood')) {
        return "How are you feeling? 😊 (Happy, sad, irritated, energetic, tired, etc.)";
      }
      if (lowerMessage.includes('log symptoms')) {
        return "What symptoms? 🤕 (Cramps, headache, bloating, acne, etc.)";
      }
      if (lowerMessage.includes('today') || lowerMessage.includes('yesterday')) {
        return "Logged! 📝 Your period started ${message.includes('today') ? 'today' : 'yesterday'}. Flow level?";
      }
      if (lowerMessage.includes('happy') || lowerMessage.includes('sad') || lowerMessage.includes('tired')) {
        return "Got it! 💭 Mood logged. Your patterns help predict how you'll feel next cycle!";
      }
      return "What would you like to track? 🌸";
    }
    
    if (context === 'exercise') {
      if (lowerMessage.includes('plan workout')) {
        return "What type? 💪 (Strength, cardio, yoga, full body, specific muscle group)";
      }
      if (lowerMessage.includes('log workout')) {
        return "Awesome! 🔥 What exercises did you do? (e.g., '30 min run' or 'bench press, squats')";
      }
      if (lowerMessage.includes('weekly plan')) {
        return "Let's build it! 📅 How many days per week? (3, 4, 5, or 6 days)";
      }
      if (lowerMessage.includes('set goals')) {
        return "What's your goal? 🎯 (Lose weight, build muscle, get stronger, improve endurance)";
      }
      // For actual workout logging
      if (lowerMessage.includes('run') || lowerMessage.includes('bench') || lowerMessage.includes('squats')) {
        return "Great workout! 💪 Logged: ${message}. Estimated 300 calories burned. How did it feel?";
      }
      if (lowerMessage.includes('strength') || lowerMessage.includes('cardio')) {
        return "Perfect! Here's your ${lowerMessage.includes('strength') ? 'strength' : 'cardio'} plan: [Generated workout plan]. Ready to start?";
      }
      return "What's the plan today? 🚀";
    }

    return "How can I help? ✨";
  }, [context]);

  return {
    isVisible,
    openChat,
    closeChat,
    handleSendMessage,
    config,
  };
}