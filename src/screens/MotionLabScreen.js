import {Alert, Linking, PermissionsAndroid, Platform, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Video from 'react-native-video';

import {NeonButton} from '../components/NeonButton';
import {PageHeader} from '../components/PageHeader';
import {formatMotionHistoryValue, motionHistoryMetrics} from '../data/motionHistory';
import {colors, neonShadow, radii, spacing} from '../theme/theme';

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
    <Pressable onPress={onPress} style={({pressed}) => [styles.metricTile, pressed && styles.metricTilePressed]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricDetail}>{detail}</Text>
      <Text style={styles.metricLink}>Open history</Text>
    </Pressable>
  );
}

function AdviceTile({item}) {
  return (
    <View style={styles.adviceTile}>
      <Text style={styles.adviceLabel}>Advice</Text>
      <Text style={styles.adviceTitle}>{item.title}</Text>
      <Text style={styles.adviceBody}>{item.body}</Text>
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

function buildStatusCopy({trackingError, trackingReady, trackingResult, trackingStatus}) {
  if (trackingStatus === 'running') {
    return 'Reading pose, ball flight, and timing from the active rep.';
  }

  if (trackingError) {
    return trackingError;
  }

  if (trackingReady) {
    const ballFrames = Number(trackingResult?.ballTrackedFrames || 0);
    return ballFrames > 1
      ? `Swing and ball tracking locked. Ball trail quality ${formatPercent(trackingResult?.ballTrackingQuality)}.`
      : `Swing path locked. Ball trail is still building from the current clip.`;
  }

  return 'Load one rep, run one pass, and review the current snapshot below.';
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
  const statusCopy = buildStatusCopy({trackingError, trackingReady, trackingResult, trackingStatus});
  const playbackTiles = [
    {
      label: 'Playback',
      value: selectedVideo?.uri ? 'Clip Ready' : 'No Clip',
      detail: selectedVideo?.duration ? `${selectedVideo.duration}s loaded` : 'Record or import a rep',
    },
    {
      label: 'Overlay',
      value: trackingReady ? (ballTrackingApplied ? 'Hand + Ball' : 'Hand Trail') : 'Awaiting AI',
      detail: trackingReady ? 'Mounted over the current rep' : 'Analyze the clip to mount the trail',
    },
    {
      label: 'Tracking',
      value: trackingStatus === 'running' ? 'Running' : trackingReady ? 'Locked' : trackingError ? 'Retry' : 'Idle',
      detail: trackingReady ? `Swing ${formatPercent(trackingResult?.trackingQuality)}` : 'One pass fills the metrics',
    },
    {
      label: 'Playback View',
      value: selectedVideo?.uri ? 'Open' : 'Disabled',
      detail: selectedVideo?.uri ? 'Launch the full playback page' : 'Load a rep first',
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
        <View style={styles.stageHeader}>
          <Text style={styles.stageTitle}>Motion Lab</Text>
          <Text style={styles.stageMeta}>{selectedVideo?.fileName || 'No active clip'}</Text>
        </View>

        <View style={styles.videoFrame}>
          {selectedVideo?.uri ? (
            <>
              <Video controls paused resizeMode="contain" source={{uri: selectedVideo.uri}} style={styles.video} />
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
              <Text style={styles.emptyTitle}>Load a rep</Text>
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
            <NeonButton
              label={trackingStatus === 'running' ? 'Analyzing...' : 'Analyze'}
              onPress={onAnalyzeRep}
            />
          </View>
        </View>

        <View style={styles.statusStrip}>
          <Text style={styles.statusLabel}>Playback Settings</Text>
          <Text style={styles.statusCopy}>{statusCopy}</Text>
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
      </View>

      <Text style={styles.sectionTitle}>Current Metrics</Text>
      <View style={styles.metricGrid}>
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

      <Text style={styles.sectionTitle}>Coaching Advice</Text>
      <View style={styles.metricGrid}>
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
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  stageCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...neonShadow,
  },
  stageHeader: {
    marginBottom: spacing.md,
  },
  stageTitle: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 36,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  stageMeta: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  videoFrame: {
    height: 300,
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 209, 0.24)',
    backgroundColor: '#050109',
    marginBottom: spacing.md,
  },
  video: {
    flex: 1,
    backgroundColor: '#050109',
  },
  overlayLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  swingLane: {
    position: 'absolute',
    left: '18%',
    right: '15%',
    top: '22%',
    bottom: '10%',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 209, 0.14)',
  },
  contactGate: {
    position: 'absolute',
    top: '32%',
    right: '18%',
    width: 68,
    height: 120,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(126, 249, 255, 0.2)',
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
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: 'rgba(255, 199, 102, 0.4)',
    backgroundColor: 'rgba(41, 19, 8, 0.92)',
  },
  hitchFlagLabel: {
    color: '#FFC766',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  emptyFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 28,
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  emptyCopy: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  actionButtonWrap: {
    width: '31.5%',
  },
  statusStrip: {
    marginBottom: spacing.sm,
  },
  statusLabel: {
    color: colors.accent,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  statusCopy: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  settingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  settingTile: {
    width: '48%',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(126, 249, 255, 0.18)',
    backgroundColor: 'rgba(14, 7, 23, 0.78)',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  settingTilePressed: {
    transform: [{scale: 0.99}],
    borderColor: 'rgba(255, 110, 209, 0.38)',
  },
  settingTileDisabled: {
    opacity: 0.65,
  },
  settingLabel: {
    color: colors.textDim,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  settingValue: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 24,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  settingDetail: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 28,
    letterSpacing: 0.7,
    marginBottom: spacing.sm,
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
    backgroundColor: 'rgba(24, 10, 34, 0.92)',
    padding: spacing.md,
    marginBottom: spacing.md,
    ...neonShadow,
  },
  metricTilePressed: {
    transform: [{scale: 0.99}],
    borderColor: 'rgba(255, 110, 209, 0.38)',
  },
  metricLabel: {
    color: colors.textDim,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  metricValue: {
    color: colors.primarySoft,
    fontFamily: 'Bangers',
    fontSize: 28,
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  metricDetail: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  metricLink: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  adviceTile: {
    width: '48%',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(126, 249, 255, 0.18)',
    backgroundColor: 'rgba(14, 7, 23, 0.84)',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  adviceLabel: {
    color: colors.accent,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  adviceTitle: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 24,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  adviceBody: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
});

