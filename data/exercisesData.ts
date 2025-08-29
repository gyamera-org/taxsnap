export interface Exercise {
  id: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  metrics: {
    primary: 'time' | 'distance' | 'reps' | 'calories';
    secondary?: 'time' | 'distance' | 'reps' | 'calories';
    units: {
      primary: string;
      secondary?: string;
    };
  };
  description?: string;
  // New optional properties for community exercises
  muscleGroups?: string[];
  equipment?: string;
  difficulty?: string;
  caloriesPerMinute?: number;
}

export const exercisesData: Exercise[] = [
  // Cardio Exercises
  {
    id: 'running',
    name: 'Running',
    category: 'Cardio',
    icon: 'Footprints',
    color: '#3B82F6',
    metrics: {
      primary: 'distance',
      secondary: 'time',
      units: {
        primary: 'km',
        secondary: 'min',
      },
    },
    description: 'Outdoor or treadmill running',
  },
  {
    id: 'walking',
    name: 'Walking',
    category: 'Cardio',
    icon: 'Footprints',
    color: '#10B981',
    metrics: {
      primary: 'distance',
      secondary: 'time',
      units: {
        primary: 'km',
        secondary: 'min',
      },
    },
    description: 'Casual or brisk walking',
  },
  {
    id: 'jogging',
    name: 'Jogging',
    category: 'Cardio',
    icon: 'Footprints',
    color: '#059669',
    metrics: {
      primary: 'distance',
      secondary: 'time',
      units: {
        primary: 'km',
        secondary: 'min',
      },
    },
    description: 'Light jogging or slow running',
  },
  {
    id: 'cycling',
    name: 'Cycling',
    category: 'Cardio',
    icon: 'Bike',
    color: '#06B6D4',
    metrics: {
      primary: 'distance',
      secondary: 'time',
      units: {
        primary: 'km',
        secondary: 'min',
      },
    },
    description: 'Road cycling or stationary bike',
  },
  {
    id: 'swimming',
    name: 'Swimming',
    category: 'Cardio',
    icon: 'Waves',
    color: '#0891B2',
    metrics: {
      primary: 'distance',
      secondary: 'time',
      units: {
        primary: 'm',
        secondary: 'min',
      },
    },
    description: 'Pool or open water swimming',
  },
  {
    id: 'rowing',
    name: 'Rowing',
    category: 'Cardio',
    icon: 'Anchor',
    color: '#0F766E',
    metrics: {
      primary: 'distance',
      secondary: 'time',
      units: {
        primary: 'm',
        secondary: 'min',
      },
    },
    description: 'Rowing machine or boat rowing',
  },
  {
    id: 'elliptical',
    name: 'Elliptical',
    category: 'Cardio',
    icon: 'RotateCcw',
    color: '#0D9488',
    metrics: {
      primary: 'time',
      secondary: 'calories',
      units: {
        primary: 'min',
        secondary: 'cal',
      },
    },
    description: 'Elliptical machine workout',
  },
  {
    id: 'treadmill',
    name: 'Treadmill',
    category: 'Cardio',
    icon: 'Move',
    color: '#14B8A6',
    metrics: {
      primary: 'distance',
      secondary: 'time',
      units: {
        primary: 'km',
        secondary: 'min',
      },
    },
    description: 'Treadmill walking or running',
  },
  {
    id: 'stair_climber',
    name: 'Stair Climber',
    category: 'Cardio',
    icon: 'TrendingUp',
    color: '#2DD4BF',
    metrics: {
      primary: 'time',
      secondary: 'calories',
      units: {
        primary: 'min',
        secondary: 'cal',
      },
    },
    description: 'Stair climbing machine',
  },

  // Strength Training
  {
    id: 'weight_lifting',
    name: 'Weight Lifting',
    category: 'Strength',
    icon: 'Dumbbell',
    color: '#EF4444',
    metrics: {
      primary: 'time',
      secondary: 'reps',
      units: {
        primary: 'min',
        secondary: 'reps',
      },
    },
    description: 'Free weights or machines',
  },
  {
    id: 'gym',
    name: 'Gym Workout',
    category: 'Strength',
    icon: 'Dumbbell',
    color: '#DC2626',
    metrics: {
      primary: 'time',
      units: {
        primary: 'min',
      },
    },
    description: 'General gym session',
  },
  {
    id: 'calisthenics',
    name: 'Calisthenics',
    category: 'Strength',
    icon: 'Dumbbell',
    color: '#B91C1C',
    metrics: {
      primary: 'time',
      secondary: 'reps',
      units: {
        primary: 'min',
        secondary: 'reps',
      },
    },
    description: 'Bodyweight exercises',
  },
  {
    id: 'bodyweight',
    name: 'Bodyweight Training',
    category: 'Strength',
    icon: 'User',
    color: '#991B1B',
    metrics: {
      primary: 'time',
      secondary: 'reps',
      units: {
        primary: 'min',
        secondary: 'reps',
      },
    },
    description: 'Push-ups, pull-ups, squats',
  },
  {
    id: 'crossfit',
    name: 'CrossFit',
    category: 'Strength',
    icon: 'Dumbbell',
    color: '#7F1D1D',
    metrics: {
      primary: 'time',
      units: {
        primary: 'min',
      },
    },
    description: 'High-intensity functional training',
  },
  {
    id: 'powerlifting',
    name: 'Powerlifting',
    category: 'Strength',
    icon: 'Dumbbell',
    color: '#FCA5A5',
    metrics: {
      primary: 'time',
      secondary: 'reps',
      units: {
        primary: 'min',
        secondary: 'sets',
      },
    },
    description: 'Squat, bench press, deadlift',
  },

  // Flexibility & Recovery
  {
    id: 'yoga',
    name: 'Yoga',
    category: 'Flexibility',
    icon: 'Heart',
    color: '#8B5CF6',
    metrics: {
      primary: 'time',
      units: {
        primary: 'min',
      },
    },
    description: 'Yoga poses and stretches',
  },
  {
    id: 'pilates',
    name: 'Pilates',
    category: 'Flexibility',
    icon: 'Zap',
    color: '#7C3AED',
    metrics: {
      primary: 'time',
      units: {
        primary: 'min',
      },
    },
    description: 'Core-focused exercises',
  },
  {
    id: 'stretching',
    name: 'Stretching',
    category: 'Flexibility',
    icon: 'ArrowUpDown',
    color: '#6D28D9',
    metrics: {
      primary: 'time',
      units: {
        primary: 'min',
      },
    },
    description: 'Static or dynamic stretching',
  },
  {
    id: 'meditation',
    name: 'Meditation',
    category: 'Recovery',
    icon: 'Brain',
    color: '#5B21B6',
    metrics: {
      primary: 'time',
      units: {
        primary: 'min',
      },
    },
    description: 'Mindfulness and meditation',
  },

  // Sports
  {
    id: 'basketball',
    name: 'Basketball',
    category: 'Sports',
    icon: 'Circle',
    color: '#F59E0B',
    metrics: {
      primary: 'time',
      units: {
        primary: 'min',
      },
    },
    description: 'Basketball game or practice',
  },
  {
    id: 'football',
    name: 'Football',
    category: 'Sports',
    icon: 'Hexagon',
    color: '#D97706',
    metrics: {
      primary: 'time',
      units: {
        primary: 'min',
      },
    },
    description: 'American football',
  },
  {
    id: 'tennis',
    name: 'Tennis',
    category: 'Sports',
    icon: 'Minus',
    color: '#B45309',
    metrics: {
      primary: 'time',
      units: {
        primary: 'min',
      },
    },
    description: 'Tennis match or practice',
  },
  {
    id: 'soccer',
    name: 'Soccer',
    category: 'Sports',
    icon: 'Target',
    color: '#92400E',
    metrics: {
      primary: 'time',
      units: {
        primary: 'min',
      },
    },
    description: 'Soccer/football game',
  },
  {
    id: 'volleyball',
    name: 'Volleyball',
    category: 'Sports',
    icon: 'ArrowUp',
    color: '#78350F',
    metrics: {
      primary: 'time',
      units: {
        primary: 'min',
      },
    },
    description: 'Volleyball game or practice',
  },
  {
    id: 'badminton',
    name: 'Badminton',
    category: 'Sports',
    icon: 'Feather',
    color: '#451A03',
    metrics: {
      primary: 'time',
      units: {
        primary: 'min',
      },
    },
    description: 'Badminton match or practice',
  },

  // Combat Sports
  {
    id: 'boxing',
    name: 'Boxing',
    category: 'Combat',
    icon: 'Shield',
    color: '#E11D48',
    metrics: {
      primary: 'time',
      secondary: 'reps',
      units: {
        primary: 'min',
        secondary: 'rounds',
      },
    },
    description: 'Boxing training or sparring',
  },
  {
    id: 'martial_arts',
    name: 'Martial Arts',
    category: 'Combat',
    icon: 'Sword',
    color: '#BE185D',
    metrics: {
      primary: 'time',
      units: {
        primary: 'min',
      },
    },
    description: 'Karate, Taekwondo, Jiu-Jitsu',
  },
  {
    id: 'kickboxing',
    name: 'Kickboxing',
    category: 'Combat',
    icon: 'Zap',
    color: '#9D174D',
    metrics: {
      primary: 'time',
      secondary: 'reps',
      units: {
        primary: 'min',
        secondary: 'rounds',
      },
    },
    description: 'Kickboxing training',
  },

  // Dance & Fun Activities
  {
    id: 'dancing',
    name: 'Dancing',
    category: 'Fun',
    icon: 'Music',
    color: '#EC4899',
    metrics: {
      primary: 'time',
      units: {
        primary: 'min',
      },
    },
    description: 'Social or solo dancing',
  },
  {
    id: 'zumba',
    name: 'Zumba',
    category: 'Fun',
    icon: 'Volume2',
    color: '#DB2777',
    metrics: {
      primary: 'time',
      units: {
        primary: 'min',
      },
    },
    description: 'Zumba fitness class',
  },
  {
    id: 'aerobics',
    name: 'Aerobics',
    category: 'Fun',
    icon: 'Radio',
    color: '#BE185D',
    metrics: {
      primary: 'time',
      units: {
        primary: 'min',
      },
    },
    description: 'Aerobics class or routine',
  },

  // Outdoor Activities
  {
    id: 'hiking',
    name: 'Hiking',
    category: 'Outdoor',
    icon: 'Footprints',
    color: '#65A30D',
    metrics: {
      primary: 'distance',
      secondary: 'time',
      units: {
        primary: 'km',
        secondary: 'min',
      },
    },
    description: 'Trail hiking or nature walks',
  },
  {
    id: 'rock_climbing',
    name: 'Rock Climbing',
    category: 'Outdoor',
    icon: 'Mountain',
    color: '#4D7C0F',
    metrics: {
      primary: 'time',
      units: {
        primary: 'min',
      },
    },
    description: 'Indoor or outdoor climbing',
  },
  {
    id: 'kayaking',
    name: 'Kayaking',
    category: 'Outdoor',
    icon: 'Navigation',
    color: '#365314',
    metrics: {
      primary: 'distance',
      secondary: 'time',
      units: {
        primary: 'km',
        secondary: 'min',
      },
    },
    description: 'Kayaking or canoeing',
  },
  {
    id: 'surfing',
    name: 'Surfing',
    category: 'Outdoor',
    icon: 'Wind',
    color: '#1F2937',
    metrics: {
      primary: 'time',
      units: {
        primary: 'min',
      },
    },
    description: 'Ocean or lake surfing',
  },
  {
    id: 'skiing',
    name: 'Skiing',
    category: 'Outdoor',
    icon: 'Snowflake',
    color: '#374151',
    metrics: {
      primary: 'distance',
      secondary: 'time',
      units: {
        primary: 'km',
        secondary: 'min',
      },
    },
    description: 'Downhill or cross-country skiing',
  },
  {
    id: 'snowboarding',
    name: 'Snowboarding',
    category: 'Outdoor',
    icon: 'CloudSnow',
    color: '#4B5563',
    metrics: {
      primary: 'time',
      units: {
        primary: 'min',
      },
    },
    description: 'Snowboarding on slopes',
  },
];
