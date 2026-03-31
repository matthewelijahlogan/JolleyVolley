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
  blockValue,
  colors,
  spacing,
} from '../theme/theme';

function formatMetric(value, suffix = '') {
  return Number.isFinite(value) ? `${value.toFixed(1)}${suffix}` : '--';
}

function getBestMetric(sessions, field) {
  if (!sessions.length) {
    return null;
  }

  return sessions.reduce((best, session) => {
    const nextValue = Number(session[field] || 0);
    return nextValue > best ? nextValue : best;
  }, 0);
}

export function ProfilesScreen({analysisResult, onGoHome, onOpenScreen, onSaveSessionToProfile, profiles, selectedVideo}) {
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.safeArea}>
      <PageHeader onHomePress={onGoHome} />

      <View style={styles.heroCard}>
        <Text style={styles.cardEyebrow}>Athlete Tracking</Text>
        <Text style={styles.cardTitle}>Profiles</Text>
        <Text style={styles.cardCopy}>
          Save current motion sessions to an athlete so the coach can track jump growth, ball speed, and swing cleanup over time.
        </Text>
      </View>

      <View style={styles.sessionCard}>
        <Text style={styles.sectionTitle}>Current Session</Text>
        <Text style={styles.sectionCopy}>
          {analysisResult
            ? analysisResult.summary
            : 'Run a Motion Lab analysis first, then save that session onto a player profile.'}
        </Text>
        <Text style={styles.sectionMeta}>Current clip: {selectedVideo?.fileName || 'No active clip selected'}</Text>
      </View>

      <View style={styles.profileList}>
        {profiles.map(profile => {
          const sessionCount = profile.sessions.length;
          const bestVertical = getBestMetric(profile.sessions, 'verticalLeapInches');
          const bestBallSpeed = getBestMetric(profile.sessions, 'ballSpeedMph');
          const latestSession = profile.sessions[0];

          return (
            <View key={profile.id} style={styles.profileCard}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileRole}>{profile.role}</Text>
              <Text style={styles.profileFocus}>{profile.focus}</Text>

              <View style={styles.metricRow}>
                <View style={styles.metricBlock}>
                  <Text style={styles.metricLabel}>Sessions</Text>
                  <Text style={styles.metricValue}>{sessionCount}</Text>
                </View>
                <View style={styles.metricBlock}>
                  <Text style={styles.metricLabel}>Best Vertical</Text>
                  <Text style={styles.metricValue}>{formatMetric(bestVertical, ' in')}</Text>
                </View>
                <View style={styles.metricBlock}>
                  <Text style={styles.metricLabel}>Best Speed</Text>
                  <Text style={styles.metricValue}>{formatMetric(bestBallSpeed, ' MPH')}</Text>
                </View>
              </View>

              <View style={styles.latestCard}>
                <Text style={styles.latestTitle}>Latest Session</Text>
                <Text style={styles.latestCopy}>
                  {latestSession ? latestSession.summary : 'No saved sessions yet for this athlete.'}
                </Text>
                <Text style={styles.latestMeta}>
                  {latestSession ? `${latestSession.date} | ${latestSession.clipName}` : 'Save the current Motion Lab session here.'}
                </Text>
              </View>

              {analysisResult ? (
                <NeonButton label="Save Current Session" onPress={() => onSaveSessionToProfile(profile.id)} />
              ) : null}
            </View>
          );
        })}
      </View>

      <View style={styles.buttonStack}>
        <NeonButton label="Open Motion Lab" onPress={() => onOpenScreen('motion-lab-menu')} />
        <NeonButton label="Open Scoreboard" onPress={() => onOpenScreen('scoreboard')} tone="secondary" />
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
  sessionCard: {
    ...blockPanelAlt,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...blockTitle,
    fontSize: 22,
    marginBottom: spacing.xs,
  },
  sectionCopy: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.xs,
  },
  sectionMeta: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 18,
  },
  profileList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  profileCard: {
    ...blockCard,
    padding: spacing.lg,
  },
  profileName: {
    ...blockTitle,
    fontSize: 24,
  },
  profileRole: {
    color: colors.primarySoft,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  profileFocus: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.md,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  metricBlock: {
    ...blockPanel,
    width: '31%',
    padding: spacing.sm,
  },
  metricLabel: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  metricValue: {
    ...blockValue,
    fontSize: 18,
  },
  latestCard: {
    ...blockPanelAlt,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  latestTitle: {
    ...blockEyebrow,
    marginBottom: spacing.xs,
  },
  latestCopy: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.xs,
  },
  latestMeta: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 18,
  },
  buttonStack: {
    gap: spacing.sm,
  },
});
