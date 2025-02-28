import axios from 'axios';
import { Surah, Ayah, Reciter, SUPPORTED_LANGUAGES } from '../types/quran';

const api = axios.create({
  baseURL: 'https://api.alquran.cloud/v1',
});

export const fetchSurahs = async (): Promise<Surah[]> => {
  const response = await api.get('/surah');
  return response.data.data;
};

export const fetchAyahs = async (
  surahNumber: number,
  reciter: string = 'ar.alafasy',
  withTranslation: boolean = false,
  language: string = 'ur'
): Promise<Ayah[]> => {
  // Get translation edition for text (non-audio)
  const languageConfig = SUPPORTED_LANGUAGES.find(
    (lang) => lang.code === language
  );
  const translationEdition = languageConfig?.edition || 'ur.khan';

  // First get all available reciters to find translation reciter
  const recitersResponse = await api.get('/edition/format/audio');
  const allReciters = recitersResponse.data.data;

  // Find audio reciter for the selected language
  const audioReciter = allReciters.find(
    (rec: any) => rec.language === language && rec.format === 'audio'
  );

  // Now fetch both Arabic and translations (text and audio)
  const [arabicResponse, translationTextResponse, translationAudioResponse] =
    await Promise.all([
      api.get(`/surah/${surahNumber}/${reciter}`),
      withTranslation
        ? api.get(`/surah/${surahNumber}/${translationEdition}`)
        : Promise.resolve({ data: { data: { ayahs: [] } } }), // Ensure it's never null
      withTranslation && audioReciter
        ? api.get(`/surah/${surahNumber}/${audioReciter.identifier}`)
        : Promise.resolve({ data: { data: { ayahs: [] } } }), // Ensure it's never null
    ]);

  const arabicAyahs = arabicResponse.data.data.ayahs;
  const translationTextAyahs = translationTextResponse.data.data.ayahs || [];
  const translationAudioAyahs = translationAudioResponse.data.data.ayahs || [];

  return arabicAyahs.map((ayah: any, index: number) => ({
    ...ayah,
    number: ayah.number,
    numberInSurah: ayah.numberInSurah,
    juz: ayah.juz,
    text: ayah.text,
    audio: ayah.audio,
    translations: {
      [language]: translationTextAyahs[index]?.text ?? '',
    },
    translationAudios: {
      [language]: translationAudioAyahs[index]?.audio ?? '',
    },
  }));
};

export const fetchReciters = async (): Promise<Reciter[]> => {
  const response = await api.get('/edition/format/audio');
  return response.data.data
    .map((reciter: any) => ({
      id: reciter.identifier,
      name: reciter.englishName,
      style: reciter.type,
      language: reciter.language,
      languageName: reciter.englishName,
    }))
    .filter(
      (reciter: Reciter) =>
        reciter.language === 'ar' || reciter.language !== 'ar'
    );
};

interface PrayerTime {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  date: string;
  hijri: string;
}

// export const fetchPrayerTimes = async (
//   latitude: number,
//   longitude: number
// ): Promise<PrayerTime> => {
//   try {
//     const today = new Date();
//     const date = today.getDate().toString().padStart(2, '0');
//     const month = (today.getMonth() + 1).toString().padStart(2, '0');
//     const year = today.getFullYear();
//     const dateStr = `${date}-${month}-${year}`;

//     const response = await fetch(
//       `http://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=2`
//     );

//     if (!response.ok) {
//       throw new Error('Failed to fetch prayer times');
//     }

//     const data = await response.json();
//     const timings = data.data.timings;
//     const hijriDate = data.data.date.hijri;

//     return {
//       Fajr: timings.Fajr,
//       Dhuhr: timings.Dhuhr,
//       Asr: timings.Asr,
//       Maghrib: timings.Maghrib,
//       Isha: timings.Isha,
//       date: data.data.date.readable,
//       hijri: `${hijriDate.day} ${hijriDate.month.ar} ${hijriDate.year} هـ`,
//     };
//   } catch (error) {
//     console.error('Error fetching prayer times:', error);
//     throw error;
//   }
// };
