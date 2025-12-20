import Svg, { Path, Circle } from 'react-native-svg';

interface AppLogoProps {
  size?: number;
  color?: string;
  textColor?: string;
}

// Default app logo - replace the SVG content with your app's logo
export function AppLogo({ size = 48, color = '#0D9488', textColor = '#ffffff' }: AppLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Circle cx="50" cy="50" r="45" fill={color} />
      <Path
        d="M50 25C36.2 25 25 36.2 25 50C25 63.8 36.2 75 50 75C63.8 75 75 63.8 75 50C75 36.2 63.8 25 50 25ZM50 65C41.7 65 35 58.3 35 50C35 41.7 41.7 35 50 35C58.3 35 65 41.7 65 50C65 58.3 58.3 65 50 65Z"
        fill={textColor}
      />
    </Svg>
  );
}
