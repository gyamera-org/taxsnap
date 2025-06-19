import { useState, useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  FadeIn,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const steps = ['Welcome', 'Discover', 'Analyze'];

// Video sources for each step - you can replace these with different videos
const videoSources = [
  require('@/assets/onboarding/example.mp4'), // Welcome step
  require('@/assets/onboarding/example.mp4'), // Discover step
  require('@/assets/onboarding/example.mp4'), // Analyze step
];

function StepIndicator({ step }: { step: number }) {
  return (
    <View className="flex-row justify-center absolute top-16 left-0 right-0 z-10">
      {steps.map((_, i) => (
        <Animated.View
          key={i}
          className={`h-2 mx-1 rounded-full ${i === step ? 'w-6 bg-pink-500' : 'w-2 bg-white/40'}`}
          entering={FadeIn.delay(i * 200)}
        />
      ))}
    </View>
  );
}

// Optimized video background with prefetching
function OptimizedVideoBackground({
  videoSource,
  isActive,
  children,
  onVideoLoad,
}: {
  videoSource: any;
  isActive: boolean;
  children: React.ReactNode;
  onVideoLoad?: () => void;
}) {
  const opacity = useSharedValue(0);

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.muted = true;
    if (isActive) {
      player.play();
    }
    if (onVideoLoad) {
      runOnJS(onVideoLoad)();
    }
  });

  useEffect(() => {
    if (isActive) {
      opacity.value = withTiming(1, { duration: 500 });
      player.play();
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      player.pause();
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, animatedStyle]}
    >
      <VideoView
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          width,
          height,
        }}
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        nativeControls={false}
        contentFit="cover"
      />
      <View className="flex-1 bg-black/40">{children}</View>
    </Animated.View>
  );
}

function NavigationButtons({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  nextLabel = 'Next',
}: {
  onNext: () => void;
  onBack?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  nextLabel?: string;
}) {
  return (
    <Animated.View
      className="flex-row justify-between items-center px-8 py-6 pb-8"
      entering={FadeIn.delay(600)}
    >
      <Animated.View entering={FadeIn.delay(700)}>
        <Button
          title="Back"
          onPress={onBack}
          variant="secondary"
          size="medium"
          className="flex-row items-center"
        />
      </Animated.View>

      <Animated.View entering={FadeIn.delay(800)}>
        <Button
          title={nextLabel}
          onPress={onNext}
          variant="primary"
          size="medium"
          className="flex-row items-center"
        />
      </Animated.View>
    </Animated.View>
  );
}

// Optimized step container with smooth content transitions
function StepContainer({
  title,
  subtitle,
  isActive,
  children,
}: {
  title: string;
  subtitle: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      opacity.value = withTiming(1, { duration: 600 });
      translateY.value = withTiming(0, { duration: 600 });
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      translateY.value = withTiming(50, { duration: 300 });
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!isActive) return null;

  return (
    <View className="flex-1 justify-end">
      <Animated.View className="bg-black/80 rounded-t-[32px] pt-8" style={animatedStyle}>
        <View className="px-8">
          <Animated.Text
            className="text-3xl font-bold text-white text-left mb-4 leading-tight"
            entering={FadeIn.delay(400)}
          >
            {title}
          </Animated.Text>
          <Animated.Text
            className="text-lg text-white/90 text-left mb-6 leading-relaxed"
            entering={FadeIn.delay(500)}
          >
            {subtitle}
          </Animated.Text>
        </View>
        {children}
      </Animated.View>
    </View>
  );
}

// Legacy component - kept for compatibility but now uses optimized version
function VideoBackground({
  videoSource,
  children,
}: {
  videoSource: any;
  children: React.ReactNode;
}) {
  return (
    <OptimizedVideoBackground videoSource={videoSource} isActive={true}>
      {children}
    </OptimizedVideoBackground>
  );
}

// Legacy step components - removed in favor of optimized data-driven approach

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [videosLoaded, setVideosLoaded] = useState<Set<number>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  // Prefetch next video when current step loads
  useEffect(() => {
    const nextVideoIndex = step + 1;
    if (nextVideoIndex < videoSources.length && !videosLoaded.has(nextVideoIndex)) {
      // Prefetch the next video by creating a hidden video component
      // This will start loading the video in the background
    }
  }, [step, videosLoaded]);

  const handleVideoLoad = (videoIndex: number) => {
    setVideosLoaded((prev) => new Set(prev).add(videoIndex));
  };

  const goNext = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setTimeout(() => {
      if (step < steps.length - 1) {
        setStep((s) => s + 1);
      } else {
        // Navigate to paywall after the last onboarding step
        router.replace('/paywall');
      }
      setIsTransitioning(false);
    }, 200); // Small delay for smooth transition
  };

  const goBack = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setTimeout(() => {
      if (step === 0) {
        // Go back to welcome screen on first onboarding step
        router.replace('/');
      } else {
        setStep((s) => s - 1);
      }
      setIsTransitioning(false);
    }, 200);
  };

  const stepData = [
    {
      title: "What's Really in Your Products?",
      subtitle: 'Toxic ingredients hide in your favorite beauty products.',
      nextLabel: 'Find Out',
    },
    {
      title: 'Knowledge is Power',
      subtitle: 'Scan any product. Know every ingredient. Stay safe.',
      nextLabel: 'Get Protected',
    },
    {
      title: 'Beauty Made Simple',
      subtitle: 'Build a collection you trust.',
      nextLabel: 'Start Scanning',
    },
  ];

  return (
    <View className="flex-1 bg-black">
      <StepIndicator step={step} />

      {/* Render all videos but only show the active one */}
      {videoSources.map((videoSource, index) => (
        <OptimizedVideoBackground
          key={index}
          videoSource={videoSource}
          isActive={index === step}
          onVideoLoad={() => handleVideoLoad(index)}
        >
          <StepContainer
            title={stepData[index].title}
            subtitle={stepData[index].subtitle}
            isActive={index === step}
          >
            <NavigationButtons
              onNext={goNext}
              onBack={goBack}
              isFirstStep={index === 0}
              isLastStep={index === steps.length - 1}
              nextLabel={stepData[index].nextLabel}
            />
          </StepContainer>
        </OptimizedVideoBackground>
      ))}
    </View>
  );
}
