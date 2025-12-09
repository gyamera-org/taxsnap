import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { BlurView } from 'expo-blur';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ScanHelpModalProps {
  visible: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    titleKey: 'scan.help.step1Title',
    descriptionKey: 'scan.help.step1Description',
    image: require('@/assets/images/demo-scan.jpg'),
  },
  {
    titleKey: 'scan.help.step2Title',
    descriptionKey: 'scan.help.step2Description',
    image: require('@/assets/images/demo-result.jpg'),
  },
];

export function ScanHelpModal({ visible, onClose }: ScanHelpModalProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
        <View style={styles.container}>
          {/* Close button */}
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#FFFFFF" />
          </Pressable>

          {/* Content */}
          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.title}>{t('scan.help.title')}</Text>

            {/* Step indicator */}
            <View style={styles.stepIndicator}>
              {STEPS.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.stepDot,
                    index === currentStep && styles.stepDotActive,
                  ]}
                />
              ))}
            </View>

            {/* Image */}
            <Animated.View
              key={currentStep}
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(200)}
              style={styles.imageContainer}
            >
              <Image source={step.image} style={styles.image} resizeMode="contain" />
            </Animated.View>

            {/* Step title and description */}
            <Animated.View
              key={`text-${currentStep}`}
              entering={FadeIn.duration(300)}
              style={styles.textContainer}
            >
              <Text style={styles.stepTitle}>{t(step.titleKey)}</Text>
              <Text style={styles.stepDescription}>{t(step.descriptionKey)}</Text>
            </Animated.View>

            {/* Navigation */}
            <View style={styles.navigation}>
              {currentStep > 0 ? (
                <Pressable style={styles.navButton} onPress={handlePrev}>
                  <ChevronLeft size={20} color="#FFFFFF" />
                </Pressable>
              ) : (
                <View style={styles.navButtonPlaceholder} />
              )}

              <Pressable style={styles.primaryButton} onPress={handleNext}>
                <Text style={styles.primaryButtonText}>
                  {isLastStep ? t('scan.help.gotIt') : t('common.next')}
                </Text>
                {!isLastStep && <ChevronRight size={18} color="#FFFFFF" />}
              </Pressable>

              {currentStep < STEPS.length - 1 ? (
                <Pressable style={styles.navButton} onPress={handleNext}>
                  <ChevronRight size={20} color="#FFFFFF" />
                </Pressable>
              ) : (
                <View style={styles.navButtonPlaceholder} />
              )}
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  content: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  stepDotActive: {
    backgroundColor: '#0D9488',
    width: 24,
  },
  imageContainer: {
    width: SCREEN_WIDTH - 80,
    height: SCREEN_WIDTH - 80,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonPlaceholder: {
    width: 44,
    height: 44,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D9488',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
