import React from 'react';
import { View, Text } from 'react-native';
import { Scale, Target, Ruler, Calendar } from 'lucide-react-native';
import { EditableGoalCard } from './EditableGoalCard';
import { type BodyMeasurements } from '@/lib/hooks/use-weight-tracking';

interface WeightStatsCardsProps {
  bodyMeasurements: BodyMeasurements | null;
  progress: {
    weeklyRate: string | number;
  };
  editingField: string | null;
  tempValue: string;
  onEdit: (field: string, value: number) => void;
  onSave: () => void;
  onTempValueChange: (value: string) => void;
}

export function WeightStatsCards({
  bodyMeasurements,
  progress,
  editingField,
  tempValue,
  onEdit,
  onSave,
  onTempValueChange,
}: WeightStatsCardsProps) {
  return (
    <View className="px-4 mb-4">
      <Text className="text-xl font-bold text-gray-900 mb-3">Current Stats</Text>

      <EditableGoalCard
        icon={Scale}
        title="Current Weight"
        value={bodyMeasurements?.current_weight || 0}
        subtitle="Latest recorded weight"
        field="current_weight"
        units={bodyMeasurements?.units || 'kg'}
        editingField={editingField}
        tempValue={tempValue}
        onEdit={onEdit}
        onSave={onSave}
        onTempValueChange={onTempValueChange}
      />

      <EditableGoalCard
        icon={Target}
        title="Goal Weight"
        value={bodyMeasurements?.goal_weight || 0}
        subtitle="Target weight"
        field="goal_weight"
        units={bodyMeasurements?.units || 'kg'}
        editingField={editingField}
        tempValue={tempValue}
        onEdit={onEdit}
        onSave={onSave}
        onTempValueChange={onTempValueChange}
      />

      <EditableGoalCard
        icon={Ruler}
        title="Height"
        value={bodyMeasurements?.height || 0}
        subtitle="Your height"
        field="height"
        units="cm"
        editingField={editingField}
        tempValue={tempValue}
        onEdit={onEdit}
        onSave={onSave}
        onTempValueChange={onTempValueChange}
      />

      {/* BMI Card */}
      {/* {bodyMeasurements?.height && bodyMeasurements?.current_weight && (
        <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
          <View className="flex-row items-center mb-3">
            <View className="bg-blue-100 w-10 h-10 rounded-xl items-center justify-center mr-3">
              <Scale size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">BMI</Text>
              <Text className="text-xs text-gray-500">Body Mass Index</Text>
            </View>
          </View>

          {(() => {
            const heightInM = bodyMeasurements.height / 100;
            const bmi = bodyMeasurements.current_weight / (heightInM * heightInM);
            const bmiCategory =
              bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
            const bmiColor =
              bmi < 18.5
                ? 'text-blue-600'
                : bmi < 25
                  ? 'text-green-600'
                  : bmi < 30
                    ? 'text-yellow-600'
                    : 'text-red-600';

            return (
              <>
                <Text className="text-2xl font-bold text-gray-900 mb-1">{bmi.toFixed(1)}</Text>
                <Text className={`text-sm font-medium ${bmiColor}`}>{bmiCategory}</Text>
              </>
            );
          })()}
        </View>
      )} */}

      <EditableGoalCard
        icon={Calendar}
        title="Weekly Rate"
        value={Math.abs(Number(progress.weeklyRate))}
        subtitle="Average weekly change"
        field="weeklyRate"
        units={`${bodyMeasurements?.units || 'kg'}/week`}
        trend={
          Number(progress.weeklyRate) < -0.1
            ? 'down'
            : Number(progress.weeklyRate) > 0.1
              ? 'up'
              : 'stable'
        }
        editingField={editingField}
        tempValue={tempValue}
        onEdit={onEdit}
        onSave={onSave}
        onTempValueChange={onTempValueChange}
      />
    </View>
  );
}
