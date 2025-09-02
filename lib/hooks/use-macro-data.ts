import { useMemo } from 'react';

export function useMacroData(progress: any) {
  const macroData = useMemo(() => {
    return progress
      ? {
          calories: {
            consumed: Math.round(progress.calories.consumed),
            target: Math.round(progress.calories.goal),
          },
          protein: {
            consumed: Math.round(progress.protein.consumed),
            target: Math.round(progress.protein.goal),
          },
          carbs: {
            consumed: Math.round(progress.carbs.consumed),
            target: Math.round(progress.carbs.goal),
          },
          fat: {
            consumed: Math.round(progress.fat.consumed),
            target: Math.round(progress.fat.goal),
          },
        }
      : {
          calories: { consumed: 0, target: 0 },
          protein: { consumed: 0, target: 0 },
          carbs: { consumed: 0, target: 0 },
          fat: { consumed: 0, target: 0 },
        };
  }, [progress]);

  return macroData;
}
