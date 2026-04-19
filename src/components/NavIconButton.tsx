import React from 'react';
import { Pressable } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Menu, ChevronLeft } from 'lucide-react-native';
import { useThemeColors } from '@/theme/useThemeColors';

type NavIconButtonProps = {
  type: 'drawer' | 'back';
};

export default function NavIconButton({ type }: NavIconButtonProps) {
  const navigation = useNavigation();
  const { background, secondary } = useThemeColors();

  const onPress = () => {
    if (type === 'drawer') {
      navigation.dispatch(DrawerActions.toggleDrawer());
    } else {
      navigation.goBack();
    }
  };

  const Icon = type === 'drawer' ? Menu : ChevronLeft;

  return (
    <Pressable
      onPress={onPress}
      className="h-10 w-10 items-center justify-center rounded-full bg-primary active:opacity-70"
      style={{
        elevation: 2,
        shadowColor: background,
        shadowOpacity: 0.12,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <Icon size={20} color={secondary} strokeWidth={2} />
    </Pressable>
  );
}
