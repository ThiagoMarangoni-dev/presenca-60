import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import type { MonthlySummary } from '../types';
import { isoToBR } from '../utils/date';

interface Props {
  summary: MonthlySummary;
}

export function AttendanceProgress({ summary }: Props) {
  if (summary.eligibleDays <= 0 || summary.attendancePercent === null) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Sua presença neste mês</Text>
        <Text style={styles.description}>Sem dias úteis considerados neste mês.</Text>
        <Text style={styles.hint}>O cálculo considera os dias de segunda a sexta do mês, descontando as folgas registradas.</Text>
      </View>
    );
  }

  const percent = Math.min(100, Math.max(0, summary.attendancePercent));
  const target = Math.min(100, Math.max(0, summary.targetPercent));
  const formattedPercent = summary.attendancePercent.toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
  });
  const progressColor = summary.targetReached ? colors.success : colors.primary;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Sua presença neste mês</Text>
      <View style={styles.percentageRow}>
        <Text style={[styles.percentage, { color: progressColor }]}>{formattedPercent}%</Text>
        <Text style={styles.description}>realizados</Text>
      </View>
      <Text style={styles.target}>Meta do mês: {summary.targetPercent}%</Text>

      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Presença realizada neste mês"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: percent,
          text: `${formattedPercent}% realizados. Meta de ${summary.targetPercent}%.`,
        }}
        style={styles.meter}
      >
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${percent}%`, backgroundColor: progressColor }]} />
        </View>
        <View style={[styles.marker, { left: `${target}%` }]} />
      </View>
      <View style={styles.scale} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Text style={styles.scaleLabel}>0%</Text>
        <Text style={styles.scaleLabel}>100%</Text>
      </View>
      <View style={styles.markerLegend}>
        <View style={styles.legendMark} />
        <Text style={styles.hint}>Marca da sua meta</Text>
      </View>

      <Text style={styles.days}>
        {summary.officeDays} de {summary.requiredDays} {summary.requiredDays === 1 ? 'dia necessário' : 'dias necessários'} no escritório
      </Text>
      {summary.targetReached ? (
        <Text style={styles.success}>Meta do mês alcançada!</Text>
      ) : (
        <Text style={styles.description}>
          {summary.remainingDays === 1 ? 'Falta 1 dia' : `Faltam ${summary.remainingDays} dias`} para atingir sua meta.
        </Text>
      )}

      <Text style={styles.hint}>
        O cálculo considera {summary.eligibleDays} {summary.eligibleDays === 1 ? 'dia útil' : 'dias úteis'} no mês, descontando as folgas.
      </Text>
      <Text style={styles.hint}>Presenças registradas até {isoToBR(summary.referenceDate)}. Datas futuras e fins de semana não contam como presença realizada.</Text>
      <Text style={styles.hint}>Você pode alterar a meta na aba Perfil.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 24 },
  title: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  percentageRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  percentage: { fontSize: 40, fontWeight: 'bold' },
  target: { color: colors.text, fontSize: 16, marginTop: 4 },
  meter: { position: 'relative', marginTop: 24 },
  track: { height: 12, backgroundColor: colors.border, borderRadius: 6, overflow: 'hidden' },
  fill: { height: 12, borderRadius: 6 },
  marker: {
    position: 'absolute',
    top: -5,
    bottom: -5,
    width: 4,
    backgroundColor: colors.text,
    borderColor: colors.white,
    borderWidth: 1,
    borderRadius: 2,
    transform: [{ translateX: -2 }],
  },
  scale: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  scaleLabel: { color: colors.gray, fontSize: 12 },
  markerLegend: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  legendMark: { width: 3, height: 14, backgroundColor: colors.text, borderRadius: 2 },
  days: { color: colors.text, fontWeight: 'bold', fontSize: 16, marginTop: 20, lineHeight: 24 },
  description: { color: colors.text, fontSize: 16, marginTop: 8, lineHeight: 24 },
  success: { color: colors.success, fontWeight: 'bold', fontSize: 16, marginTop: 8, lineHeight: 24 },
  hint: { color: colors.gray, marginTop: 8, lineHeight: 20, flexShrink: 1 },
});
