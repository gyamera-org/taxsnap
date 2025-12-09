import { View, Text, Pressable, StyleSheet } from 'react-native';
import { X, Zap, ZapOff, HelpCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface CameraHeaderProps {
  title?: string;
  flash: boolean;
  onClose: () => void;
  onToggleFlash: () => void;
  onHelp?: () => void;
}

export function CameraHeader({
  title,
  flash,
  onClose,
  onToggleFlash,
  onHelp,
}: CameraHeaderProps) {
  const { t } = useTranslation();
  const displayTitle = title || t('scan.title');
  return (
    <View style={styles.container}>
      <Pressable onPress={onClose} style={styles.button}>
        <X size={24} color="#FFFFFF" />
      </Pressable>
      <Text style={styles.title}>{displayTitle}</Text>
      <View style={styles.rightButtons}>
        {onHelp && (
          <Pressable onPress={onHelp} style={styles.button}>
            <HelpCircle size={22} color="#FFFFFF" />
          </Pressable>
        )}
        <Pressable onPress={onToggleFlash} style={styles.button}>
          {flash ? (
            <Zap size={22} color="#FFD700" fill="#FFD700" />
          ) : (
            <ZapOff size={22} color="#FFFFFF" />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
