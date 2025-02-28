import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useQuranStore } from '../../store/quranStore';

interface IconButtonProps {
  name: string;
  size?: number;
  color?: string;
  onPress: () => void;
  style?: ViewStyle;
  active?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  name,
  size = 24,
  color = '#4B5563',
  onPress,
  style,
  active = false,
}) => {
  const { isDarkMode } = useQuranStore();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        ...styles.button,
        ...(isDarkMode ? styles.buttonDark : {}),
        ...(active ? styles.buttonActive : {}),
        ...style,
      }}
    >
      <Icon
        name={name}
        size={size}
        color={active ? '#10B981' : color}
        style={{
          transform: [{ scale: active ? 1.1 : 1 }],
          opacity: active ? 1 : 0.8,
        }}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  buttonDark: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  buttonActive: {
    backgroundColor: '#E8FFF7',
    borderColor: '#10B981',
  },
});
