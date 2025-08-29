import { QuestionnaireStep } from '@/components/ui';

export const fitnessQuestionnaireSteps: QuestionnaireStep[] = [
  {
    key: 'goal',
    title: "What's your fitness goal?",
    subtitle: 'Choose your primary focus area.',
    options: [
      {
        value: 'lose_weight',
        label: 'Lose Weight',
        description: 'Focus on cardio and calorie burn',
        icon: '🔥',
      },
      {
        value: 'build_muscle',
        label: 'Build Muscle',
        description: 'Strength training and muscle growth',
        icon: '💪',
      },
      {
        value: 'improve_endurance',
        label: 'Improve Endurance',
        description: 'Cardiovascular fitness and stamina',
        icon: '🏃',
      },
      {
        value: 'general_fitness',
        label: 'General Fitness',
        description: 'Overall health and wellness',
        icon: '⚡',
      },
    ],
  },
  {
    key: 'frequency',
    title: 'How many workouts do you do per week?',
    subtitle: 'This will be used to calibrate your custom plan.',
    options: [
      { value: '1-2', label: '1-2 times', description: 'Just getting started' },
      { value: '3-4', label: '3-4 times', description: 'Regular routine' },
      { value: '5-6', label: '5-6 times', description: 'Very committed' },
      { value: '7+', label: '7+ times', description: 'Daily workouts' },
    ],
  },
  {
    key: 'experience',
    title: "What's your experience level?",
    subtitle: "We'll adjust intensity accordingly.",
    options: [
      { value: 'beginner', label: 'Beginner', description: 'New to working out' },
      { value: 'intermediate', label: 'Intermediate', description: 'Some gym experience' },
      { value: 'advanced', label: 'Advanced', description: 'Experienced athlete' },
    ],
  },
];

// Helper functions to format display values
export const formatFitnessGoal = (goal: string) => {
  const goalMap: Record<string, string> = {
    lose_weight: 'Lose Weight',
    build_muscle: 'Build Muscle',
    improve_endurance: 'Improve Endurance',
    general_fitness: 'General Fitness',
  };
  return goalMap[goal] || goal;
};

export const formatWorkoutFrequency = (freq: string) => {
  return `${freq} times per week`;
};

export const formatFitnessExperience = (exp: string) => {
  const expMap: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };
  return expMap[exp] || exp;
};
