export interface OnboardingData {
  // Personal Info
  name: string;
  dateOfBirth: string;

  // Fitness Goals
  fitnessGoal: string;
  fitnessFrequency: string;
  fitnessExperience: string;

  // Nutrition Goals
  nutritionGoal: string;
  activityLevel: string;
  nutritionExperience: string;

  // Body Metrics
  height: number;
  weight: number;
  weightGoal: number;
  units: 'metric' | 'imperial';

  // Preferences
  plan: 'yearly' | 'monthly';
}

export interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
}

export type CalendarType = 'birthday';

export interface OnboardingStepContentProps {
  data: OnboardingData;
  updateData: (key: keyof OnboardingData, value: any) => void;
  openCalendar: (type: CalendarType) => void;
}
