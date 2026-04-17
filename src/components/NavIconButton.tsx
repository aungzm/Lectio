import React from 'react';
import { Pressable } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Menu, ChevronLeft } from 'lucide-react-native';

type NavIconButtonProps = {
  type: 'drawer' | 'back';
};

export default function NavIconButton({ type }: NavIconButtonProps) {
  const navigation = useNavigation();

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
      className="w-10 h-10 rounded-full bg-primary items-center justify-center active:opacity-70"
      style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } }}
    >
      <Icon size={20} color="#000000" strokeWidth={2} />
    </Pressable>
  );
}
