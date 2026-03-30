import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {NeonButton} from '../components/NeonButton';
import {PageHeader} from '../components/PageHeader';
import {colors, neonShadow, radii, spacing} from '../theme/theme';

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
    <ScrollView style={styles.safeArea} contentContainerStyle={styles.content}>
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
  sessionCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(126, 249, 255, 0.18)',
    backgroundColor: 'rgba(17, 11, 28, 0.88)',
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 28,
    letterSpacing: 0.7,
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
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: 'rgba(24, 10, 34, 0.92)',
    padding: spacing.lg,
    ...neonShadow,
  },
  profileName: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 30,
    letterSpacing: 0.7,
  },
  profileRole: {
    color: colors.primarySoft,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
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
    width: '31%',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 209, 0.18)',
    backgroundColor: 'rgba(12, 5, 20, 0.82)',
    padding: spacing.sm,
  },
  metricLabel: {
    color: colors.textDim,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  metricValue: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 22,
    letterSpacing: 0.5,
  },
  latestCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(126, 249, 255, 0.18)',
    backgroundColor: 'rgba(14, 7, 23, 0.78)',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  latestTitle: {
    color: colors.accent,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
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
