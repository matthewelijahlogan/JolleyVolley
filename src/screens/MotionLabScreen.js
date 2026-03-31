import {Alert, Linking, PermissionsAndroid, Platform, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Video from 'react-native-video';

import {NeonButton} from '../components/NeonButton';
import {PageHeader} from '../components/PageHeader';
import {formatMotionHistoryValue, motionHistoryMetrics} from '../data/motionHistory';
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

function formatPercent(value) {
  return `${Math.round(Number(value || 0) * 100)}%`;
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

function SectionBar({meta, title}) {
  return (
    <View style={styles.sectionBar}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionMetaPill}>
        <Text style={styles.sectionMetaText}>{meta}</Text>
      </View>
    </View>
  );
}

function PlaybackSettingTile({detail, disabled = false, label, onPress, value}) {
  const content = (
    <>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value}</Text>
      <Text style={styles.settingDetail}>{detail}</Text>
    </>
  );

  if (onPress && !disabled) {
    return (
      <Pressable onPress={onPress} style={({pressed}) => [styles.settingTile, pressed && styles.settingTilePressed]}>
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.settingTile, disabled && styles.settingTileDisabled]}>{content}</View>;
}

function MetricLinkTile({detail, label, onPress, value}) {
  return (
    <Pressable onPress={onPress} style={({pressed}) => [styles.gridTile, styles.metricTile, pressed && styles.gridTilePressed]}>
      <View style={styles.gridTileTopRow}>
        <Text style={styles.gridTileLabel}>{label}</Text>
        <View style={styles.historyPill}>
          <Text style={styles.historyPillText}>History</Text>
        </View>
      </View>
      <Text style={styles.gridTileValue}>{value}</Text>
      <Text style={styles.gridTileDetail}>{detail}</Text>
    </Pressable>
  );
}

function AdviceTile({item}) {
  return (
    <View style={[styles.gridTile, styles.adviceTile]}>
      <View style={styles.gridTileTopRow}>
        <Text style={styles.gridTileLabel}>Cue</Text>
        <View style={styles.cuePill}>
          <Text style={styles.cuePillText}>Coach</Text>
        </View>
      </View>
      <Text style={styles.adviceTitle}>{item.title}</Text>
      <Text style={styles.gridTileDetail}>{item.body}</Text>
    </View>
  );
}

async function requestAndroidVideoCapturePermissions() {
  if (Platform.OS !== 'android') {
    return true;
  }

  const permissionMap = {
    [PermissionsAndroid.PERMISSIONS.CAMERA]: 'camera',
    [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO]: 'microphone',
  };
  const permissions = Object.keys(permissionMap);
  const missingPermissions = [];

  for (const permission of permissions) {
    const granted = await PermissionsAndroid.check(permission);
    if (!granted) {
      missingPermissions.push(permission);
    }
  }

  if (missingPermissions.length === 0) {
    return true;
  }

  const result = await PermissionsAndroid.requestMultiple(missingPermissions);
  const blockedLabels = [];

  for (const permission of missingPermissions) {
    const status = result[permission];
    if (status !== PermissionsAndroid.RESULTS.GRANTED) {
      blockedLabels.push(permissionMap[permission]);
    }
  }

  if (blockedLabels.length === 0) {
    return true;
  }

  Alert.alert(
    'Camera access needed',
    `Allow ${blockedLabels.join(' and ')} access so Motion Lab can record volleyball reps on this device.`,
    [
      {text: 'Not now', style: 'cancel'},
      {text: 'Open Settings', onPress: () => Linking.openSettings()},
    ],
  );

  return false;
}

function buildStatusCopy({trackingError, trackingPrompt, trackingReady, trackingResult, trackingStatus}) {
  if (trackingStatus === 'running') {
    return 'Reading pose, ball flight, and timing from the active rep.';
  }

  if (trackingStatus === 'recapture' && trackingPrompt?.message) {
    return trackingPrompt.message;
  }

  if (trackingError) {
    return trackingError;
  }

  if (trackingReady) {
    const ballFrames = Number(trackingResult?.ballTrackedFrames || 0);
    return ballFrames > 1
      ? `Swing and ball tracking locked. Ball trail quality ${formatPercent(trackingResult?.ballTrackingQuality)}.`
      : 'Swing path locked. Ball trail is still building from this clip.';
  }

  return 'Load one rep, run one pass, and review the current snapshot below.';
}

function buildStageBadge(trackingError, trackingReady, trackingStatus) {
  if (trackingStatus === 'running') {
    return {label: 'Scanning', tone: 'live'};
  }

  if (trackingStatus === 'recapture') {
    return {label: 'Recapture', tone: 'warn'};
  }

  if (trackingError) {
    return {label: 'Retry', tone: 'warn'};
  }

  if (trackingReady) {
    return {label: 'Locked', tone: 'good'};
  }

  return {label: 'Ready', tone: 'idle'};
}

export function MotionLabScreen({
  analysisResult,
  onAnalyzeRep,
  onGoHome,
  onOpenMetricHistory,
  onOpenScreen,
  onSelectVideo,
  selectedVideo,
  trackingError,
  trackingPrompt,
  trackingResult,
  trackingStatus,
}) {
  const handleCameraLaunch = async () => {
    const hasPermissions = await requestAndroidVideoCapturePermissions();
    if (!hasPermissions) {
      return;
    }

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
  const statusCopy = buildStatusCopy({trackingError, trackingPrompt, trackingReady, trackingResult, trackingStatus});
  const stageBadge = buildStageBadge(trackingError, trackingReady, trackingStatus);
  const playbackTiles = [
    {
      label: 'Clip',
      value: selectedVideo?.uri ? 'Ready' : 'Empty',
      detail: selectedVideo?.duration ? `${selectedVideo.duration}s loaded` : 'Load rep',
    },
    {
      label: 'Trail',
      value: trackingReady ? (ballTrackingApplied ? 'Dual' : 'Hand') : 'Idle',
      detail: trackingReady ? 'Overlay live' : 'Run pass',
    },
    {
      label: 'Track',
      value: trackingStatus === 'running' ? 'Live' : trackingReady ? 'Lock' : trackingStatus === 'recapture' ? 'Recap' : trackingError ? 'Retry' : 'Idle',
      detail: trackingReady ? formatPercent(trackingResult?.trackingQuality) : 'One pass',
    },
    {
      label: 'Playback',
      value: selectedVideo?.uri ? 'Open' : 'Off',
      detail: selectedVideo?.uri ? 'Full view' : 'Need rep',
      onPress: selectedVideo?.uri ? () => onOpenScreen('neon-playback') : undefined,
      disabled: !selectedVideo?.uri,
    },
  ];
  const metricTiles = motionHistoryMetrics.map(metric => ({
    id: metric.id,
    label: metric.label,
    value: trackingReady ? formatMotionHistoryValue(metric.id, analysisResult?.[metric.id]) : 'Awaiting AI',
    detail: 'Tap to open the saved history grid.',
  }));
  const adviceTiles = trackingReady
    ? (analysisResult?.advice || []).slice(0, 4)
    : trackingStatus === 'recapture' && trackingPrompt?.checklist?.length
      ? [{title: 'Recapture this rep', body: trackingPrompt.message}, ...trackingPrompt.checklist].slice(0, 4)
      : [
          {
            title: 'Run Motion Lab',
            body: 'Analyze one clip to fill the coaching cards from the AI read.',
          },
          {
            title: 'Keep the whole rep in frame',
            body: 'A side view with the athlete and ball visible gives the tracker the cleanest pass.',
          },
        ];

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={styles.safeArea}>
      <PageHeader onHomePress={onGoHome} />

      <View style={styles.stageCard}>
        <View pointerEvents="none" style={styles.stageGlowPrimary} />
        <View pointerEvents="none" style={styles.stageGlowSecondary} />

        <View style={styles.stageHeader}>
          <View style={styles.stageHeaderTextWrap}>
            <Text style={styles.stageTitle}>Motion Lab</Text>
            <Text numberOfLines={1} style={styles.stageMeta}>{selectedVideo?.fileName || 'No active clip loaded'}</Text>
          </View>
          <View style={[styles.stageBadge, stageBadge.tone === 'good' && styles.stageBadgeGood, stageBadge.tone === 'live' && styles.stageBadgeLive, stageBadge.tone === 'warn' && styles.stageBadgeWarn]}>
            <Text style={styles.stageBadgeText}>{stageBadge.label}</Text>
          </View>
        </View>

        <View style={styles.videoFrame}>
          {selectedVideo?.uri ? (
            <>
              <Video controls paused resizeMode="contain" source={{uri: selectedVideo.uri}} style={styles.video} />
              <View pointerEvents="none" style={styles.videoHud}>
                <View style={styles.videoHudPill}>
                  <Text style={styles.videoHudText}>{trackingReady ? 'AI Overlay Live' : trackingStatus === 'recapture' ? 'Recapture Needed' : 'Awaiting AI Pass'}</Text>
                </View>
              </View>
              {trackingReady ? (
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
              <Text style={styles.emptyTitle}>Load a Rep</Text>
              <Text style={styles.emptyCopy}>Record or import one volleyball rep to start the Motion Lab pass.</Text>
            </View>
          )}
        </View>

        <View style={styles.actionRow}>
          <View style={styles.actionButtonWrap}>
            <NeonButton label="Record" onPress={handleCameraLaunch} />
          </View>
          <View style={styles.actionButtonWrap}>
            <NeonButton label="Import" onPress={handleLibraryLaunch} tone="secondary" />
          </View>
          <View style={styles.actionButtonWrap}>
            <NeonButton label={trackingStatus === 'running' ? 'Scanning' : 'Run Pass'} onPress={onAnalyzeRep} />
          </View>
        </View>

        <View style={styles.settingGrid}>
          {playbackTiles.map(item => (
            <PlaybackSettingTile
              detail={item.detail}
              disabled={item.disabled}
              key={item.label}
              label={item.label}
              onPress={item.onPress}
              value={item.value}
            />
          ))}
        </View>

        <Text style={styles.stageFootnote}>{statusCopy}</Text>
      </View>

      <SectionBar meta={`${metricTiles.length} live`} title="Current Metrics" />
      <View style={styles.cardGrid}>
        {metricTiles.map(item => (
          <MetricLinkTile
            detail={item.detail}
            key={item.id}
            label={item.label}
            onPress={() => onOpenMetricHistory(item.id)}
            value={item.value}
          />
        ))}
      </View>

      <SectionBar meta={`${adviceTiles.length} cues`} title="Coaching Advice" />
      <View style={styles.cardGrid}>
        {adviceTiles.map((item, index) => (
          <AdviceTile item={item} key={`${item.title}-${index}`} />
        ))}
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  stageCard: {
    ...blockCard,
    position: 'relative',
    overflow: 'hidden',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  stageGlowPrimary: {
    position: 'absolute',
    top: -70,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 63, 164, 0.18)',
  },
  stageGlowSecondary: {
    position: 'absolute',
    bottom: -90,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 999,
    backgroundColor: 'rgba(126, 249, 255, 0.1)',
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  stageHeaderTextWrap: {
    flex: 1,
  },
  stageTitle: {
    ...blockTitleLarge,
    fontSize: 30,
    marginBottom: 2,
  },
  stageMeta: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  stageBadge: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.28)',
    backgroundColor: 'rgba(255, 63, 164, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  stageBadgeGood: {
    borderColor: 'rgba(89, 255, 168, 0.34)',
    backgroundColor: 'rgba(89, 255, 168, 0.12)',
  },
  stageBadgeLive: {
    borderColor: 'rgba(126, 249, 255, 0.34)',
    backgroundColor: 'rgba(126, 249, 255, 0.14)',
  },
  stageBadgeWarn: {
    borderColor: 'rgba(255, 199, 102, 0.34)',
    backgroundColor: 'rgba(255, 199, 102, 0.14)',
  },
  stageBadgeText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  videoFrame: {
    height: 360,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.28)',
    backgroundColor: '#050109',
    marginBottom: spacing.sm,
  },
  video: {
    flex: 1,
    backgroundColor: '#050109',
  },
  videoHud: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  videoHudPill: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 245, 251, 0.16)',
    backgroundColor: 'rgba(9, 2, 15, 0.78)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  videoHudText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  overlayLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  swingLane: {
    position: 'absolute',
    left: '17%',
    right: '14%',
    top: '19%',
    bottom: '9%',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.18)',
    backgroundColor: 'rgba(255, 63, 164, 0.05)',
  },
  contactGate: {
    position: 'absolute',
    top: '30%',
    right: '17%',
    width: 74,
    height: 130,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(126, 249, 255, 0.28)',
  },
  trailDot: {
    position: 'absolute',
    width: 18,
    height: 18,
    marginLeft: -9,
    marginTop: -9,
    borderRadius: 999,
  },
  pinkDot: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.9,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 0},
    elevation: 10,
  },
  cyanDot: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.8,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 0},
    elevation: 9,
  },
  hitchFlag: {
    position: 'absolute',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 199, 102, 0.4)',
    backgroundColor: 'rgba(41, 19, 8, 0.92)',
  },
  hitchFlagLabel: {
    color: '#FFC766',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  emptyFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    ...blockTitle,
    fontSize: 22,
    marginBottom: spacing.xs,
  },
  emptyCopy: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  actionButtonWrap: {
    width: '31.5%',
  },
  settingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  settingTile: {
    ...blockPanelAlt,
    width: '23.4%',
    minHeight: 94,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: spacing.sm,
  },
  settingTilePressed: {
    transform: [{scale: 0.98}],
    borderColor: 'rgba(255, 110, 209, 0.54)',
  },
  settingTileDisabled: {
    opacity: 0.62,
  },
  settingLabel: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 5,
  },
  settingValue: {
    ...blockValue,
    fontSize: 18,
    marginBottom: 4,
  },
  settingDetail: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  stageFootnote: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  sectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...blockTitle,
    fontSize: 22,
  },
  sectionMetaPill: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.24)',
    backgroundColor: 'rgba(255, 63, 164, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  sectionMetaText: {
    color: colors.primarySoft,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  gridTile: {
    width: '48%',
    minHeight: 162,
    borderRadius: 18,
    borderWidth: 2,
    padding: 14,
    marginBottom: spacing.sm,
  },
  metricTile: {
    ...blockCard,
    shadowOpacity: 0.24,
  },
  adviceTile: {
    ...blockPanelAlt,
  },
  gridTilePressed: {
    transform: [{scale: 0.99}],
    borderColor: 'rgba(255, 110, 209, 0.54)',
  },
  gridTileTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: spacing.xs,
  },
  gridTileLabel: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  historyPill: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(126, 249, 255, 0.24)',
    backgroundColor: 'rgba(126, 249, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  historyPillText: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cuePill: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.24)',
    backgroundColor: 'rgba(255, 63, 164, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cuePillText: {
    color: colors.primarySoft,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  gridTileValue: {
    ...blockValue,
    marginBottom: 8,
  },
  gridTileDetail: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  adviceTitle: {
    ...blockTitle,
    fontSize: 20,
    marginBottom: 8,
  },
});
