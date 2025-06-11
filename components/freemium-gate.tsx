import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSubscription } from '../context/subscription-provider';

const { width } = Dimensions.get('window');

interface FreemiumGateProps {
  visible: boolean;
  feature: string;
  featureName: string;
  featureDescription: string;
  icon: keyof typeof Ionicons.glyphMap;
  onClose: () => void;
}

export function FreemiumGate({
  visible,
  feature,
  featureName,
  featureDescription,
  icon,
  onClose,
}: FreemiumGateProps) {
  const { getRemainingFreeScans, canAccessFeature } = useSubscription();

  const getFeatureDetails = () => {
    switch (feature) {
      case 'product_scan':
        return {
          remaining: getRemainingFreeScans(),
          total: 150,
          resetPeriod: 'month',
        };
      case 'routine_generation':
        return {
          remaining: 0,
          total: 2,
          resetPeriod: 'month',
        };
      case 'multiple_profiles':
        return {
          remaining: 0,
          total: 1,
          resetPeriod: 'account',
        };
      default:
        return {
          remaining: 0,
          total: 0,
          resetPeriod: 'month',
        };
    }
  };

  const details = getFeatureDetails();

  const handleUpgrade = () => {
    onClose();
    router.push('/paywall');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.iconContainer}>
              <Ionicons name={icon} size={48} color="white" />
            </View>

            <Text style={styles.title}>Upgrade to Pro</Text>
            <Text style={styles.subtitle}>You've reached your free limit</Text>
          </LinearGradient>

          <View style={styles.content}>
            <View style={styles.limitInfo}>
              <Text style={styles.limitTitle}>{featureName}</Text>
              <Text style={styles.limitDescription}>{featureDescription}</Text>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${((details.total - details.remaining) / details.total) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {details.total - details.remaining} of {details.total} used
                </Text>
              </View>

              <Text style={styles.resetInfo}>Free tier resets every {details.resetPeriod}</Text>
            </View>

            <View style={styles.proFeatures}>
              <Text style={styles.proFeaturesTitle}>With h-deets Pro:</Text>

              <View style={styles.featureItem}>
                <Ionicons name="infinite-outline" size={20} color="#FF6B6B" />
                <Text style={styles.featureText}>Unlimited {featureName.toLowerCase()}</Text>
              </View>

              <View style={styles.featureItem}>
                <Ionicons name="analytics-outline" size={20} color="#FF6B6B" />
                <Text style={styles.featureText}>Detailed analysis & insights</Text>
              </View>

              <View style={styles.featureItem}>
                <Ionicons name="star-outline" size={20} color="#FF6B6B" />
                <Text style={styles.featureText}>Expert recommendations</Text>
              </View>

              <View style={styles.featureItem}>
                <Ionicons name="people-outline" size={20} color="#FF6B6B" />
                <Text style={styles.featureText}>Multiple hair profiles</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
              <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.upgradeButtonGradient}>
                <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
                <Text style={styles.upgradeButtonSubtext}>7-day free trial</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.continueButton} onPress={onClose}>
              <Text style={styles.continueButtonText}>Continue with Free</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: width - 40,
    maxWidth: 400,
    overflow: 'hidden',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    padding: 24,
  },
  limitInfo: {
    marginBottom: 24,
  },
  limitTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  limitDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  resetInfo: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  proFeatures: {
    marginBottom: 24,
  },
  proFeaturesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 12,
    color: '#555',
  },
  upgradeButton: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  upgradeButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  upgradeButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginTop: 4,
  },
  continueButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
});
