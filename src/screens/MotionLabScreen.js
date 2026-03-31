import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Video from 'react-native-video';

import {NeonButton} from '../components/NeonButton';
import {PageHeader} from '../components/PageHeader';
import {colors, neonShadow, radii, spacing} from '../theme/theme';

function formatPercent(value) {
  return `${Math.round(Number(value || 0) * 100)}%`;
}

function formatContactPoint(value) {
  if (value === 'in-front') {
    return 'In Front';
  }

  if (value === 'behind') {
    return 'Behind';
  }

  return 'Ideal';
}

function formatLandingStability(value) {
  if (value === 'off-balance') {
    return 'Off Balance';
  }

  if (value === 'steady') {
    return 'Steady';
  }

  return 'Awaiting AI';
}

function toMachineValue(value, suffix = '') {
  if (`${value ?? ''}`.trim().length === 0) {
    return 'Awaiting AI';
  }

  return suffix ? `${value}${suffix}` : `${value}`;
}

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

function MetricTile({label, value, detail}) {
  return (
    <View style={styles.metricTile}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricDetail}>{detail}</Text>
    </View>
  );
}

function AssessmentTile({item}) {
  return (
    <View style={styles.assessmentTile}>
      <Text style={styles.assessmentTileLabel}>{item.label}</Text>
      <Text style={styles.assessmentTileValue}>{item.value}</Text>
      <Text style={styles.assessmentTileStatus}>{item.status}</Text>
    </View>
  );
}

function AdviceRow({item}) {
  return (
    <View style={styles.adviceRow}>
      <View style={styles.adviceDot} />
      <View style={styles.adviceTextWrap}>
        <Text style={styles.adviceTitle}>{item.title}</Text>
        <Text style={styles.adviceBody}>{item.body}</Text>
      </View>
    </View>
  );
}

function MachineReadCard({label, value, detail}) {
  return (
    <View style={styles.machineReadCard}>
      <Text style={styles.machineReadLabel}>{label}</Text>
      <Text style={styles.machineReadValue}>{value}</Text>
      <Text style={styles.machineReadDetail}>{detail}</Text>
    </View>
  );
}

export function MotionLabScreen({
  analysisInput,
  analysisResult,
  onAnalyzeRep,
  onGoHome,
  onSelectVideo,
  selectedVideo,
  trackingError,
  trackingResult,
  trackingStatus,
}) {
  const handleCameraLaunch = async () => {
    const result = await launchCamera({
      mediaType: 'video',
      durationLimit: 20,
      saveToPhotos: true,
      videoQuality: 'high',
    });

    if (result.didCancel) {
      return;
    }

    if (result.errorCode) {
      Alert.alert('Camera unavailable', result.errorMessage || 'Unable to launch the camera right now.');
      return;
    }

    if (result.assets && result.assets[0]) {
      onSelectVideo(result.assets[0]);
    }
  };

  const handleLibraryLaunch = async () => {
    const result = await launchImageLibrary({
      mediaType: 'video',
      selectionLimit: 1,
    });

    if (result.didCancel) {
      return;
    }

    if (result.errorCode) {
      Alert.alert('Video picker unavailable', result.errorMessage || 'Unable to open the library right now.');
      return;
    }

    if (result.assets && result.assets[0]) {
      onSelectVideo(result.assets[0]);
    }
  };

  const handTrail = analysisResult?.overlayProfile?.handTrail || [];
  const ballTrail = analysisResult?.overlayProfile?.ballTrail || [];
  const ballTrackingApplied = analysisResult?.ballTrackingApplied;
  const hitchPoint = analysisResult?.hitchFrames >= 3 ? handTrail[Math.min(1, handTrail.length - 1)] : null;
  const trackingReady = trackingStatus === 'ready' && trackingResult;
  const assessmentHighlights = (analysisResult?.assessments || [])
    .filter(item => ['Swing Tracking', 'Ball Tracking', 'Vertical Leap', 'Ball Speed', 'Hitch Frames', 'Contact Point'].includes(item.label))
    .slice(0, 6);
  const metricTiles = analysisResult
    ? [
        {
          label: 'Vertical Leap',
          value: `${analysisResult.verticalLeapInches} in`,
          detail: 'Jump output from the current rep',
        },
        {
          label: 'Ball Speed',
          value: `${analysisResult.ballSpeedMph} MPH`,
          detail:
            analysisResult.ballSpeedSource === 'ball-track'
              ? 'Direct ball trail read'
              : analysisResult.ballSpeedSource === 'tracked-estimate'
                ? 'Tracked hand-speed estimate'
                : 'Derived from clip timing',
        },
        {
          label: 'Peak Hand',
          value: `${analysisResult.peakHandSpeedMph || 0} MPH`,
          detail: 'Tracked hand speed through contact',
        },
        {
          label: 'Hitch Frames',
          value: `${analysisResult.hitchFrames}`,
          detail: `${analysisResult.hitchSeverity} swing interruption`,
        },
        {
          label: 'Ball Frames',
          value: `${analysisResult.trackedBallFrames || 0}`,
          detail: ballTrackingApplied ? 'Direct trail frames locked' : 'Waiting on direct ball trail',
        },
        {
          label: 'Contact Point',
          value: formatContactPoint(analysisResult.contactPoint),
          detail: `Tracking quality ${formatPercent(ballTrackingApplied ? analysisResult.ballTrackingQuality : analysisResult.trackingQuality)}`,
        },
      ]
    : [];
  const machineReadTiles = [
    {
      label: 'Standing Reach',
      value: toMachineValue(analysisInput.standingReachInches, ' in'),
      detail: 'Auto-filled baseline reach from the pose model',
    },
    {
      label: 'Contact Reach',
      value: toMachineValue(analysisInput.contactReachInches, ' in'),
      detail: 'Auto-filled contact height from the tracked rep',
    },
    {
      label: 'Ball Travel',
      value: toMachineValue(analysisInput.ballTravelFeet, ' ft'),
      detail: 'Filled from the ball flight after contact',
    },
    {
      label: 'Release Frames',
      value: toMachineValue(analysisInput.releaseFrames),
      detail: 'Release timing pulled from the tracked clip',
    },
    {
      label: 'FPS',
      value: toMachineValue(analysisInput.fps),
      detail: 'Video frame rate read from the file metadata',
    },
    {
      label: 'Landing',
      value: formatLandingStability(analysisInput.landingStability),
      detail: 'Landing balance read from post-contact body drift',
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      style={styles.safeArea}>
      <PageHeader onHomePress={onGoHome} />

      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Motion Lab</Text>
        <Text style={styles.heroTitle}>Machine-Filled Session Read</Text>
        <Text style={styles.heroCopy}>
          Record or import a clip, press one analysis button, and let the model fill the swing trail, ball tracking, jump numbers, timing, and coaching cues from the video.
        </Text>
      </View>

      <View style={styles.actionRow}>
        <View style={styles.actionButtonWrap}>
          <NeonButton label="Record Video" onPress={handleCameraLaunch} />
        </View>
        <View style={styles.actionButtonWrap}>
          <NeonButton label="Choose Video" onPress={handleLibraryLaunch} tone="secondary" />
        </View>
      </View>

      <View style={styles.videoShell}>
        <Text style={styles.sectionLabel}>Active Clip</Text>
        <View style={styles.videoFrame}>
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
              <Text style={styles.emptyTitle}>No clip loaded</Text>
              <Text style={styles.emptyCopy}>Bring in a player rep and Motion Lab will fill the session from the video instead of asking for coach input.</Text>
            </View>
          )}
        </View>
        <View style={styles.clipMetaGrid}>
          <View style={styles.clipMetaCard}>
            <Text style={styles.clipMetaLabel}>Clip</Text>
            <Text numberOfLines={1} style={styles.clipMetaValue}>{selectedVideo?.fileName || 'Waiting on video'}</Text>
          </View>
          <View style={styles.clipMetaCard}>
            <Text style={styles.clipMetaLabel}>Duration</Text>
            <Text style={styles.clipMetaValue}>{selectedVideo?.duration ? `${selectedVideo.duration}s` : 'Unknown'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.analysisActionCard}>
        <Text style={styles.analysisActionTitle}>Run Full Motion Lab</Text>
        <Text style={styles.analysisActionCopy}>
          One pass runs swing tracking, ball tracking, jump math, release timing, landing stability, and the coaching assessment from the active rep.
        </Text>
        <NeonButton
          label={trackingStatus === 'running' ? 'Analyzing Motion Lab...' : 'Analyze Motion Lab'}
          onPress={onAnalyzeRep}
        />
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.sectionLabel}>Analysis Status</Text>
        {trackingStatus === 'running' ? (
          <Text style={styles.statusCopy}>The app is reading pose, tracking the ball flight, filling the machine fields, and updating the shared motion readout.</Text>
        ) : trackingReady ? (
          <>
            <Text style={styles.statusTitle}>Tracked {trackingResult.dominantHand} hand with {Number(trackingResult.trackedFrames || 0).toFixed(0)} swing samples.</Text>
            <Text style={styles.statusCopy}>
              {Number(trackingResult.ballTrackedFrames || 0) > 1
                ? `The direct ball pass locked ${Number(trackingResult.ballTrackedFrames).toFixed(0)} frames and filled the current speed and timing readout from the clip.`
                : 'The swing path is locked. The ball trail is still falling back to the projected flight until the direct ball pass catches more frames.'}
            </Text>
            <Text style={styles.statusMeta}>Swing track: {formatPercent(trackingResult.trackingQuality)}</Text>
            <Text style={styles.statusMeta}>Ball track: {Number(trackingResult.ballTrackedFrames || 0) > 1 ? formatPercent(trackingResult.ballTrackingQuality) : 'Pending direct lock'}</Text>
          </>
        ) : trackingError ? (
          <>
            <Text style={styles.statusTitle}>Analysis needs another pass</Text>
            <Text style={styles.statusCopy}>{trackingError}</Text>
          </>
        ) : (
          <Text style={styles.statusCopy}>Load a clip and press Analyze Motion Lab. The session cards below will be filled only by the tracker and the video metadata.</Text>
        )}
      </View>

      <View style={styles.machineCardShell}>
        <Text style={styles.sectionLabel}>AI Session Read</Text>
        <View style={styles.machineGrid}>
          {machineReadTiles.map(item => (
            <MachineReadCard detail={item.detail} key={item.label} label={item.label} value={item.value} />
          ))}
        </View>
        <Text style={styles.machineFootnote}>No coach typing is needed here. These values are filled from the tracker, pose read, ball read, and video metadata.</Text>
      </View>

      {analysisResult ? (
        <>
          <View style={styles.resultsCard}>
            <Text style={styles.cardEyebrow}>Tabulated Output</Text>
            <Text style={styles.resultsTitle}>{analysisResult.summary}</Text>
            <Text style={styles.resultsCopy}>
              The active rep is being held here as one Motion Lab workspace, with the stat grid, assessment grid, and correction cues all tied to the same clip.
            </Text>
          </View>

          <View style={styles.metricGrid}>
            {metricTiles.map(item => (
              <MetricTile detail={item.detail} key={item.label} label={item.label} value={item.value} />
            ))}
          </View>

          <View style={styles.assessmentGrid}>
            {assessmentHighlights.map(item => (
              <AssessmentTile item={item} key={item.id} />
            ))}
          </View>

          <View style={styles.coachCard}>
            <Text style={styles.coachTitle}>Coaching Readout</Text>
            {(analysisResult.advice || []).map(item => (
              <AdviceRow item={item} key={item.title} />
            ))}
          </View>
        </>
      ) : null}
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
    backgroundColor: colors.surfaceStrong,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...neonShadow,
  },
  heroEyebrow: {
    color: colors.accent,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  heroTitle: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 34,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  heroCopy: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  actionButtonWrap: {
    width: '48%',
  },
  videoShell: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: 'rgba(17, 11, 28, 0.94)',
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    color: colors.primarySoft,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  videoFrame: {
    height: 280,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: '#030107',
    marginBottom: spacing.md,
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
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 209, 0.24)',
    backgroundColor: 'rgba(255, 63, 164, 0.06)',
  },
  contactGate: {
    position: 'absolute',
    top: '32%',
    left: '54%',
    width: '18%',
    height: '10%',
    borderRadius: radii.round,
    borderWidth: 1,
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
    backgroundColor: 'rgba(255, 63, 164, 0.8)',
    shadowColor: colors.primaryBright,
    shadowOpacity: 0.9,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 0},
  },
  cyanDot: {
    backgroundColor: 'rgba(126, 249, 255, 0.92)',
    shadowColor: colors.accent,
    shadowOpacity: 0.9,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 0},
  },
  hitchFlag: {
    position: 'absolute',
    marginLeft: -18,
    marginTop: -26,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: 'rgba(255, 156, 156, 0.48)',
    backgroundColor: 'rgba(255, 95, 95, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  hitchFlagLabel: {
    color: '#FF9C9C',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  emptyFrame: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 30,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  emptyCopy: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  clipMetaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clipMetaCard: {
    width: '48%',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 209, 0.2)',
    backgroundColor: 'rgba(12, 5, 20, 0.82)',
    padding: spacing.md,
  },
  clipMetaLabel: {
    color: colors.textDim,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  clipMetaValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  analysisActionCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 209, 0.35)',
    backgroundColor: 'rgba(33, 8, 41, 0.96)',
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...neonShadow,
  },
  analysisActionTitle: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 30,
    letterSpacing: 0.7,
    marginBottom: spacing.xs,
  },
  analysisActionCopy: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.md,
  },
  statusCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(126, 249, 255, 0.2)',
    backgroundColor: 'rgba(12, 9, 23, 0.94)',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  statusTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  statusCopy: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  statusMeta: {
    color: colors.primarySoft,
    fontSize: 13,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  machineCardShell: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  machineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  machineReadCard: {
    width: '48%',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: 'rgba(24, 10, 34, 0.9)',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  machineReadLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  machineReadValue: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 24,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  machineReadDetail: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 20,
  },
  machineFootnote: {
    color: colors.accent,
    fontSize: 12,
    lineHeight: 18,
  },
  resultsCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: 'rgba(17, 11, 28, 0.94)',
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
  resultsTitle: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 28,
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  resultsCopy: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
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
  assessmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  assessmentTile: {
    width: '48%',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(126, 249, 255, 0.18)',
    backgroundColor: 'rgba(12, 5, 20, 0.88)',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  assessmentTileLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  assessmentTileValue: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 24,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  assessmentTileStatus: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  coachCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(126, 249, 255, 0.18)',
    backgroundColor: 'rgba(17, 11, 28, 0.92)',
    padding: spacing.lg,
  },
  coachTitle: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 30,
    letterSpacing: 0.7,
    marginBottom: spacing.sm,
  },
  adviceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  adviceDot: {
    width: 10,
    height: 10,
    borderRadius: radii.round,
    backgroundColor: colors.primaryBright,
    marginRight: spacing.sm,
    marginTop: 6,
  },
  adviceTextWrap: {
    flex: 1,
  },
  adviceTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  adviceBody: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
});