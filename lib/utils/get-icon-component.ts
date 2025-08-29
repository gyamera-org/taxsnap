import {
  Activity,
  Dumbbell,
  Footprints,
  Edit3,
  Bike,
  Waves,
  Anchor,
  RotateCcw,
  Move,
  TrendingUp,
  User,
  Heart,
  Zap,
  ArrowUpDown,
  Brain,
  Circle,
  Hexagon,
  Minus,
  Target,
  ArrowUp,
  Feather,
  Shield,
  Sword,
  Music,
  Volume2,
  Radio,
  Mountain,
  Navigation,
  Wind,
  Snowflake,
  CloudSnow,
  Globe,
} from 'lucide-react-native';

export const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Footprints':
      return Footprints;
    case 'Dumbbell':
      return Dumbbell;
    case 'Activity':
      return Activity;
    case 'Edit3':
      return Edit3;
    case 'Bike':
      return Bike;
    case 'Waves':
      return Waves;
    case 'Anchor':
      return Anchor;
    case 'RotateCcw':
      return RotateCcw;
    case 'Move':
      return Move;
    case 'TrendingUp':
      return TrendingUp;
    case 'User':
      return User;
    case 'Heart':
      return Heart;
    case 'Zap':
      return Zap;
    case 'ArrowUpDown':
      return ArrowUpDown;
    case 'Brain':
      return Brain;
    case 'Circle':
      return Circle;
    case 'Hexagon':
      return Hexagon;
    case 'Minus':
      return Minus;
    case 'Target':
      return Target;
    case 'ArrowUp':
      return ArrowUp;
    case 'Feather':
      return Feather;
    case 'Shield':
      return Shield;
    case 'Sword':
      return Sword;
    case 'Music':
      return Music;
    case 'Volume2':
      return Volume2;
    case 'Radio':
      return Radio;
    case 'Mountain':
      return Mountain;
    case 'Navigation':
      return Navigation;
    case 'Wind':
      return Wind;
    case 'Snowflake':
      return Snowflake;
    case 'CloudSnow':
      return CloudSnow;
    case 'Globe':
      return Globe;
    default:
      return Activity;
  }
};
