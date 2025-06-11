import { create } from 'zustand';
import { Product } from '@/lib/api/types';

interface HairCondition {
  moisture: number;
  strength: number;
  shine: number;
  manageability: number;
}

interface LogRoutineData {
  userId: string;
  hairProfileId: string;
  hairLength: string;
  style: string;
  notes: string;
  photos: string[];
  products: string[];
  rating: number;
  hairCondition: HairCondition;
}

interface RoutineStore {
  logRoutine: (data: LogRoutineData) => Promise<void>;
}

export const useRoutineStore = create<RoutineStore>((set) => ({
  logRoutine: async (data) => {
    try {
      const response = await fetch('/api/routines/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to log routine');
      }
    } catch (error) {
      console.error('Error logging routine:', error);
      throw error;
    }
  },
}));
