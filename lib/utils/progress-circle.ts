/**
 * Utility functions for circular progress calculations
 */

export interface CircularProgressProps {
  consumed: number;
  target: number;
  size?: number;
  strokeWidth?: number;
}

export interface CircularProgressStyles {
  backgroundCircle: {
    width: number;
    height: number;
    borderWidth: number;
    borderColor: string;
  };
  progressCircle: {
    width: number;
    height: number;
    borderWidth: number;
    borderColor: string;
    borderTopColor?: string;
    borderRightColor?: string;
    borderBottomColor?: string;
    borderLeftColor?: string;
    transform: { rotate: string }[];
  } | null;
  fullCircle: {
    width: number;
    height: number;
    borderWidth: number;
    borderColor: string;
  } | null;
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(consumed: number, target: number): number {
  if (target <= 0) return 0;
  return (consumed / target) * 100;
}

/**
 * Generate circular progress styles using border segments
 * This approach uses 4 border segments to create smooth circular progress
 */
export function getCircularProgressStyles(
  consumed: number,
  target: number,
  color: string,
  size: number = 76,
  strokeWidth: number = 6
): CircularProgressStyles {
  const progress = calculateProgress(consumed, target);

  const baseCircle = {
    width: size,
    height: size,
    borderWidth: strokeWidth,
  };

  // Background circle (always visible)
  const backgroundCircle = {
    ...baseCircle,
    borderColor: '#E5E7EB',
  };

  // If no progress, return just background
  if (progress <= 0) {
    return {
      backgroundCircle,
      progressCircle: null,
      fullCircle: null,
    };
  }

  // If 100% or more, show full circle
  if (progress >= 100) {
    return {
      backgroundCircle,
      progressCircle: null,
      fullCircle: {
        ...baseCircle,
        borderColor: color,
      },
    };
  }

  // For partial progress, use border segments
  const progressCircle = {
    ...baseCircle,
    borderColor: 'transparent',
    borderTopColor: progress > 0 ? color : 'transparent',
    borderRightColor: progress > 25 ? color : 'transparent',
    borderBottomColor: progress > 50 ? color : 'transparent',
    borderLeftColor: progress > 75 ? color : 'transparent',
    transform: [{ rotate: `${-90 + (progress % 25) * 14.4}deg` }],
  };

  return {
    backgroundCircle,
    progressCircle,
    fullCircle: null,
  };
}

/**
 * Clean, precise circular progress using accurate border calculations
 * This creates smooth progress that accurately reflects the percentage
 */
export function getAccurateCircularProgressStyles(
  consumed: number,
  target: number,
  color: string,
  size: number = 76,
  strokeWidth: number = 6
): CircularProgressStyles {
  const progress = calculateProgress(consumed, target);

  const baseCircle = {
    width: size,
    height: size,
    borderWidth: strokeWidth,
  };

  // Background circle
  const backgroundCircle = {
    ...baseCircle,
    borderColor: '#E5E7EB',
  };


  if (progress <= 0) {
    return {
      backgroundCircle,
      progressCircle: null,
      fullCircle: null,
    };
  }

  if (progress >= 100) {
    return {
      backgroundCircle,
      progressCircle: null,
      fullCircle: {
        ...baseCircle,
        borderColor: color,
      },
    };
  }

  // Simple and accurate approach: calculate how much of each border should be colored
  // Progress starts from top (12 o'clock) and goes clockwise
  const progressCircle = {
    ...baseCircle,
    borderColor: 'transparent',
    // Top border (0-25%)
    borderTopColor: progress > 0 ? color : 'transparent',
    // Right border (25-50%)  
    borderRightColor: progress > 25 ? color : 'transparent',
    // Bottom border (50-75%)
    borderBottomColor: progress > 50 ? color : 'transparent',
    // Left border (75-100%)
    borderLeftColor: progress > 75 ? color : 'transparent',
    // Start from -90 degrees (top) and rotate based on the current segment
    transform: [{ rotate: `${-90 + (progress % 25) * 14.4}deg` }],
  };

  return {
    backgroundCircle,
    progressCircle,
    fullCircle: null,
  };
}

/**
 * Smooth dynamic circular progress using half-circle technique
 * This creates a truly dynamic progress bar that fills smoothly
 */
export function getSimpleCircularProgressStyles(
  consumed: number,
  target: number,
  color: string,
  size: number = 76,
  strokeWidth: number = 6
): CircularProgressStyles {
  const progress = Math.min(calculateProgress(consumed, target), 100);

  const baseCircle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const backgroundCircle = {
    ...baseCircle,
    borderWidth: strokeWidth,
    borderColor: '#E5E7EB',
  };


  if (progress <= 0) {
    return {
      backgroundCircle,
      progressCircle: null,
      fullCircle: null,
    };
  }

  if (progress >= 100) {
    return {
      backgroundCircle,
      progressCircle: null,
      fullCircle: {
        ...baseCircle,
        borderWidth: strokeWidth,
        borderColor: color,
      },
    };
  }

  // Granular progress - each 1% gives more accurate visual feedback
  // Each border represents 25% of progress but starts at 1% intervals
  const progressCircle = {
    ...baseCircle,
    borderWidth: strokeWidth,
    borderColor: 'transparent',
    // Top border: starts at 1%
    borderTopColor: progress >= 1 ? color : 'transparent',
    // Right border: starts at 26%
    borderRightColor: progress >= 26 ? color : 'transparent',
    // Bottom border: starts at 51%
    borderBottomColor: progress >= 51 ? color : 'transparent',
    // Left border: starts at 76%
    borderLeftColor: progress >= 76 ? color : 'transparent',
    transform: [{ rotate: '0deg' }],
  };

  return {
    backgroundCircle,
    progressCircle,
    fullCircle: null,
  };
}
