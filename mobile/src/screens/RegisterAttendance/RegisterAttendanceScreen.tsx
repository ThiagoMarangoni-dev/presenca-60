import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api, getErrorMessage } from '../../services/api';
import { AttendanceType } from '../../types';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { colors, typeLabels } from '../../theme';
import { brToISO, isoToBR, todayISO } from '../../utils/date';

const TYPES: AttendanceType[] = ['OFFICE', 'REMOTE', 'ABSENCE'];

// Tela usada para CRIAR (sem record) e para EDITAR/EXCLUIR (com record nos parâmetros)
export function RegisterAttendanceScreen({ route, navigation }: any) {
  const record = route.params?.record;           // registro a editar (vem do Histórico ou Calendário)
  const startDate = route.params?.date || todayISO(); // data clicada no Calendário

  const [date, setDate] = useState(isoToBR(record ? record.date : startDate));
  const [type, setType] = useState<AttendanceType>(record ? record.type : 'OFFICE');
  const [note, setNote] = useState(record?.note || '');
  const [error, setError] = useState('');

  async function handleSave() {
    const isoDate = brToISO(date);
    if (!isoDate) {
      setError('Digite a data no formato DD/MM/AAAA');
      return;
    }
    try {
      const data = { date: isoDate, type, note };
      if (record) {
        await api.put(`/attendances/${record.id}`, data); // UPDATE
      } else {
        await api.post('/attendances', data);              // CREATE
      }
      navigation.goBack();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  function handleDelete() {
    Alert.alert('Excluir', 'Deseja excluir este registro?', [
      { text: 'Cancelar' },
      {
        text: 'Excluir',
        onPress: async () => {
          await api.delete(`/attendances/${record.id}`);   // DELETE
          navigation.goBack();
        },
      },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Input label="Data" value={date} onChangeText={setDate} placeholder="DD/MM/AAAA" />

      <Text style={styles.label}>Onde você trabalhou?</Text>
      <View style={styles.row}>
        {TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.option, type === t && { backgroundColor: typeLabels[t].color }]}
            onPress={() => setType(t)}
          >
            <Text style={[styles.optionText, type === t && { color: colors.white }]}>{typeLabels[t].label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input label="Observação (opcional)" value={note} onChangeText={setNote} placeholder="Ex.: reunião com o time" />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Salvar" onPress={handleSave} />
      {record && <Button title="Excluir" onPress={handleDelete} color={colors.danger} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  label: { fontSize: 14, fontWeight: 'bold', color: colors.text, marginBottom: 6 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  option: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  optionText: { fontWeight: 'bold', color: colors.text },
  error: { color: colors.danger, textAlign: 'center' },
});
