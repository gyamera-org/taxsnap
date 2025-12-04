import { View, Text, ScrollView, Pressable, Linking, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Scan, Brain, CheckCircle, ExternalLink } from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

const MEDICAL_SOURCES = [
  {
    title: 'PCOS and Diet - NIH',
    description: 'National Institutes of Health research on PCOS dietary management',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6734597/',
  },
  {
    title: 'Polycystic Ovary Syndrome - Mayo Clinic',
    description: 'Comprehensive overview of PCOS symptoms and lifestyle recommendations',
    url: 'https://www.mayoclinic.org/diseases-conditions/pcos/symptoms-causes/syc-20353439',
  },
  {
    title: 'PCOS Nutrition Guidelines - ACOG',
    description: 'American College of Obstetricians and Gynecologists dietary guidance',
    url: 'https://www.acog.org/womens-health/faqs/polycystic-ovary-syndrome-pcos',
  },
  {
    title: 'Glycemic Index and PCOS - Endocrine Society',
    description: 'Research on low-glycemic diets for PCOS management',
    url: 'https://www.endocrine.org/patient-engagement/endocrine-library/pcos',
  },
];

function StepCard({
  number,
  icon: Icon,
  title,
  description,
  delay,
}: {
  number: number;
  icon: any;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(400)}>
      <View style={styles.stepRow}>
        <View style={styles.stepIconColumn}>
          <View style={styles.stepIconContainer}>
            <Icon size={24} color="#0D9488" />
          </View>
          {number < 3 && <View style={styles.stepConnector} />}
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepNumber}>STEP {number}</Text>
          <Text style={styles.stepTitle}>{title}</Text>
          <Text style={styles.stepDescription}>{description}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function SourceCard({
  title,
  description,
  url,
  delay,
}: {
  title: string;
  description: string;
  url: string;
  delay: number;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(400)}>
      <Pressable onPress={() => Linking.openURL(url)} style={styles.sourceCard}>
        <View style={styles.sourceContent}>
          <Text style={styles.sourceTitle}>{title}</Text>
          <Text style={styles.sourceDescription}>{description}</Text>
        </View>
        <View style={styles.sourceIconContainer}>
          <ExternalLink size={16} color="#0D9488" />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function HowItWorksScreen() {
  const router = useRouter();
  const { t } = useTranslation();

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
          <Text style={styles.headerTitle}>{t('howItWorks.title')}</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Intro */}
          <Animated.View entering={FadeInUp.duration(400)} style={styles.introSection}>
            <Text style={styles.introTitle}>{t('howItWorks.intro.title')}</Text>
            <Text style={styles.introDescription}>
              {t('howItWorks.intro.description')}
            </Text>
          </Animated.View>

          {/* Steps */}
          <View style={styles.stepsSection}>
            <StepCard
              number={1}
              icon={Scan}
              title={t('howItWorks.steps.step1.title')}
              description={t('howItWorks.steps.step1.description')}
              delay={100}
            />
            <StepCard
              number={2}
              icon={Brain}
              title={t('howItWorks.steps.step2.title')}
              description={t('howItWorks.steps.step2.description')}
              delay={200}
            />
            <StepCard
              number={3}
              icon={CheckCircle}
              title={t('howItWorks.steps.step3.title')}
              description={t('howItWorks.steps.step3.description')}
              delay={300}
            />
          </View>

          {/* What We Check */}
          <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.analyzeSection}>
            <Text style={styles.sectionTitle}>{t('howItWorks.whatWeAnalyze')}</Text>
            <View style={styles.glassCard}>
              <View style={styles.tagsContainer}>
                {[
                  'Glycemic Index',
                  'Sugar Content',
                  'Inflammatory Markers',
                  'Hormone Disruptors',
                  'Fiber Content',
                  'Healthy Fats',
                  'Protein Quality',
                  'Processed Ingredients',
                ].map((item) => (
                  <View key={item} style={styles.tag}>
                    <Text style={styles.tagText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Medical Disclaimer */}
          <Animated.View entering={FadeInUp.delay(500).duration(400)} style={styles.disclaimerSection}>
            <View style={styles.disclaimerCard}>
              <Text style={styles.disclaimerTitle}>{t('howItWorks.disclaimer.title')}</Text>
              <Text style={styles.disclaimerText}>
                {t('howItWorks.disclaimer.message')}
              </Text>
            </View>
          </Animated.View>

          {/* Medical Sources */}
          <Animated.View entering={FadeInUp.delay(600).duration(400)}>
            <Text style={styles.sectionTitle}>{t('howItWorks.sources.title')}</Text>
            <Text style={styles.sourcesSubtitle}>
              {t('howItWorks.sources.description')}
            </Text>
          </Animated.View>

          {MEDICAL_SOURCES.map((source, index) => (
            <SourceCard
              key={source.title}
              title={source.title}
              description={source.description}
              url={source.url}
              delay={700 + index * 100}
            />
          ))}
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
    paddingBottom: 40,
  },
  introSection: {
    marginBottom: 32,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  introDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  stepsSection: {
    marginBottom: 32,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepIconColumn: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  stepConnector: {
    width: 2,
    height: 32,
    backgroundColor: 'rgba(20, 184, 166, 0.3)',
    marginTop: 8,
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
    letterSpacing: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  analyzeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  tagText: {
    fontSize: 14,
    color: '#0D9488',
    fontWeight: '500',
  },
  disclaimerSection: {
    marginBottom: 32,
  },
  disclaimerCard: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#A16207',
    lineHeight: 20,
  },
  sourcesSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    marginTop: -8,
  },
  sourceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  sourceContent: {
    flex: 1,
    marginRight: 12,
  },
  sourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sourceDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  sourceIconContainer: {
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
