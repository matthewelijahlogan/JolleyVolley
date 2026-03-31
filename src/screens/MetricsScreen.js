import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {NeonButton} from '../components/NeonButton';
import {PageHeader} from '../components/PageHeader';
import {
  formatMotionHistoryValue,
  getMotionHistoryMetric,
  hasMotionHistoryValue,
} from '../data/motionHistory';
import {colors, neonShadow, radii, spacing} from '../theme/theme';

function SummaryTile({label, value}) {
  return (
    <View style={styles.summaryTile}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function HistoryCard({entry, metricId}) {
  return (
    <View style={styles.historyCard}>
      <Text style={styles.historyLabel}>{entry.athleteName}</Text>
      <Text style={styles.historyValue}>{formatMotionHistoryValue(metricId, entry[metricId])}</Text>
      <Text style={styles.historyMeta}>{entry.date}</Text>
      <Text numberOfLines={1} style={styles.historyClip}>{entry.clipName}</Text>
      <Text numberOfLines={3} style={styles.historySummary}>{entry.summary}</Text>
    </View>
  );
}

export function MetricsScreen({
  analysisResult,
  historyMetricId,
  motionHistory,
  onGoHome,
  onOpenScreen,
}) {
  const metric = getMotionHistoryMetric(historyMetricId);
  const entries = (motionHistory || []).filter(entry => hasMotionHistoryValue(metric.id, entry[metric.id]));
  const currentValue = hasMotionHistoryValue(metric.id, analysisResult?.[metric.id])
    ? formatMotionHistoryValue(metric.id, analysisResult?.[metric.id])
    : 'Awaiting AI';

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.safeArea}>
      <PageHeader onHomePress={onGoHome} />

      <View style={styles.heroCard}>
        <Text style={styles.cardEyebrow}>Metric History</Text>
        <Text style={styles.cardTitle}>{metric.historyTitle}</Text>
        <Text style={styles.cardCopy}>
          One grid, one stat, one clean readout of what Motion Lab has stored so far.
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <SummaryTile label="Current" value={currentValue} />
        <SummaryTile label="Sessions" value={`${entries.length}`} />
      </View>

      {entries.length ? (
        <View style={styles.historyGrid}>
          {entries.map(entry => (
            <HistoryCard entry={entry} key={entry.id} metricId={metric.id} />
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No history yet</Text>
          <Text style={styles.emptyBody}>{metric.emptyMessage}</Text>
        </View>
      )}

      <View style={styles.buttonStack}>
        <NeonButton label="Back to Motion Lab" onPress={() => onOpenScreen('motion-lab')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  heroCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...neonShadow,
  },
  cardEyebrow: {
    color: colors.accent,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 34,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  cardCopy: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  summaryTile: {
    width: '48%',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: 'rgba(24, 10, 34, 0.92)',
    padding: spacing.md,
  },
  summaryLabel: {
    color: colors.textDim,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  summaryValue: {
    color: colors.primarySoft,
    fontFamily: 'Bangers',
    fontSize: 28,
    letterSpacing: 0.7,
  },
  historyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  historyCard: {
    width: '48%',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(126, 249, 255, 0.18)',
    backgroundColor: 'rgba(14, 7, 23, 0.84)',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  historyLabel: {
    color: colors.accent,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  historyValue: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 26,
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  historyMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 2,
  },
  historyClip: {
    color: colors.text,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  historySummary: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 18,
  },
  emptyCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(126, 249, 255, 0.18)',
    backgroundColor: 'rgba(14, 7, 23, 0.84)',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 30,
    letterSpacing: 0.7,
    marginBottom: spacing.xs,
  },
  emptyBody: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  buttonStack: {
    gap: spacing.sm,
  },
});
