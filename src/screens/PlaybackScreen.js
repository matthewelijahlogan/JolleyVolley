import {ScrollView, StyleSheet, Text, View} from 'react-native';
import Video from 'react-native-video';

import {NeonButton} from '../components/NeonButton';
import {PageHeader} from '../components/PageHeader';
import {
  blockCard,
  blockEyebrow,
  blockPanel,
  blockPanelAlt,
  blockTitle,
  blockTitleLarge,
  blockValue,
  colors,
  radii,
  spacing,
} from '../theme/theme';

function TrailDot({style, glow = 'pink'}) {
  const accent = glow === 'cyan' ? styles.cyanDot : styles.pinkDot;
  return <View style={[styles.trailDot, accent, style]} />;
}

function HitchFlag({style}) {
  return (
    <View style={[styles.hitchFlag, style]}>
      <Text style={styles.hitchFlagLabel}>HITCH</Text>
    </View>
  );
}

function TrackerStat({label, value}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export function PlaybackScreen({analysisResult, onGoHome, onOpenScreen, selectedVideo, trackingStatus}) {
  const handTrail = analysisResult?.overlayProfile?.handTrail || [];
  const ballTrail = analysisResult?.overlayProfile?.ballTrail || [];
  const ballTrackingApplied = analysisResult?.ballTrackingApplied;
  const hitchPoint = analysisResult?.hitchFrames >= 3 ? handTrail[Math.min(1, handTrail.length - 1)] : null;

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.safeArea}>
      <PageHeader onHomePress={onGoHome} />

      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>Visual Tool</Text>
        <Text style={styles.cardTitle}>Swing Tracker</Text>
        <Text style={styles.cardCopy}>
          {analysisResult?.trackingApplied
            ? ballTrackingApplied
              ? 'This view is using the tracked hand path and the direct tracked ball trail pulled from the current clip.'
              : 'This view is using the tracked hand path pulled from the current clip. The ball trail stays simulated until the direct ball pass locks on.'
            : 'This view is waiting on the machine-filled session read. Run Motion Lab analysis on a clip to replace the fallback hand path with the tracked sample.'}
        </Text>
      </View>

      <View style={styles.playerCard}>
        <View style={styles.playerFrame}>
          {selectedVideo && selectedVideo.uri ? (
            <>
              <Video controls paused resizeMode="contain" source={{uri: selectedVideo.uri}} style={styles.video} />
              {analysisResult ? (
                <View pointerEvents="none" style={styles.overlayLayer}>
                  <View style={styles.swingLane} />
                  <View style={styles.contactGate} />
                  {handTrail.map((point, index) => (
                    <TrailDot key={`hand-${index}`} style={{left: point.left, top: point.top}} />
                  ))}
                  {ballTrail.map((point, index) => (
                    <TrailDot glow="cyan" key={`ball-${index}`} style={{left: point.left, top: point.top}} />
                  ))}
                  {hitchPoint ? <HitchFlag style={{left: hitchPoint.left, top: hitchPoint.top}} /> : null}
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.emptyFrame}>
              <Text style={styles.emptyTitle}>No Clip Ready</Text>
              <Text style={styles.emptyCopy}>Load a video in the recorder first, then come back here for the swing tracker overlay.</Text>
            </View>
          )}
        </View>
      </View>

      {analysisResult ? (
        <>
          <View style={styles.statGrid}>
            <TrackerStat label="Tracking" value={analysisResult.trackingApplied ? 'Auto' : 'Pending AI'} />
            <TrackerStat label="Ball Trail" value={ballTrackingApplied ? 'Direct' : 'Simulated'} />
            <TrackerStat label="Hitch Frames" value={`${analysisResult.hitchFrames}`} />
            <TrackerStat
              label="MPH Source"
              value={analysisResult.ballSpeedSource === 'ball-track' ? 'Ball' : analysisResult.ballSpeedSource === 'tracked-estimate' ? 'Hand' : analysisResult.ballSpeedSource === 'derived-flight' ? 'Derived' : 'Pending'}
            />
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Current Swing Read</Text>
            <Text style={styles.infoCopy}>
              {analysisResult.hitchFrames >= 5
                ? 'The hand path is showing a major pause through the zone. Smooth the acceleration from load to contact.'
                : analysisResult.hitchFrames >= 3
                  ? 'There is a visible hitch in the motion, but the path is still recoverable with cleaner sequencing.'
                  : 'The hand path is moving cleanly through the zone with minimal interruption.'}
            </Text>
            <Text style={styles.infoMeta}>
              {analysisResult.trackingApplied
                ? ballTrackingApplied
                  ? `${analysisResult.dominantHand} hand tracked | ${analysisResult.trackedBallFrames} ball frames locked | ${analysisResult.ballSpeedMph} MPH direct read`
                  : `${analysisResult.dominantHand} hand tracked | ${analysisResult.trackedFrames}/${analysisResult.processedFrames} sampled frames | ball trail fallback`
                : trackingStatus === 'running'
                  ? 'Swing tracking is still processing the current clip.'
                  : 'This overlay is waiting on the machine-filled session read.'}
            </Text>
          </View>
        </>
      ) : null}

      <View style={styles.buttonStack}>
        <NeonButton label="Open Recorder" onPress={() => onOpenScreen('motion-lab')} />
        <NeonButton label="Open Ball Speed" onPress={() => onOpenScreen('ball-speed-tool')} tone="secondary" />
        <NeonButton label="Open Feedback" onPress={() => onOpenScreen('swing-feedback')} tone="secondary" />
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  card: {
    ...blockCard,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardEyebrow: {
    ...blockEyebrow,
    marginBottom: 6,
  },
  cardTitle: {
    ...blockTitleLarge,
    marginBottom: spacing.sm,
  },
  cardCopy: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  playerCard: {
    ...blockCard,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  playerFrame: {
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#030107',
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.28)',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlayLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  swingLane: {
    position: 'absolute',
    top: '14%',
    bottom: '12%',
    left: '43%',
    width: '18%',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.28)',
    backgroundColor: 'rgba(255, 63, 164, 0.08)',
  },
  contactGate: {
    position: 'absolute',
    top: '32%',
    left: '54%',
    width: '18%',
    height: '10%',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(126, 249, 255, 0.42)',
    backgroundColor: 'rgba(126, 249, 255, 0.08)',
  },
  trailDot: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: radii.round,
  },
  pinkDot: {
    backgroundColor: 'rgba(255, 63, 164, 0.78)',
    shadowColor: colors.primaryBright,
    shadowOpacity: 0.9,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 0},
  },
  cyanDot: {
    backgroundColor: 'rgba(126, 249, 255, 0.9)',
    shadowColor: colors.accent,
    shadowOpacity: 0.9,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 0},
  },
  hitchFlag: {
    position: 'absolute',
    marginLeft: -18,
    marginTop: -26,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 156, 156, 0.54)',
    backgroundColor: 'rgba(255, 95, 95, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  hitchFlagLabel: {
    color: '#FF9C9C',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  emptyFrame: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    ...blockTitle,
    fontSize: 22,
    marginBottom: spacing.sm,
  },
  emptyCopy: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    ...blockPanel,
    width: '48%',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  statValue: {
    ...blockValue,
    fontSize: 24,
  },
  infoCard: {
    ...blockPanelAlt,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoTitle: {
    ...blockTitle,
    fontSize: 22,
    marginBottom: 6,
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
  buttonStack: {
    gap: spacing.sm,
  },
});

