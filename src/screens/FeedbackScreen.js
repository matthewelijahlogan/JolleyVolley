import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {NeonButton} from '../components/NeonButton';
import {PageHeader} from '../components/PageHeader';
import {colors, neonShadow, radii, spacing} from '../theme/theme';

export function FeedbackScreen({analysisResult, onGoHome, onOpenScreen}) {
  return (
    <ScrollView style={styles.safeArea} contentContainerStyle={styles.content}>
      <PageHeader
        onHomePress={onGoHome}
        subtitle="Read the current correction cues generated from the active analysis session."
        title="Swing Feedback"
      />

      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>Advice Engine</Text>
        <Text style={styles.cardTitle}>Correction Cues</Text>
        <Text style={styles.cardCopy}>
          This page translates the active session into clear coaching language instead of raw numbers alone.
        </Text>
      </View>

      {analysisResult ? (
        analysisResult.advice.map(item => (
          <View key={item.title} style={styles.adviceCard}>
            <Text style={styles.adviceTitle}>{item.title}</Text>
            <Text style={styles.adviceBody}>{item.body}</Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No advice yet</Text>
          <Text style={styles.emptyBody}>Run the session analysis in Motion Lab to generate correction cues here.</Text>
        </View>
      )}

      <View style={styles.buttonStack}>
        <NeonButton label="Back To Motion Lab" onPress={() => onOpenScreen('motion-lab')} />
        <NeonButton label="Open Metrics" onPress={() => onOpenScreen('jump-speed')} tone="secondary" />
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
  adviceCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: 'rgba(27, 7, 36, 0.92)',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  adviceTitle: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 28,
    letterSpacing: 0.7,
    marginBottom: spacing.xs,
  },
  adviceBody: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
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