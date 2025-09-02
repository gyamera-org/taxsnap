import { useMemo } from 'react';
import { getLocalDateString } from '@/lib/utils/date-helpers';

export function useDateRange() {
  const weekRange = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 5);
    const end = new Date(today);
    end.setDate(today.getDate() + 1);

    return {
      startDate: getLocalDateString(start),
      endDate: getLocalDateString(end),
    };
  }, []);

  return weekRange;
}
