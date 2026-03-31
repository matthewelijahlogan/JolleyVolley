import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {NeonButton} from '../components/NeonButton';
import {PageHeader} from '../components/PageHeader';
import {
  blockCard,
  blockEyebrow,
  blockPanel,
  blockPanelAlt,
  blockTitle,
  blockTitleLarge,
  colors,
  spacing,
} from '../theme/theme';

export function FeedbackScreen({analysisResult, onGoHome, onOpenScreen, selectedVideo, trackingStatus}) {
  const usingTrackedSession = analysisResult?.trackingApplied;
  const usingDirectBallTrack = analysisResult?.ballTrackingApplied;

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.safeArea}>
      <PageHeader onHomePress={onGoHome} />

      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>Corrections</Text>
        <Text style={styles.cardTitle}>Swing Feedback</Text>
        <Text style={styles.cardCopy}>
          This tool turns the current rep into simple coaching language so the player knows what to fix on the next swing.
        </Text>
      </View>

      {analysisResult ? (
        <>
          <View style={styles.sourceCard}>
            <Text style={styles.sourceTitle}>Current Feedback Source</Text>
            <Text style={styles.sourceCopy}>
              {usingTrackedSession
                ? usingDirectBallTrack
                  ? 'These cues are being generated from the tracked swing path, the direct tracked ball trail, and the machine-filled session read from the active clip.'
                  : 'These cues are being generated from the tracked swing path on the active clip plus the machine-filled read. The ball-speed result will stay on the swing model until the direct ball pass locks on.'
                : 'These cues are waiting on the machine-filled session read. Run Motion Lab analysis on a clip to feed the tracked hand path into the advice.'}
            </Text>
            <Text style={styles.sourceMeta}>Current clip: {selectedVideo?.fileName || 'No clip selected'}</Text>
            <Text style={styles.sourceMeta}>Tracking status: {trackingStatus === 'running' ? 'Tracking now' : trackingStatus === 'ready' ? 'Tracked clip ready' : 'Awaiting machine read'}</Text>
            {analysisResult?.ballSpeedSource === 'ball-track' ? (
              <Text style={styles.sourceMeta}>Ball-speed source: direct ball trail</Text>
            ) : analysisResult?.ballSpeedSource === 'tracked-estimate' ? (
              <Text style={styles.sourceMeta}>Ball-speed source: tracked swing estimate</Text>
            ) : analysisResult?.ballSpeedSource === 'derived-flight' ? (
              <Text style={styles.sourceMeta}>Ball-speed source: derived clip-timing read</Text>
            ) : null}
          </View>

          {analysisResult.advice.map(item => (
            <View key={item.title} style={styles.adviceCard}>
              <Text style={styles.adviceTitle}>{item.title}</Text>
              <Text style={styles.adviceBody}>{item.body}</Text>
            </View>
          ))}
        </>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No Feedback Yet</Text>
          <Text style={styles.emptyBody}>Run the session analysis in the recorder to generate correction cues here.</Text>
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
  sourceCard: {
    ...blockPanelAlt,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sourceTitle: {
    ...blockTitle,
    fontSize: 22,
    marginBottom: spacing.xs,
  },
  sourceCopy: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.sm,
  },
  sourceMeta: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 18,
  },
  adviceCard: {
    ...blockPanel,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  adviceTitle: {
    ...blockTitle,
    fontSize: 22,
    marginBottom: spacing.xs,
  },
  adviceBody: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  emptyCard: {
    ...blockCard,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...blockTitle,
    fontSize: 22,
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
