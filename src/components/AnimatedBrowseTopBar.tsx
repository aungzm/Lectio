import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrowseHeaderTitle } from './BrowseHeaderTitle';
import { useThemeColors } from '@/theme/useThemeColors';

interface AnimatedBrowseTopBarProps {
  title?: string;
  visible: boolean;
  leftSlot: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export function AnimatedBrowseTopBar({
  title,
  visible,
  leftSlot,
  rightSlot,
}: AnimatedBrowseTopBarProps) {
  const insets = useSafeAreaInsets();
  const { background } = useThemeColors();
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const expandedHeight = useMemo(() => insets.top + 56, [insets.top]);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, visible]);

  return (
    <Animated.View
      className="overflow-hidden"
      pointerEvents={visible ? 'auto' : 'none'}
      style={{
        backgroundColor: background,
        height: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, expandedHeight],
        }),
        opacity: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
        transform: [
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [-18, 0],
            }),
          },
        ],
      }}
    >
      <View
        className="px-4 pb-2"
        style={{
          paddingTop: insets.top + 8,
        }}
      >
        <View className="relative min-h-10 items-center justify-center">
          <View className="absolute left-0 top-0 bottom-0 justify-center">{leftSlot}</View>
          {title ? <BrowseHeaderTitle label={title} /> : <View className="h-10" />}
          <View className="absolute right-0 top-0 bottom-0 justify-center">{rightSlot}</View>
        </View>
      </View>
    </Animated.View>
  );
}
