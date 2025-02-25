import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useQuranStore } from '../store/quranStore';
import { SUPPORTED_LANGUAGES } from '../types/quran';

interface LanguageSelectorProps {
  onLanguageChange: (language: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  onLanguageChange,
}) => {
  const { audioSettings, isDarkMode } = useQuranStore();

  const languageOptions = SUPPORTED_LANGUAGES.map((language) => ({
    value: language.code,
    label: `${language.name} ${language.nativeName}`,
  }));

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isDarkMode && styles.labelDark]}>
        Translation:
      </Text>
      <View
        style={[
          styles.pickerContainer,
          isDarkMode && styles.pickerContainerDark,
        ]}
      >
        <Picker
          selectedValue={audioSettings.selectedLanguage}
          onValueChange={onLanguageChange}
          style={styles.picker}
          dropdownIconColor={isDarkMode ? '#E5E7EB' : '#4B5563'}
          mode='dropdown'
        >
          {languageOptions.map(({ value, label }) => (
            <Picker.Item
              key={value}
              label={label}
              value={value}
              color={isDarkMode ? '#E5E7EB' : '#4B5563'}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 14,
    color: '#4B5563',
    marginRight: 8,
  },
  labelDark: {
    color: '#E5E7EB',
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  pickerContainerDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  picker: {
    height: 40,
  },
});
