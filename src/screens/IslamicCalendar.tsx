import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useQuranStore } from '../store/quranStore';

class HijriDate {
  private date: Date;
  private hijriYear: number;
  private hijriMonth: number;
  private hijriDay: number;

  constructor(date: Date = new Date()) {
    this.date = date;
    const [year, month, day] = this.gregorianToHijri(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
    this.hijriYear = year;
    this.hijriMonth = month - 1; // 0-based month
    this.hijriDay = day;
  }

  private gregorianToHijri(
    year: number,
    month: number,
    day: number
  ): [number, number, number] {
    const jd = this.gregorianToJulian(year, month, day);
    return this.julianToHijri(jd);
  }

  private gregorianToJulian(year: number, month: number, day: number): number {
    if (month < 3) {
      year -= 1;
      month += 12;
    }
    const a = Math.floor(year / 100);
    const b = 2 - a + Math.floor(a / 4);
    return (
      Math.floor(365.25 * (year + 4716)) +
      Math.floor(30.6001 * (month + 1)) +
      day +
      b -
      1524.5
    );
  }

  private julianToHijri(jd: number): [number, number, number] {
    jd = Math.floor(jd) + 0.5;
    const year = Math.floor((30 * (jd - 1948439.5) + 10646) / 10631);
    const month = Math.min(
      12,
      Math.ceil((jd - (29 + this.hijriToJulian(year, 1, 1))) / 29.5) + 1
    );
    const day = Math.ceil(jd - this.hijriToJulian(year, month, 1)) + 1;
    return [year, month, day];
  }

  private hijriToJulian(year: number, month: number, day: number): number {
    return (
      day +
      Math.ceil(29.5 * (month - 1)) +
      (year - 1) * 354 +
      Math.floor((3 + 11 * year) / 30) +
      1948439.5 -
      1
    );
  }

  public getYear(): number {
    return this.hijriYear;
  }

  public getMonth(): number {
    return this.hijriMonth;
  }

  public getDate(): number {
    return this.hijriDay;
  }

  public getDaysInMonth(): number {
    // Simplified calculation - alternating 30 and 29 days
    return this.hijriMonth % 2 === 0 ? 30 : 29;
  }

  public getDay(): number {
    return this.date.getDay();
  }

  static fromDate(year: number, month: number, day: number): HijriDate {
    const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    return new HijriDate(date);
  }
}

export const IslamicCalendar: React.FC = () => {
  const { isDarkMode } = useQuranStore();
  const today = new HijriDate();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  const currentYear = today.getYear();

  const daysInMonth = today.getDaysInMonth();
  const firstDayOfMonth = HijriDate.fromDate(currentYear, currentMonth, 1);
  const startDay = firstDayOfMonth.getDay();

  const monthNames = [
    'Muharram',
    'Safar',
    'Rabi al-Awwal',
    'Rabi al-Thani',
    'Jumada al-Awwal',
    'Jumada al-Thani',
    'Rajab',
    'Shaban',
    'Ramadan',
    'Shawwal',
    'Dhu al-Qadah',
    'Dhu al-Hijjah',
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const renderCalendarDays = () => {
    const days = [];
    let dayCount = 1;
    const totalSlots = Math.ceil((daysInMonth + startDay) / 7) * 7;

    for (let i = 0; i < totalSlots; i++) {
      if (i < startDay || dayCount > daysInMonth) {
        days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
      } else {
        const isToday = dayCount === currentDay;
        days.push(
          <View key={dayCount} style={styles.dayCell}>
            <View
              style={[
                styles.dayContent,
                isToday && styles.todayContent,
                isDarkMode && styles.dayContentDark,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  isToday && styles.todayText,
                  isDarkMode && styles.textLight,
                ]}
              >
                {dayCount}
              </Text>
            </View>
          </View>
        );
        dayCount++;
      }
    }

    return days;
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.header}>
        <Icon name='calendar' size={24} color='#10B981' />
        <Text style={[styles.title, isDarkMode && styles.textLight]}>
          Islamic Calendar
        </Text>
      </View>

      <View style={styles.monthHeader}>
        <Text style={[styles.monthTitle, isDarkMode && styles.textLight]}>
          {monthNames[currentMonth]} {currentYear}
        </Text>
      </View>

      <View style={styles.calendar}>
        <View style={styles.weekDays}>
          {weekDays.map((day) => (
            <View key={day} style={styles.weekDayCell}>
              <Text
                style={[styles.weekDayText, isDarkMode && styles.textLight]}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.daysGrid}>{renderCalendarDays()}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  containerDark: {
    backgroundColor: '#1F2937',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 12,
  },
  monthHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  calendar: {
    width: '100%',
  },
  weekDays: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 4,
  },
  dayContent: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayContentDark: {
    backgroundColor: '#374151',
  },
  todayContent: {
    backgroundColor: '#10B981',
  },
  dayText: {
    fontSize: 16,
    color: '#111827',
  },
  todayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  textLight: {
    color: '#E5E7EB',
  },
});
