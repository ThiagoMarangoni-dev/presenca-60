import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from './src/theme';

// Tela provisória: as telas de verdade são ligadas aqui quando a navegação ficar pronta
export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>Presença 60</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.primary },
});
