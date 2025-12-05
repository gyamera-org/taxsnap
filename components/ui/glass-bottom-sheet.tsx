import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBar } from '@/context/tab-bar-provider';

export interface GlassBottomSheetRef {
  expand: () => void;
  close: () => void;
  snapToIndex: (index: number) => void;
}

interface GlassBottomSheetProps {
  children: React.ReactNode;
  snapPoints?: string[];
  onClose?: () => void;
  onChange?: (index: number) => void;
  enablePanDownToClose?: boolean;
  hideTabBar?: boolean;
  contentStyle?: ViewStyle;
}

// Custom background component with blur effect
const GlassBackground = () => (
  <View style={styles.backgroundContainer}>
    <BlurView intensity={80} tint="light" style={styles.blurView} />
    <View style={styles.glassOverlay} />
  </View>
);

export const GlassBottomSheet = forwardRef<GlassBottomSheetRef, GlassBottomSheetProps>(
  (
    {
      children,
      snapPoints: snapPointsProp = ['40%'],
      onClose,
      onChange,
      enablePanDownToClose = true,
      hideTabBar: shouldHideTabBar = true,
      contentStyle,
    },
    ref
  ) => {
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const { hideTabBar, showTabBar } = useTabBar();

    const snapPoints = useMemo(() => snapPointsProp, [snapPointsProp]);

    useImperativeHandle(ref, () => ({
      expand: () => {
        if (shouldHideTabBar) hideTabBar();
        bottomSheetRef.current?.present();
      },
      close: () => {
        bottomSheetRef.current?.dismiss();
      },
      snapToIndex: (index: number) => {
        bottomSheetRef.current?.snapToIndex(index);
      },
    }));

    const handleSheetChange = useCallback(
      (index: number) => {
        if (index === -1) {
          if (shouldHideTabBar) showTabBar();
          onClose?.();
        }
        onChange?.(index);
      },
      [showTabBar, shouldHideTabBar, onClose, onChange]
    );

    const handleDismiss = useCallback(() => {
      if (shouldHideTabBar) showTabBar();
      onClose?.();
    }, [showTabBar, shouldHideTabBar, onClose]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.4}
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose={enablePanDownToClose}
        backdropComponent={renderBackdrop}
        onChange={handleSheetChange}
        onDismiss={handleDismiss}
        backgroundComponent={GlassBackground}
        handleIndicatorStyle={styles.handleIndicator}
        style={styles.sheet}
      >
        <BottomSheetView
          style={[styles.sheetContent, { paddingBottom: insets.bottom + 20 }, contentStyle]}
        >
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

GlassBottomSheet.displayName = 'GlassBottomSheet';

const styles = StyleSheet.create({
  sheet: {
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 0,
  },
  handleIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    width: 40,
    height: 4,
  },
  sheetContent: {
    flex: 1,
  },
});
