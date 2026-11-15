import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../theme';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  color?: string;
}

// Botão reutilizável: tudo que muda vem pelas props
export function Button({ title, onPress, loading = false, color = colors.primary }: Props) {
  return (
    <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onPress} disabled={loading}>
      {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.text}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { height: 50, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  text: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
});
