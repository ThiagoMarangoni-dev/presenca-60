import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '../theme';

// Recebe um label + todas as props normais do TextInput (value, onChangeText, placeholder...)
interface Props extends TextInputProps {
  label: string;
}

export function Input({ label, ...props }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor={colors.gray} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: 'bold', color: colors.text, marginBottom: 6 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    fontSize: 16,
  },
});
