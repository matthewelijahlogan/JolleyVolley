import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {NeonButton} from '../components/NeonButton';
import {PageHeader} from '../components/PageHeader';
import {colors, neonShadow, radii, spacing} from '../theme/theme';

function toNumber(value) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function MetricTile({label, value, detail}) {
  return (
    <View style={styles.metricTile}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricDetail}>{detail}</Text>
    </View>
  );
}

export function BallSpeedScreen({analysisInput, analysisResult, onGoHome, onOpenScreen, selectedVideo}) {
  const releaseFrames = toNumber(analysisInput.releaseFrames);
  const fps = toNumber(analysisInput.fps);
  const ballTravelFeet = toNumber(analysisInput.ballTravelFeet);
  const releaseTimeSeconds = fps > 0 ? releaseFrames / fps : 0;

  return (
    <ScrollView style={styles.safeArea} contentContainerStyle={styles.content}>
      <PageHeader onHomePress={onGoHome} />

      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>MPH Tool</Text>
        <Text style={styles.cardTitle}>Ball Speed</Text>
        <Text style={styles.cardCopy}>
          This tool isolates the ball-speed side of Motion Lab so the coach can focus on release timing, sample distance, and the current MPH estimate.
        </Text>
      </View>

      {analysisResult ? (
        <>
          <View style={styles.metricGrid}>
            <MetricTile
              detail="Current ball speed estimate from the active clip sample"
              label="MPH"
              value={`${analysisResult.ballSpeedMph}`}
            />
            <MetricTile
              detail="Frames to ball separation converted from FPS"
              label="Release Time"
              value={`${releaseTimeSeconds.toFixed(3)} s`}
            />
            <MetricTile
              detail="Distance sample used in the current MPH calculation"
              label="Ball Travel"
              value={`${ballTravelFeet.toFixed(1)} ft`}
            />
            <MetricTile
              detail="Frames per second from the current video sample"
              label="FPS"
              value={`${fps.toFixed(0)}`}
            />
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How This Tool Works</Text>
            <Text style={styles.infoCopy}>
              The current speed estimate uses ball travel divided by release time. Update ball travel, release frames, or FPS in the recorder and this tool updates with the new sample.
            </Text>
            <Text style={styles.infoMeta}>Current clip: {selectedVideo?.fileName || 'No clip selected'}</Text>
          </View>
        </>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No speed sample yet</Text>
          <Text style={styles.emptyBody}>Open the recorder, load a clip, and run the current analysis to populate this tool.</Text>
        </View>
      )}

      <View style={styles.buttonStack}>
        <NeonButton label="Open Recorder" onPress={() => onOpenScreen('motion-lab')} />
        <NeonButton label="Open Swing Tracker" onPress={() => onOpenScreen('swing-tracker')} tone="secondary" />
        <NeonButton label="Open Motion Stats" onPress={() => onOpenScreen('motion-stats')} tone="secondary" />
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
  infoCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(126, 249, 255, 0.18)',
    backgroundColor: 'rgba(17, 11, 28, 0.88)',
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoTitle: {
    color: colors.primarySoft,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  infoCopy: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.sm,
  },
  infoMeta: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 18,
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
