import axios from 'axios';

export interface PrayerTimes {
  timings: {
    Fajr: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
  date: string;
  hijri: string;
}

const api = axios.create({
  baseURL: 'https://api.aladhan.com/v1',
});

// Helper function to convert 24-hour format to 12-hour format with AM/PM
const convertTo12HourFormat = (time: string): string => {
  const [hour, minute] = time.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM case
  return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
};

export const fetchPrayerTimes = async (coords: {
  latitude: number;
  longitude: number;
}): Promise<PrayerTimes> => {
  const { latitude, longitude } = coords;

  // Format today's date as DD-MM-YYYY
  const today = new Date();
  const dateStr = [
    today.getDate().toString().padStart(2, '0'),
    (today.getMonth() + 1).toString().padStart(2, '0'),
    today.getFullYear(),
  ].join('-');

  const response = await api.get(`/timings/${dateStr}`, {
    params: {
      latitude,
      longitude,
      method: 1,
      adjustment: 1,
      school: 1,
      midnightMode: 0,
      timezonestring: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const { data } = response.data;
  const timings = data.timings;
  const hijri = data.date.hijri;

  // Format Hijri date with proper Arabic numerals
  const formatArabicNumber = (num: string | number) =>
    String(num).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);

  const hijriDate = `${formatArabicNumber(hijri.day)} ${
    hijri.month.ar
  } ${formatArabicNumber(hijri.year)}هـ`;

  return {
    timings: {
      Fajr: convertTo12HourFormat(timings.Fajr),
      Dhuhr: convertTo12HourFormat(timings.Dhuhr),
      Asr: convertTo12HourFormat(timings.Asr),
      Maghrib: convertTo12HourFormat(timings.Maghrib),
      Isha: convertTo12HourFormat(timings.Isha),
    },
    date: data.date.gregorian.date,
    hijri: hijriDate,
  };
};
