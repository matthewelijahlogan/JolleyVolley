import {ScrollView, StyleSheet, Text, View} from 'react-native';
import Video from 'react-native-video';

import {NeonButton} from '../components/NeonButton';
import {PageHeader} from '../components/PageHeader';
import {colors, neonShadow, radii, spacing} from '../theme/theme';

function TrailDot({style, glow = 'pink'}) {
  const accent = glow === 'cyan' ? styles.cyanDot : styles.pinkDot;
  return <View style={[styles.trailDot, accent, style]} />;
}

export function PlaybackScreen({analysisResult, onGoHome, onOpenScreen, selectedVideo}) {
  return (
    <ScrollView style={styles.safeArea} contentContainerStyle={styles.content}>
      <PageHeader
        onHomePress={onGoHome}
        subtitle="Replay the active clip with the neon overlay preview built from the session analysis."
        title="Neon Playback"
      />

      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>Playback View</Text>
        <Text style={styles.cardTitle}>Neon Trail Overlay</Text>
        <Text style={styles.cardCopy}>
          This page replays the selected clip and paints a neon hand trail plus ball trail using the current analysis profile.
        </Text>
      </View>

      <View style={styles.playerCard}>
        <View style={styles.playerFrame}>
          {selectedVideo && selectedVideo.uri ? (
            <>
              <Video controls paused resizeMode="contain" source={{uri: selectedVideo.uri}} style={styles.video} />
              {analysisResult ? (
                <View pointerEvents="none" style={styles.overlayLayer}>
                  {analysisResult.overlayProfile.handTrail.map((point, index) => (
                    <TrailDot key={`hand-${index}`} style={{left: point.left, top: point.top}} />
                  ))}
                  {analysisResult.overlayProfile.ballTrail.map((point, index) => (
                    <TrailDot glow="cyan" key={`ball-${index}`} style={{left: point.left, top: point.top}} />
                  ))}
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.emptyFrame}>
              <Text style={styles.emptyTitle}>No clip ready</Text>
              <Text style={styles.emptyCopy}>Load a video in Motion Lab first, then come back here for the playback overlay.</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Current Overlay Status</Text>
        <Text style={styles.infoCopy}>
          {analysisResult ? analysisResult.summary : 'Analysis has not been run yet for the current session.'}
        </Text>
      </View>

      <View style={styles.buttonStack}>
        <NeonButton label="Back To Motion Lab" onPress={() => onOpenScreen('motion-lab')} />
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
  playerCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: 'rgba(17, 11, 28, 0.92)',
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  playerFrame: {
    height: 320,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: '#030107',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlayLayer: {
    ...StyleSheet.absoluteFillObject,
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
    marginBottom: 6,
  },
  infoCopy: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  buttonStack: {
    gap: spacing.sm,
  },
});