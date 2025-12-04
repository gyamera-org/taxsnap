import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/context/language-provider';
import { Language } from '@/lib/i18n';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

export default function LanguageScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language, changeLanguage, supportedLanguages } = useLanguage();

  const handleSelectLanguage = async (lang: Language) => {
    await changeLanguage(lang);
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Liquid Glass Background */}
      <LinearGradient
        colors={['#F0FDFA', '#CCFBF1', '#99F6E4', '#F0FDFA']}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating orbs */}
      <Animated.View entering={FadeIn.duration(1000)} style={styles.orb1} />
      <Animated.View entering={FadeIn.duration(1000).delay(200)} style={styles.orb2} />
      <Animated.View entering={FadeIn.duration(1000).delay(400)} style={styles.orb3} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <View style={styles.glassButton}>
              <ChevronLeft size={24} color="#0D9488" />
            </View>
          </Pressable>
          <Text style={styles.headerTitle}>{t('language.title')}</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <Text style={styles.subtitle}>{t('language.select')}</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.glassCard}>
            {supportedLanguages.map((lang, index) => (
              <Pressable
                key={lang.code}
                onPress={() => handleSelectLanguage(lang.code)}
                style={[
                  styles.languageItem,
                  index < supportedLanguages.length - 1 && styles.languageItemBorder,
                ]}
              >
                <View>
                  <Text style={styles.languageName}>{lang.nativeName}</Text>
                  <Text style={styles.languageNameEnglish}>{lang.name}</Text>
                </View>
                {language === lang.code && (
                  <View style={styles.checkContainer}>
                    <Check size={18} color="#0D9488" />
                  </View>
                )}
              </Pressable>
            ))}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 12,
  },
  glassButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 52,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  languageItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(209, 213, 219, 0.5)',
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  languageNameEnglish: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  checkContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    top: -50,
    right: -50,
  },
  orb2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    bottom: 100,
    left: -30,
  },
  orb3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(94, 234, 212, 0.12)',
    top: '40%',
    right: 20,
  },
});
