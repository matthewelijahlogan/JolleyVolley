import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {NeonButton} from '../components/NeonButton';
import {PageHeader} from '../components/PageHeader';
import {colors, neonShadow, radii, spacing} from '../theme/theme';

export function AboutScreen({onGoHome, onOpenScreen}) {
  return (
    <ScrollView style={styles.safeArea} contentContainerStyle={styles.content}>
      <PageHeader onHomePress={onGoHome} />

      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>About</Text>
        <Text style={styles.cardTitle}>Jolley Volley</Text>
        <Text style={styles.cardCopy}>
          Jolley Volley is built to help coaches and athletes connect one rep to the next with video review, stat tracking, and direct swing feedback.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>What Works Now</Text>
        <Text style={styles.infoCopy}>Record or import a clip, score the main jump and swing markers, review neon playback, read feedback cues, keep a scoreboard, and save sessions to athlete profiles.</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>What Comes Next</Text>
        <Text style={styles.infoCopy}>The next layer is deeper automated pose and ball tracking so the app can derive more of the motion markers directly from the video instead of relying on manual input alone.</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Why It Exists</Text>
        <Text style={styles.infoCopy}>The goal is to give players something clear after every rep: what happened, what the numbers say, what needs correction, and whether progress is showing up over time.</Text>
      </View>

      <View style={styles.buttonStack}>
        <NeonButton label="Open Motion Lab" onPress={() => onOpenScreen('motion-lab-menu')} />
        <NeonButton label="Open Profiles" onPress={() => onOpenScreen('player-profiles')} tone="secondary" />
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
  infoCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: 'rgba(17, 11, 28, 0.9)',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoTitle: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 28,
    letterSpacing: 0.7,
    marginBottom: spacing.xs,
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
