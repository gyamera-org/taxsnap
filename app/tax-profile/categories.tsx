import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useAccount, useUpdateAccount } from '@/lib/hooks/use-accounts';
import { PageLayout } from '@/components/layouts';
import { SaveButton } from '@/components/ui/form-page';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Check, FileText, Info, Megaphone, Car, Users, FileCheck, Shield, Scale, Laptop, Building, Package, Plane, Utensils, Wifi, Home, MoreHorizontal } from 'lucide-react-native';
import { useThemedColors } from '@/lib/utils/theme';
import { useRouter } from 'expo-router';
import { TAX_CATEGORIES, COMMON_CATEGORIES } from '@/lib/constants/categories';

// UI styling for categories (icons and colors)
const CATEGORY_UI: Record<string, { icon: typeof Megaphone; color: string }> = {
  advertising: { icon: Megaphone, color: '#EC4899' },
  car_truck: { icon: Car, color: '#8B5CF6' },
  commissions_fees: { icon: Users, color: '#3B82F6' },
  contract_labor: { icon: FileCheck, color: '#06B6D4' },
  insurance: { icon: Shield, color: '#10B981' },
  legal_professional: { icon: Scale, color: '#6366F1' },
  office_expense: { icon: Laptop, color: '#F59E0B' },
  rent_property: { icon: Building, color: '#EF4444' },
  supplies: { icon: Package, color: '#84CC16' },
  travel: { icon: Plane, color: '#0EA5E9' },
  meals: { icon: Utensils, color: '#F97316' },
  utilities: { icon: Wifi, color: '#A855F7' },
  home_office: { icon: Home, color: '#14B8A6' },
  other: { icon: MoreHorizontal, color: '#64748B' },
};

// Filter to show only common/relevant categories for user selection
const SELECTABLE_CATEGORIES = TAX_CATEGORIES.filter((cat) =>
  COMMON_CATEGORIES.includes(cat.id as any) || ['home_office', 'contract_labor', 'insurance', 'rent_property', 'other'].includes(cat.id)
);

export default function CategoriesScreen() {
  const { t } = useTranslation();
  const colors = useThemedColors();
  const router = useRouter();
  const { data: account, isLoading } = useAccount();
  const updateAccount = useUpdateAccount();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (account?.onboarding_current_tracking) {
      try {
        const parsed = JSON.parse(account.onboarding_current_tracking);
        if (Array.isArray(parsed)) {
          setSelectedCategories(parsed);
        }
      } catch {
        setSelectedCategories([]);
      }
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      let originalCategories: string[] = [];
      if (account.onboarding_current_tracking) {
        try {
          const parsed = JSON.parse(account.onboarding_current_tracking);
          if (Array.isArray(parsed)) {
            originalCategories = parsed;
          }
        } catch {
          // ignore
        }
      }
      const changed = JSON.stringify(selectedCategories.sort()) !== JSON.stringify(originalCategories.sort());
      setHasChanges(changed);
    }
  }, [selectedCategories, account]);

  const handleToggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategories((prev) =>
      prev.includes(id)
        ? prev.filter((c) => c !== id)
        : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    try {
      await updateAccount.mutateAsync({
        onboarding_current_tracking: JSON.stringify(selectedCategories),
      });
      router.back();
    } catch {
      // Error handled by mutation
    }
  };

  const selectedCount = selectedCategories.length;

  return (
    <PageLayout
      title={t('taxProfile.expenseCategories')}
      showBackButton
      rightAction={
        <SaveButton onPress={handleSave} disabled={!hasChanges} loading={updateAccount.isPending} />
      }
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <FileText size={28} color="#3B82F6" />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Schedule C Categories
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {t('taxProfile.expenseCategoriesHint')}
          </Text>
        </View>

        {/* Selection Counter */}
        <View style={[styles.counter, { backgroundColor: `${colors.primary}10` }]}>
          <Text style={[styles.counterText, { color: colors.primary }]}>
            {selectedCount} {selectedCount === 1 ? 'category' : 'categories'} selected
          </Text>
        </View>

        {/* Categories Grid */}
        <View style={styles.categoriesGrid}>
          {SELECTABLE_CATEGORIES.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            const ui = CATEGORY_UI[category.id] || { icon: MoreHorizontal, color: '#64748B' };
            const Icon = ui.icon;
            const color = ui.color;
            return (
              <Pressable
                key={category.id}
                onPress={() => handleToggle(category.id)}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: isSelected ? `${color}10` : colors.card,
                    borderColor: isSelected ? color : colors.cardBorder,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                <View style={styles.categoryTop}>
                  <View style={[styles.categoryIcon, { backgroundColor: `${color}15` }]}>
                    <Icon size={20} color={color} />
                  </View>
                  {isSelected && (
                    <View style={[styles.checkCircle, { backgroundColor: color }]}>
                      <Check size={10} color="#fff" strokeWidth={3} />
                    </View>
                  )}
                </View>
                <Text
                  style={[styles.categoryName, { color: isSelected ? color : colors.text }]}
                  numberOfLines={2}
                >
                  {category.name}
                </Text>
                <Text style={[styles.categoryLine, { color: colors.textMuted }]}>
                  Line {category.line}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Info Note */}
        <View style={[styles.infoCard, { backgroundColor: colors.backgroundSecondary }]}>
          <Info size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {t('taxProfile.scheduleCNote')}
          </Text>
        </View>
      </ScrollView>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  counter: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  counterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    padding: 14,
    borderRadius: 14,
  },
  categoryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    lineHeight: 18,
  },
  categoryLine: {
    fontSize: 11,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
