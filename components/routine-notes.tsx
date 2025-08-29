import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { format } from 'date-fns';
import type { RoutineLog } from '@/types/routine-log';

type NotesSectionProps = {
  logs: RoutineLog[];
  timeRange: string;
};

export function NotesSection({ logs, timeRange }: NotesSectionProps) {
  return (
    <View className="mt-6">
      <Text className="text-xl font-medium mb-4">Routine Notes</Text>
      <View className="gap-4">
        {logs.map(
          (log) =>
            log.notes && (
              <View key={log.date} className="bg-white p-4 rounded-2xl">
                <Text className="text-gray-600 mb-2">
                  {format(new Date(log.date), 'MMM d, yyyy')}
                </Text>
                <Text className="text-base">{log.notes}</Text>
              </View>
            )
        )}
      </View>
    </View>
  );
}
