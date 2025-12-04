import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

// Icons for each metric
function GlycemicIcon({ color = '#0D9488', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </Svg>
  );
}

function SugarIcon({ color = '#0D9488', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Path d="M8 12h8" />
      <Path d="M12 8v8" />
    </Svg>
  );
}

function InflammatoryIcon({ color = '#0D9488', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </Svg>
  );
}

function HormoneIcon({ color = '#0D9488', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="4" />
      <Path d="M12 2v2" />
      <Path d="M12 20v2" />
      <Path d="m4.93 4.93 1.41 1.41" />
      <Path d="m17.66 17.66 1.41 1.41" />
      <Path d="M2 12h2" />
      <Path d="M20 12h2" />
      <Path d="m6.34 17.66-1.41 1.41" />
      <Path d="m19.07 4.93-1.41 1.41" />
    </Svg>
  );
}

function FiberIcon({ color = '#0D9488', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M7 20h10" />
      <Path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <Path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
      <Path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </Svg>
  );
}

function ProteinIcon({ color = '#0D9488', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
      <Path d="M6 17h12" />
      <Path d="M9 21v-4a2 2 0 0 1 4 0v4" />
    </Svg>
  );
}

function FatsIcon({ color = '#0D9488', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
      <Circle cx="7.5" cy="10.5" r="1.5" />
      <Circle cx="12" cy="7.5" r="1.5" />
      <Circle cx="16.5" cy="10.5" r="1.5" />
    </Svg>
  );
}

function ProcessedIcon({ color = '#0D9488', size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </Svg>
  );
}

interface MetricCardProps {
  icon: React.ComponentType<{ color?: string; size?: number }>;
  title: string;
  description: string;
  pcosImpact: string;
  goodValues: string;
  badValues: string;
  delay: number;
  t: any;
}

function MetricCard({
  icon: Icon,
  title,
  description,
  pcosImpact,
  goodValues,
  badValues,
  delay,
  t,
}: MetricCardProps) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(400)}>
      <View style={styles.metricCard}>
        {/* Header */}
        <View style={styles.metricHeader}>
          <View style={styles.metricIconContainer}>
            <Icon size={24} color="#0D9488" />
          </View>
          <Text style={styles.metricTitle}>{title}</Text>
        </View>

        {/* Description */}
        <Text style={styles.metricDescription}>{description}</Text>

        {/* PCOS Impact */}
        <View style={styles.impactCard}>
          <Text style={styles.impactLabel}>{t('nutritionGuide.howItAffects')}</Text>
          <Text style={styles.impactText}>{pcosImpact}</Text>
        </View>

        {/* Good vs Bad */}
        <View style={styles.valuesRow}>
          <View style={styles.goodCard}>
            <Text style={styles.goodLabel}>{t('nutritionGuide.good')}</Text>
            <Text style={styles.goodText}>{goodValues}</Text>
          </View>
          <View style={styles.badCard}>
            <Text style={styles.badLabel}>{t('nutritionGuide.limit')}</Text>
            <Text style={styles.badText}>{badValues}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const NUTRITION_METRICS = [
  {
    icon: GlycemicIcon,
    title: 'Glycemic Index',
    description:
      'Measures how quickly a food raises blood sugar levels. Foods are rated low (55 or less), medium (56-69), or high (70+).',
    pcosImpact:
      'High glycemic foods cause rapid blood sugar spikes, triggering excess insulin production. This worsens insulin resistance, a core issue in PCOS, and can increase androgen levels.',
    goodValues: 'Low GI foods like vegetables, legumes, whole grains',
    badValues: 'White bread, sugary drinks, processed snacks',
  },
  {
    icon: SugarIcon,
    title: 'Sugar Content',
    description:
      'The amount of simple sugars in a food, including natural sugars (fructose, lactose) and added sugars.',
    pcosImpact:
      'Excess sugar directly spikes insulin levels, promoting fat storage and hormonal imbalance. It also increases inflammation and can worsen acne and weight gain associated with PCOS.',
    goodValues: 'Whole fruits, vegetables, unsweetened foods',
    badValues: 'Candy, soda, sweetened yogurts, pastries',
  },
  {
    icon: InflammatoryIcon,
    title: 'Inflammatory Score',
    description:
      'Rates how much a food promotes or reduces inflammation in the body, on a scale of 1-10 (lower is better).',
    pcosImpact:
      'PCOS is associated with chronic low-grade inflammation. Inflammatory foods can worsen symptoms like irregular periods, weight gain, and increase risk of cardiovascular issues.',
    goodValues: 'Fatty fish, leafy greens, berries, olive oil',
    badValues: 'Fried foods, processed meats, refined oils',
  },
  {
    icon: HormoneIcon,
    title: 'Hormone Impact',
    description:
      'Evaluates how a food may affect hormone levels, particularly insulin, androgens, and estrogen.',
    pcosImpact:
      'PCOS involves hormonal imbalance with elevated androgens. Foods that disrupt hormones can worsen symptoms like hirsutism, acne, hair loss, and menstrual irregularities.',
    goodValues: 'Flaxseeds, cruciferous vegetables, lean proteins',
    badValues: 'Soy in excess, dairy for some, processed foods',
  },
  {
    icon: FiberIcon,
    title: 'Fiber Content',
    description:
      'The amount of dietary fiber, which slows digestion, improves gut health, and helps regulate blood sugar.',
    pcosImpact:
      'Fiber helps slow glucose absorption, reducing insulin spikes. It also supports healthy gut bacteria, which play a role in hormone metabolism and weight management.',
    goodValues: 'Vegetables, legumes, whole grains, nuts',
    badValues: 'Refined grains, processed foods, fruit juices',
  },
  {
    icon: ProteinIcon,
    title: 'Protein Quality',
    description:
      'Measures the completeness and digestibility of protein, considering amino acid profile and source.',
    pcosImpact:
      'Adequate protein helps maintain muscle mass, supports metabolism, and promotes satiety. This can help with weight management and blood sugar control in PCOS.',
    goodValues: 'Fish, eggs, legumes, lean poultry',
    badValues: 'Processed meats, low-quality protein bars',
  },
  {
    icon: FatsIcon,
    title: 'Healthy Fats',
    description:
      'Indicates presence of beneficial fats like omega-3s and monounsaturated fats versus harmful trans and saturated fats.',
    pcosImpact:
      'Omega-3 fatty acids reduce inflammation and may help lower androgen levels. Healthy fats also support hormone production and help you feel full longer.',
    goodValues: 'Avocado, olive oil, salmon, walnuts',
    badValues: 'Trans fats, excessive saturated fats',
  },
  {
    icon: ProcessedIcon,
    title: 'Processing Level',
    description:
      'Rates how processed a food is, from minimally processed whole foods to ultra-processed products.',
    pcosImpact:
      'Ultra-processed foods often contain added sugars, unhealthy fats, and artificial ingredients that promote inflammation, insulin resistance, and weight gain.',
    goodValues: 'Whole foods, home-cooked meals',
    badValues: 'Fast food, packaged snacks, instant meals',
  },
];

export default function NutritionGuideScreen() {
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
          <Text style={styles.headerTitle}>{t('nutritionGuide.title')}</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Intro */}
          <Animated.View entering={FadeInUp.duration(400)} style={styles.introSection}>
            <Text style={styles.introTitle}>{t('nutritionGuide.intro.title')}</Text>
            <Text style={styles.introDescription}>
              {t('nutritionGuide.intro.description')}
            </Text>
          </Animated.View>

          {/* Metric Cards */}
          {NUTRITION_METRICS.map((metric, index) => (
            <MetricCard
              key={metric.title}
              icon={metric.icon}
              title={metric.title}
              description={metric.description}
              pcosImpact={metric.pcosImpact}
              goodValues={metric.goodValues}
              badValues={metric.badValues}
              delay={100 + index * 80}
              t={t}
            />
          ))}

          {/* Bottom Note */}
          <Animated.View entering={FadeInUp.delay(800).duration(400)}>
            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>{t('nutritionGuide.remember.title')}</Text>
              <Text style={styles.noteText}>
                {t('nutritionGuide.remember.message')}
              </Text>
            </View>
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
    padding: 16,
    paddingBottom: 40,
  },
  introSection: {
    marginBottom: 24,
  },
  introTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  introDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  metricCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  metricTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  metricDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  impactCard: {
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
  },
  impactLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  impactText: {
    fontSize: 14,
    color: '#A16207',
    lineHeight: 20,
  },
  valuesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  goodCard: {
    flex: 1,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  goodLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  goodText: {
    fontSize: 13,
    color: '#15803D',
    lineHeight: 18,
  },
  badCard: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  badLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 4,
  },
  badText: {
    fontSize: 13,
    color: '#DC2626',
    lineHeight: 18,
  },
  noteCard: {
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D9488',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#0F766E',
    lineHeight: 20,
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
