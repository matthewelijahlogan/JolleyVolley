import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {NeonButton} from '../components/NeonButton';
import {PageHeader} from '../components/PageHeader';
import {StatStepper} from '../components/StatStepper';
import {colors, neonShadow, radii, spacing} from '../theme/theme';

export function CoachBoardScreen({coachBoard, onAdjustBoard, onGoHome}) {
  return (
    <ScrollView style={styles.safeArea} contentContainerStyle={styles.content}>
      <PageHeader
        onHomePress={onGoHome}
        subtitle="Keep live match score, possession, and the most-used volleyball stat counters."
        title="Coach Board"
      />

      <View style={styles.scoreCard}>
        <Text style={styles.matchup}>{coachBoard.homeTeam} vs. {coachBoard.awayTeam}</Text>
        <View style={styles.scoreRow}>
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreLabel}>Home Score</Text>
            <Text style={styles.scoreValue}>{coachBoard.homeScore}</Text>
            <View style={styles.controlRow}>
              <NeonButton label="-" onPress={() => onAdjustBoard('homeScore', -1)} tone="secondary" />
              <NeonButton label="+" onPress={() => onAdjustBoard('homeScore', 1)} />
            </View>
          </View>
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreLabel}>Away Score</Text>
            <Text style={styles.scoreValue}>{coachBoard.awayScore}</Text>
            <View style={styles.controlRow}>
              <NeonButton label="-" onPress={() => onAdjustBoard('awayScore', -1)} tone="secondary" />
              <NeonButton label="+" onPress={() => onAdjustBoard('awayScore', 1)} />
            </View>
          </View>
        </View>

        <View style={styles.scoreRow}>
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreLabel}>Home Sets</Text>
            <Text style={styles.scoreValue}>{coachBoard.homeSets}</Text>
            <View style={styles.controlRow}>
              <NeonButton label="-" onPress={() => onAdjustBoard('homeSets', -1)} tone="secondary" />
              <NeonButton label="+" onPress={() => onAdjustBoard('homeSets', 1)} />
            </View>
          </View>
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreLabel}>Away Sets</Text>
            <Text style={styles.scoreValue}>{coachBoard.awaySets}</Text>
            <View style={styles.controlRow}>
              <NeonButton label="-" onPress={() => onAdjustBoard('awaySets', -1)} tone="secondary" />
              <NeonButton label="+" onPress={() => onAdjustBoard('awaySets', 1)} />
            </View>
          </View>
        </View>

        <Text style={styles.possessionLabel}>Possession: {coachBoard.possession === 'home' ? coachBoard.homeTeam : coachBoard.awayTeam}</Text>
        <View style={styles.buttonStack}>
          <NeonButton label="Home Possession" onPress={() => onAdjustBoard('possession', 'home')} />
          <NeonButton label="Away Possession" onPress={() => onAdjustBoard('possession', 'away')} tone="secondary" />
        </View>
      </View>

      <View style={styles.statsWrap}>
        <StatStepper label="Kills" onDecrement={() => onAdjustBoard('kills', -1, true)} onIncrement={() => onAdjustBoard('kills', 1, true)} value={coachBoard.stats.kills} />
        <StatStepper label="Aces" onDecrement={() => onAdjustBoard('aces', -1, true)} onIncrement={() => onAdjustBoard('aces', 1, true)} value={coachBoard.stats.aces} />
        <StatStepper label="Blocks" onDecrement={() => onAdjustBoard('blocks', -1, true)} onIncrement={() => onAdjustBoard('blocks', 1, true)} value={coachBoard.stats.blocks} />
        <StatStepper label="Digs" onDecrement={() => onAdjustBoard('digs', -1, true)} onIncrement={() => onAdjustBoard('digs', 1, true)} value={coachBoard.stats.digs} />
        <StatStepper label="Assists" onDecrement={() => onAdjustBoard('assists', -1, true)} onIncrement={() => onAdjustBoard('assists', 1, true)} value={coachBoard.stats.assists} />
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
  scoreCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...neonShadow,
  },
  matchup: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 34,
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  scoreBlock: {
    width: '48%',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 209, 0.2)',
    backgroundColor: 'rgba(255, 63, 164, 0.08)',
    padding: spacing.md,
  },
  scoreLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  scoreValue: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 38,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  controlRow: {
    gap: spacing.sm,
  },
  possessionLabel: {
    color: colors.primarySoft,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  buttonStack: {
    gap: spacing.sm,
  },
  statsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});