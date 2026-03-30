import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {NeonButton} from '../components/NeonButton';
import {PageHeader} from '../components/PageHeader';
import {colors, neonShadow, radii, spacing} from '../theme/theme';

function MetricTile({label, value, detail}) {
  return (
    <View style={styles.metricTile}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricDetail}>{detail}</Text>
    </View>
  );
}

export function MetricsScreen({analysisInput, analysisResult, onGoHome, onOpenScreen, selectedVideo}) {
  return (
    <ScrollView style={styles.safeArea} contentContainerStyle={styles.content}>
      <PageHeader
        onHomePress={onGoHome}
        subtitle="Review the current metric calculations from the active clip and session settings."
        title="Jump + Speed"
      />

      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>Current Session</Text>
        <Text style={styles.cardTitle}>Metric Breakdown</Text>
        <Text style={styles.cardCopy}>
          These numbers are calculated from the current clip markers, making them easy to refine as you review the rep.
        </Text>
      </View>

      {analysisResult ? (
        <>
          <View style={styles.metricGrid}>
            <MetricTile
              detail="Contact reach minus standing reach"
              label="Vertical Leap"
              value={`${analysisResult.verticalLeapInches} in`}
            />
            <MetricTile
              detail="Ball travel distance over release time"
              label="Ball Speed"
              value={`${analysisResult.ballSpeedMph} MPH`}
            />
            <MetricTile
              detail="Pause severity through the swing"
              label="Hitch Severity"
              value={analysisResult.hitchSeverity}
            />
            <MetricTile
              detail="Current session contact timing label"
              label="Contact Point"
              value={analysisResult.contactPoint}
            />
          </View>

          <View style={styles.formulaCard}>
            <Text style={styles.formulaTitle}>Current Inputs</Text>
            <Text style={styles.formulaCopy}>Standing reach: {analysisInput.standingReachInches} in</Text>
            <Text style={styles.formulaCopy}>Contact reach: {analysisInput.contactReachInches} in</Text>
            <Text style={styles.formulaCopy}>Ball travel: {analysisInput.ballTravelFeet} ft</Text>
            <Text style={styles.formulaCopy}>Release frames: {analysisInput.releaseFrames}</Text>
            <Text style={styles.formulaCopy}>FPS: {analysisInput.fps}</Text>
            <Text style={styles.formulaCopy}>Current clip: {selectedVideo?.fileName || 'None selected'}</Text>
          </View>
        </>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No metrics yet</Text>
          <Text style={styles.emptyBody}>Run the Motion Lab analysis to populate this page.</Text>
        </View>
      )}

      <View style={styles.buttonStack}>
        <NeonButton label="Back To Motion Lab" onPress={() => onOpenScreen('motion-lab')} />
        <NeonButton label="Open Playback" onPress={() => onOpenScreen('neon-playback')} tone="secondary" />
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
  card: {
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
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  metricTile: {
    width: '48%',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: 'rgba(27, 7, 36, 0.92)',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  metricValue: {
    color: colors.primarySoft,
    fontFamily: 'Bangers',
    fontSize: 30,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  metricLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  metricDetail: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 20,
  },
  formulaCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(126, 249, 255, 0.18)',
    backgroundColor: 'rgba(17, 11, 28, 0.88)',
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  formulaTitle: {
    color: colors.primarySoft,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  formulaCopy: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  emptyCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: 'rgba(17, 11, 28, 0.9)',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 28,
    letterSpacing: 0.8,
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