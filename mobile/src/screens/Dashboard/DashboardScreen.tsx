import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AttendanceProgress } from '../../components/AttendanceProgress';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import type { MainTabScreenProps } from '../../navigation/types';
import { api, getErrorMessage } from '../../services/api';
import { colors, typeLabels } from '../../theme';
import type { Attendance, AttendanceType, MonthlySummary } from '../../types';
import { todayISO } from '../../utils/date';

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const TYPES: AttendanceType[] = ['OFFICE', 'REMOTE', 'ABSENCE'];

export function DashboardScreen({ navigation }: MainTabScreenProps<'Dashboard'>) {
  const { user } = useAuth();
  const [month, setMonth] = useState(() => todayISO().slice(0, 7));
  const [records, setRecords] = useState<Attendance[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const currentMonth = todayISO().slice(0, 7);
      setMonth(currentMonth);
      setLoading(true);
      setError('');
      setSummary(null);

      async function loadMonth() {
        try {
          const [recordsResponse, summaryResponse] = await Promise.all([
            api.get<Attendance[]>('/attendances/month', { params: { month: currentMonth } }),
            api.get<MonthlySummary>('/summary', { params: { month: currentMonth } }),
          ]);
          if (active) {
            setRecords(recordsResponse.data);
            setSummary(summaryResponse.data);
          }
        } catch (e) {
          if (active) setError(getErrorMessage(e));
        } finally {
          if (active) setLoading(false);
        }
      }

      void loadMonth();
      return () => { active = false; };
    }, [retry, user?.id, user?.targetPercent]),
  );

  const monthLabel = `${MONTHS[Number(month.slice(5)) - 1]} de ${month.slice(0, 4)}`;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Olá, {user?.name}!</Text>
      <Text style={styles.subtitle}>Resumo de {monthLabel.toLowerCase()}</Text>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.hint}>Carregando seu resumo...</Text>
        </View>
      ) : error ? (
        <View style={styles.card}>
          <Text style={styles.error}>{error}</Text>
          <Button title="Tentar novamente" onPress={() => setRetry((value) => value + 1)} />
        </View>
      ) : summary ? (
        <>
          <AttendanceProgress summary={summary} />
          <Text style={styles.cardTitle}>Registros do mês</Text>
          <Text style={styles.recordsHint}>Todos os registros, inclusive datas futuras e fins de semana.</Text>
          <View style={styles.row}>
            {TYPES.map((type) => (
              <View key={type} style={[styles.stat, { borderTopColor: typeLabels[type].color }]}>
                <Text style={[styles.count, { color: typeLabels[type].color }]}>
                  {records.filter((record) => record.type === type).length}
                </Text>
                <Text style={styles.statLabel}>{typeLabels[type].label}</Text>
              </View>
            ))}
          </View>
          {records.length === 0 ? (
            <Text style={styles.hint}>Nenhum registro neste mês. Registre sua primeira presença.</Text>
          ) : null}
        </>
      ) : null}

      <Button title="Registrar presença" onPress={() => navigation.navigate('RegisterAttendance')} />
      <Text style={styles.hint}>Use o Calendário e o Histórico para consultar ou editar seus registros.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: colors.background },
  title: { fontSize: 26, fontWeight: 'bold', color: colors.text },
  subtitle: { fontSize: 16, color: colors.gray, marginTop: 8, marginBottom: 24 },
  loading: { paddingVertical: 24 },
  recordsHint: { color: colors.gray, lineHeight: 20, marginTop: 8, marginBottom: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: {
    flex: 1,
    minWidth: 85,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    borderTopWidth: 4,
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  count: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 14, color: colors.text, marginTop: 4 },
  card: { backgroundColor: colors.white, borderRadius: 10, padding: 16, marginTop: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  hint: { color: colors.gray, marginTop: 12, lineHeight: 20 },
  error: { color: colors.danger },
});
