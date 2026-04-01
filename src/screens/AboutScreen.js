import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {NeonButton} from '../components/NeonButton';
import {PageHeader} from '../components/PageHeader';
import {
  blockCard,
  blockEyebrow,
  blockPanel,
  blockTitle,
  blockTitleLarge,
  colors,
  spacing,
} from '../theme/theme';

export function AboutScreen({onGoHome, onOpenScreen}) {
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.safeArea}>
      <PageHeader onHomePress={onGoHome} />

      <View style={styles.heroCard}>
        <Text style={styles.cardEyebrow}>About</Text>
        <Text style={styles.cardTitle}>Jolley Volley</Text>
        <Text style={styles.cardCopy}>
          Jolley Volley is built to help coaches and athletes connect one rep to the next with video review, stat tracking, and direct swing feedback.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>What Works Now</Text>
        <Text style={styles.infoCopy}>Record or import a clip, review machine-read motion cards, trace neon playback, read swing feedback, run the scoreboard, and save sessions to athlete profiles.</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>What Comes Next</Text>
        <Text style={styles.infoCopy}>Motion Lab is already filling the core swing, jump, timing, and ball fields from the clip, and the next layer is continuing to tighten the precision of those on-device reads.</Text>
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  heroCard: {
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
  infoCard: {
    ...blockPanel,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoTitle: {
    ...blockTitle,
    fontSize: 22,
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

