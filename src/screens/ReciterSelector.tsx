import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Feather';
import { useQuery } from 'react-query';
import { fetchAyahs, fetchReciters } from '../services/api';
import { useQuranStore } from '../store/quranStore';

export const ReciterSelector: React.FC = () => {
  const {
    currentReciter,
    setCurrentReciter,
    setCurrentSurahAyahs,
    currentSurah,
    audioSettings,
    isDarkMode,
  } = useQuranStore();

  const { data: reciters, isLoading } = useQuery('reciters', fetchReciters);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='small' color='#10B981' />
      </View>
    );
  }

  const arabicReciters = reciters?.filter((r) => r.language === 'ar') || [];

  const handleReciterChange = async (reciterId: string) => {
    const reciter = arabicReciters.find((r) => r.id === reciterId);
    if (reciter) {
      setCurrentReciter(reciter);
      const ayahs = await fetchAyahs(
        currentSurah?.number || 1,
        reciter.id,
        audioSettings.withTranslation
      );
      setCurrentSurahAyahs(ayahs);
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <Icon
        name='mic'
        size={24}
        color={isDarkMode ? '#10B981' : '#059669'}
        style={styles.icon}
      />
      <View
        style={[
          styles.pickerContainer,
          isDarkMode && styles.pickerContainerDark,
        ]}
      >
        <Picker
          selectedValue={currentReciter?.id || ''}
          onValueChange={handleReciterChange}
          style={[styles.picker, isDarkMode && styles.pickerDark]}
          dropdownIconColor={isDarkMode ? '#E2E8F0' : '#4B5563'}
          mode='dropdown'
        >
          <Picker.Item
            label='Select Reciter'
            value=''
            color={isDarkMode ? '#E2E8F0' : '#4B5563'}
          />
          {arabicReciters.map((reciter) => (
            <Picker.Item
              key={reciter.id}
              label={reciter.name}
              value={reciter.id}
              color={isDarkMode ? '#E2E8F0' : '#4B5563'}
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
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  containerDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    letterSpacing: 0.2,
    flex: 1,
  },
  textDark: {
    color: '#E2E8F0',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalContainerDark: {
    // backgroundColor: '#1F2937',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalTitleDark: {
    color: '#F1F5F9',
  },
  reciterItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  reciterItemActive: {
    backgroundColor: '#E5F7F0',
  },
  reciterItemActiveDark: {
    backgroundColor: '#064E3B',
  },
  reciterName: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '500',
  },
  reciterNameDark: {
    color: '#E2E8F0',
  },
  reciterNameActive: {
    color: '#10B981',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  icon: {
    width: 24,
    height: 24,
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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
    color: '#4B5563',
  },
  pickerDark: {
    color: '#E2E8F0',
    backgroundColor: '#1F2937',
  },
});
