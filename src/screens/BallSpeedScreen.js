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

export function BallSpeedScreen({
  analysisInput,
  analysisResult,
  onGoHome,
  onOpenScreen,
  selectedVideo,
  trackingResult,
  trackingStatus,
}) {
  const releaseFrames = toNumber(analysisInput.releaseFrames);
  const fps = toNumber(analysisInput.fps);
  const ballTravelFeet = toNumber(analysisInput.ballTravelFeet);
  const releaseTimeSeconds = fps > 0 ? releaseFrames / fps : 0;
  const usingDirectBallTrack = analysisResult?.ballSpeedSource === 'ball-track';
  const usingTrackedEstimate = analysisResult?.ballSpeedSource === 'tracked-estimate';
  const directBallFrames = Number(analysisResult?.trackedBallFrames || trackingResult?.ballTrackedFrames || 0);
  const directBallQuality = Number(analysisResult?.ballTrackingQuality || trackingResult?.ballTrackingQuality || 0);
  const directBallTravel = Number(analysisResult?.detectedBallTravelFeet || trackingResult?.detectedBallTravelFeet || ballTravelFeet || 0);
  const directBallSpeed = Number(trackingResult?.detectedBallSpeedMph || analysisResult?.ballSpeedMph || 0);
  const trackedHandSpeed = Number(analysisResult?.peakHandSpeedMph || 0);
  const handTrackingQuality = Number(analysisResult?.trackingQuality || trackingResult?.trackingQuality || 0);

  return (
    <ScrollView style={styles.safeArea} contentContainerStyle={styles.content}>
      <PageHeader onHomePress={onGoHome} />

      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>MPH Tool</Text>
        <Text style={styles.cardTitle}>Ball Speed</Text>
        <Text style={styles.cardCopy}>
          This tool stays tied to the active Motion Lab clip. It now prefers the direct tracked ball trail, falls back to the tracked hand estimate when needed, and only uses the derived clip-timing sample when tracking is missing.
        </Text>
      </View>

      {analysisResult ? (
        <>
          <View style={styles.metricGrid}>
            <MetricTile
              detail={usingDirectBallTrack ? 'Directly measured from the tracked ball trail' : usingTrackedEstimate ? 'Estimated from the tracked swing model' : 'Calculated from ball travel and release time'}
              label="MPH"
              value={`${analysisResult.ballSpeedMph}`}
            />
            <MetricTile
              detail="Current source feeding the shared Motion Lab result"
              label="Source"
              value={usingDirectBallTrack ? 'Ball Track' : usingTrackedEstimate ? 'Hand Track' : analysisResult.ballSpeedSource === 'derived-flight' ? 'Derived' : 'Pending'}
            />
            <MetricTile
              detail={usingDirectBallTrack ? 'Tracked ball frames used in the direct speed read' : usingTrackedEstimate ? 'Peak hand speed from the tracked swing window' : 'Frames to ball separation converted from FPS'}
              label={usingDirectBallTrack ? 'Ball Frames' : usingTrackedEstimate ? 'Hand Speed' : 'Release Time'}
              value={usingDirectBallTrack ? `${directBallFrames.toFixed(0)}` : usingTrackedEstimate ? `${trackedHandSpeed.toFixed(1)} MPH` : `${releaseTimeSeconds.toFixed(3)} s`}
            />
            <MetricTile
              detail={usingDirectBallTrack ? 'Direct ball-track quality or travel distance' : usingTrackedEstimate ? 'Share of sampled frames the hand tracker locked onto' : 'Distance sample used in the current MPH calculation'}
              label={usingDirectBallTrack ? 'Ball Quality' : usingTrackedEstimate ? 'Track Quality' : 'Ball Travel'}
              value={usingDirectBallTrack ? `${Math.round(directBallQuality * 100)}%` : usingTrackedEstimate ? `${Math.round(handTrackingQuality * 100)}%` : `${ballTravelFeet.toFixed(1)} ft`}
            />
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Current Speed Read</Text>
            <Text style={styles.infoCopy}>
              {usingDirectBallTrack
                ? `The direct ball pass tracked ${directBallFrames.toFixed(0)} frames of ball flight and measured ${directBallSpeed.toFixed(1)} MPH off the current clip.`
                : usingTrackedEstimate
                  ? `The ball was not fully locked, so Motion Lab is using the tracked hand-speed model for the current ${analysisResult.ballSpeedMph} MPH estimate.`
                  : 'The current speed estimate is still using the derived clip-timing fallback until the ball read locks on more frames.'}
            </Text>
            <Text style={styles.infoMeta}>Current clip: {selectedVideo?.fileName || 'No clip selected'}</Text>
            <Text style={styles.infoMeta}>Tracking status: {trackingStatus === 'running' ? 'Tracking now' : trackingStatus === 'ready' ? 'Tracked clip ready' : 'Awaiting machine read'}</Text>
            {usingDirectBallTrack ? <Text style={styles.infoMeta}>Tracked ball travel: {directBallTravel.toFixed(1)} ft</Text> : null}
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
