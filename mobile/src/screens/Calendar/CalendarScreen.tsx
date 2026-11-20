import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api, getErrorMessage } from '../../services/api';
import { Attendance } from '../../types';
import { colors, typeLabels } from '../../theme';
import type { MainTabScreenProps } from '../../navigation/types';

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const WEEK_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function CalendarScreen({ navigation }: MainTabScreenProps<'Calendar'>) {
  const [currentDate, setCurrentDate] = useState(new Date()); // mês que está aparecendo
  const [records, setRecords] = useState<Attendance[]>([]);
  const [error, setError] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 = janeiro
  const monthText = `${year}-${String(month + 1).padStart(2, '0')}`; // "2026-11"

  async function loadMonth() {
    try {
      const response = await api.get('/attendances/month', { params: { month: monthText } });
      setRecords(response.data);
      setError('');
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  // Recarrega quando a tela aparece e quando o mês muda
  useFocusEffect(
    useCallback(() => {
      loadMonth();
    }, [monthText]),
  );

  function changeMonth(amount: number) {
    setCurrentDate(new Date(year, month + amount, 1));
  }

  // Monta as células: espaços vazios antes do dia 1 + os dias do mês
  const firstWeekDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekDay; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);

  function handleDayPress(day: number) {
    const date = `${monthText}-${String(day).padStart(2, '0')}`;
    const record = records.find((r) => r.date === date);
    // Se já tem registro, abre para editar. Se não, abre para criar com a data escolhida
    navigation.navigate('RegisterAttendance', record ? { record } : { date });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeMonth(-1)}>
          <Text style={styles.arrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{MONTHS[month]} {year}</Text>
        <TouchableOpacity onPress={() => changeMonth(1)}>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.grid}>
        {WEEK_DAYS.map((d, index) => (
          <Text key={index} style={styles.weekDay}>{d}</Text>
        ))}

        {cells.map((day, index) => {
          if (day === null) {
            return <View key={index} style={styles.cell} />;
          }
          const date = `${monthText}-${String(day).padStart(2, '0')}`;
          const record = records.find((r) => r.date === date);
          const color = record ? typeLabels[record.type].color : colors.white;
          return (
            <TouchableOpacity key={index} style={styles.cell} onPress={() => handleDayPress(day)}>
              <View style={[styles.day, { backgroundColor: color }]}>
                <Text style={{ color: record ? colors.white : colors.text, fontWeight: 'bold' }}>{day}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.legend}>
        <Text style={{ color: typeLabels.OFFICE.color }}>■ Escritório   </Text>
        <Text style={{ color: typeLabels.REMOTE.color }}>■ Remoto   </Text>
        <Text style={{ color: typeLabels.ABSENCE.color }}>■ Folga</Text>
      </Text>
      <Text style={styles.hint}>Toque em um dia para registrar ou editar</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  arrow: { fontSize: 40, color: colors.primary, paddingHorizontal: 16 },
  monthTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  error: { color: colors.danger },
  grid: { flexDirection: 'row', flexWrap: 'wrap' }, // 7 colunas
  weekDay: { width: '14.28%', textAlign: 'center', fontWeight: 'bold', color: colors.gray, paddingVertical: 8 },
  cell: { width: '14.28%', aspectRatio: 1, padding: 3 }, // 100% / 7 dias = 14.28%
  day: { flex: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  legend: { textAlign: 'center', marginTop: 16, fontWeight: 'bold' },
  hint: { textAlign: 'center', color: colors.gray, marginTop: 8 },
});
