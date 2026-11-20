import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api, getErrorMessage } from '../services/api';
import { Attendance } from '../types';
import { colors, typeLabels } from '../theme';
import { isoToBR } from '../utils/date';

export function HistoryScreen({ navigation }: any) {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [error, setError] = useState('');

  async function loadRecords() {
    try {
      const response = await api.get('/attendances'); // READ
      setRecords(response.data);
      setError('');
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  // Recarrega toda vez que a tela aparece
  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, []),
  );

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={records}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum registro ainda</Text>}
        renderItem={({ item }) => (
          // Ao tocar, abre a tela de registro passando o item como parâmetro (para editar)
          <TouchableOpacity
            style={[styles.item, { borderLeftColor: typeLabels[item.type].color }]}
            onPress={() => navigation.navigate('RegisterAttendance', { record: item })}
          >
            <Text style={styles.date}>{isoToBR(item.date)}</Text>
            <Text style={{ color: typeLabels[item.type].color, fontWeight: 'bold' }}>{typeLabels[item.type].label}</Text>
            {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  error: { color: colors.danger, marginBottom: 12 },
  empty: { textAlign: 'center', color: colors.gray, marginTop: 32 },
  item: {
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 6,
  },
  date: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  note: { color: colors.gray, marginTop: 4 },
});
