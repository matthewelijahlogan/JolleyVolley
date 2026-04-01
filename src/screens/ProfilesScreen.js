import React, {useMemo, useState} from 'react';
import {Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';

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
  radii,
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

function getEmptyPlayerDraft() {
  return {
    jersey: '',
    name: '',
    role: '',
  };
}

function UtilityChip({active = false, label, onPress, tone = 'secondary'}) {
  const primary = tone === 'primary' || active;

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.utilityChip,
        primary ? styles.utilityChipPrimary : styles.utilityChipSecondary,
        pressed && styles.utilityChipPressed,
      ]}>
      <Text style={[styles.utilityChipText, primary ? styles.utilityChipTextPrimary : styles.utilityChipTextSecondary]}>
        {label}
      </Text>
    </Pressable>
  );
}

function MetricTile({label, value}) {
  return (
    <View style={styles.metricTile}>
      <Text style={styles.metricTileLabel}>{label}</Text>
      <Text style={styles.metricTileValue}>{value}</Text>
    </View>
  );
}

function FormField({label, onChangeText, placeholder, value}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDim}
        selectionColor={colors.primaryBright}
        style={styles.fieldInput}
        value={value}
      />
    </View>
  );
}

export function ProfilesScreen({
  analysisResult,
  appLogs,
  coachBoard,
  onAddPlayerToTeam,
  onAddProfile,
  onAddTeam,
  onAssignTeamToSide,
  onCreateSnapshotLog,
  onDeletePlayerFromTeam,
  onDeleteProfile,
  onDeleteTeam,
  onGoHome,
  onOpenScreen,
  onSaveSessionToProfile,
  profiles,
  selectedVideo,
  teams,
}) {
  const [profileDraft, setProfileDraft] = useState({
    name: '',
    role: '',
    focus: '',
  });
  const [teamDraft, setTeamDraft] = useState({
    name: '',
    abbreviation: '',
  });
  const [playerDrafts, setPlayerDrafts] = useState({});

  const totals = useMemo(
    () => ({
      teams: teams.length,
      rosterPlayers: teams.reduce((count, team) => count + team.players.length, 0),
      profiles: profiles.length,
      sessions: profiles.reduce((count, profile) => count + profile.sessions.length, 0),
    }),
    [profiles, teams],
  );

  const recentLogs = useMemo(() => (appLogs || []).slice(0, 16), [appLogs]);

  const updatePlayerDraft = (teamId, field, value) => {
    setPlayerDrafts(current => ({
      ...current,
      [teamId]: {
        ...getEmptyPlayerDraft(),
        ...(current[teamId] || {}),
        [field]: value,
      },
    }));
  };

  const submitProfile = () => {
    if (!onAddProfile(profileDraft)) {
      Alert.alert('Add Profile', 'Enter at least a player name to create a profile.');
      return;
    }

    setProfileDraft({
      name: '',
      role: '',
      focus: '',
    });
  };

  const submitTeam = () => {
    if (!onAddTeam(teamDraft)) {
      Alert.alert('Add Team', 'Enter a team name before saving the team.');
      return;
    }

    setTeamDraft({
      name: '',
      abbreviation: '',
    });
  };

  const submitPlayer = teamId => {
    const draft = playerDrafts[teamId] || getEmptyPlayerDraft();

    if (!onAddPlayerToTeam(teamId, draft)) {
      Alert.alert('Add Player', 'Enter at least a player name before adding the roster spot.');
      return;
    }

    setPlayerDrafts(current => ({
      ...current,
      [teamId]: getEmptyPlayerDraft(),
    }));
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={styles.safeArea}>
      <PageHeader onHomePress={onGoHome} />

      <View style={styles.heroCard}>
        <Text style={styles.cardEyebrow}>Program Control</Text>
        <Text style={styles.cardTitle}>Profiles</Text>
        <Text style={styles.cardCopy}>
          Build the athlete list, maintain team rosters, and keep a local running log of what the app has stored.
        </Text>

        <View style={styles.heroMetricsGrid}>
          <MetricTile label="Teams" value={`${totals.teams}`} />
          <MetricTile label="Roster Spots" value={`${totals.rosterPlayers}`} />
          <MetricTile label="Profiles" value={`${totals.profiles}`} />
          <MetricTile label="Saved Sessions" value={`${totals.sessions}`} />
        </View>

        <View style={styles.heroButtonRow}>
          <View style={styles.heroButtonCell}>
            <NeonButton label="Save Local Snapshot" onPress={onCreateSnapshotLog} />
          </View>
          <View style={styles.heroButtonCell}>
            <NeonButton label="Open Scoreboard" onPress={() => onOpenScreen('scoreboard')} tone="secondary" />
          </View>
        </View>
      </View>

      <View style={styles.sessionCard}>
        <Text style={styles.sectionTitle}>Current Motion Lab Session</Text>
        <Text style={styles.sectionCopy}>
          {analysisResult
            ? analysisResult.summary
            : 'Run Motion Lab first, then save the current readout onto one or more athlete profiles.'}
        </Text>
        <Text style={styles.sectionMeta}>Active clip: {selectedVideo?.fileName || 'No clip loaded'}</Text>
      </View>

      <View style={styles.builderCard}>
        <Text style={styles.cardEyebrow}>Athlete Builder</Text>
        <Text style={styles.builderTitle}>Add Profile</Text>
        <View style={styles.formGrid}>
          <FormField
            label="Name"
            onChangeText={value => setProfileDraft(current => ({...current, name: value}))}
            placeholder="Ava Rivera"
            value={profileDraft.name}
          />
          <FormField
            label="Role"
            onChangeText={value => setProfileDraft(current => ({...current, role: value}))}
            placeholder="Outside Hitter"
            value={profileDraft.role}
          />
          <FormField
            label="Focus"
            onChangeText={value => setProfileDraft(current => ({...current, focus: value}))}
            placeholder="Earlier contact and cleaner landing"
            value={profileDraft.focus}
          />
        </View>
        <NeonButton label="Add Profile" onPress={submitProfile} />
      </View>

      <View style={styles.listBlock}>
        {profiles.map(profile => {
          const latestSession = profile.sessions[0];
          const bestVertical = getBestMetric(profile.sessions, 'verticalLeapInches');
          const bestBallSpeed = getBestMetric(profile.sessions, 'ballSpeedMph');

          return (
            <View key={profile.id} style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <View style={styles.profileTitleWrap}>
                  <Text style={styles.profileName}>{profile.name}</Text>
                  <Text style={styles.profileRole}>{profile.role}</Text>
                </View>
                <UtilityChip label="Delete" onPress={() => onDeleteProfile(profile.id)} tone="secondary" />
              </View>

              <Text style={styles.profileFocus}>{profile.focus}</Text>

              <View style={styles.profileMetricRow}>
                <MetricTile label="Sessions" value={`${profile.sessions.length}`} />
                <MetricTile label="Best Vertical" value={formatMetric(bestVertical, ' in')} />
                <MetricTile label="Best Speed" value={formatMetric(bestBallSpeed, ' mph')} />
              </View>

              <View style={styles.latestCard}>
                <Text style={styles.latestTitle}>Latest Session</Text>
                <Text style={styles.latestCopy}>{latestSession ? latestSession.summary : 'No saved Motion Lab sessions yet.'}</Text>
                <Text style={styles.latestMeta}>
                  {latestSession ? `${latestSession.date} | ${latestSession.clipName}` : 'Current session can be saved here once Motion Lab finishes.'}
                </Text>
              </View>

              <View style={styles.actionRow}>
                <View style={styles.actionCell}>
                  <NeonButton
                    label="Save Current Session"
                    onPress={() => onSaveSessionToProfile(profile.id)}
                    tone={analysisResult ? 'primary' : 'secondary'}
                  />
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.builderCard}>
        <Text style={styles.cardEyebrow}>Roster Builder</Text>
        <Text style={styles.builderTitle}>Add Team</Text>
        <View style={styles.formGridTwoUp}>
          <FormField
            label="Team Name"
            onChangeText={value => setTeamDraft(current => ({...current, name: value}))}
            placeholder="Jolley Squad"
            value={teamDraft.name}
          />
          <FormField
            label="Abbreviation"
            onChangeText={value => setTeamDraft(current => ({...current, abbreviation: value}))}
            placeholder="JVSQ"
            value={teamDraft.abbreviation}
          />
        </View>
        <NeonButton label="Add Team" onPress={submitTeam} />
      </View>

      <View style={styles.listBlock}>
        {teams.map(team => {
          const playerDraft = playerDrafts[team.id] || getEmptyPlayerDraft();
          const isHomeTeam = coachBoard?.homeTeamId === team.id;
          const isAwayTeam = coachBoard?.awayTeamId === team.id;

          return (
            <View key={team.id} style={styles.teamCard}>
              <View style={styles.teamHeader}>
                <View style={styles.teamTitleWrap}>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <Text style={styles.teamAbbreviation}>{team.abbreviation}</Text>
                </View>
                <View style={styles.teamBadgeRow}>
                  {isHomeTeam ? <UtilityChip active label="Home" onPress={() => onAssignTeamToSide(team.id, 'home')} /> : null}
                  {isAwayTeam ? <UtilityChip active label="Away" onPress={() => onAssignTeamToSide(team.id, 'away')} tone="secondary" /> : null}
                </View>
              </View>

              <View style={styles.teamAssignRow}>
                <UtilityChip active={isHomeTeam} label="Set Home" onPress={() => onAssignTeamToSide(team.id, 'home')} />
                <UtilityChip active={isAwayTeam} label="Set Away" onPress={() => onAssignTeamToSide(team.id, 'away')} tone="secondary" />
                <UtilityChip label="Delete Team" onPress={() => onDeleteTeam(team.id)} tone="secondary" />
              </View>

              <View style={styles.formGridThreeUp}>
                <FormField
                  label="Jersey"
                  onChangeText={value => updatePlayerDraft(team.id, 'jersey', value)}
                  placeholder="12"
                  value={playerDraft.jersey}
                />
                <FormField
                  label="Player"
                  onChangeText={value => updatePlayerDraft(team.id, 'name', value)}
                  placeholder="Ava Rivera"
                  value={playerDraft.name}
                />
                <FormField
                  label="Role"
                  onChangeText={value => updatePlayerDraft(team.id, 'role', value)}
                  placeholder="OH"
                  value={playerDraft.role}
                />
              </View>

              <View style={styles.actionRow}>
                <View style={styles.actionCell}>
                  <NeonButton label="Add Player" onPress={() => submitPlayer(team.id)} />
                </View>
              </View>

              <View style={styles.rosterList}>
                {team.players.length ? (
                  team.players.map(player => (
                    <View key={player.id} style={styles.playerRow}>
                      <View style={styles.playerIdentity}>
                        <Text style={styles.playerJersey}>#{player.jersey}</Text>
                        <View style={styles.playerCopyWrap}>
                          <Text style={styles.playerName}>{player.name}</Text>
                          <Text style={styles.playerRoleTag}>{player.role}</Text>
                        </View>
                      </View>
                      <UtilityChip label="Remove" onPress={() => onDeletePlayerFromTeam(team.id, player.id)} tone="secondary" />
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyRosterCard}>
                    <Text style={styles.emptyRosterText}>No players saved on this team yet.</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.logCard}>
        <Text style={styles.cardEyebrow}>Local Log</Text>
        <Text style={styles.builderTitle}>Recent Activity</Text>
        <Text style={styles.cardCopy}>Teams, roster changes, scoreboard actions, Motion Lab runs, and snapshots are all stored locally inside the app.</Text>

        <View style={styles.logList}>
          {recentLogs.map(log => (
            <View key={log.id} style={styles.logRow}>
              <View style={styles.logTopRow}>
                <Text style={styles.logCategory}>{log.category}</Text>
                <Text style={styles.logTime}>{log.label}</Text>
              </View>
              <Text style={styles.logMessage}>{log.message}</Text>
              {log.detail ? <Text style={styles.logDetail}>{log.detail}</Text> : null}
            </View>
          ))}
        </View>
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
    lineHeight: 21,
  },
  heroMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  metricTile: {
    ...blockPanel,
    width: '48.5%',
    padding: spacing.sm,
  },
  metricTileLabel: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  metricTileValue: {
    ...blockValue,
    fontSize: 19,
  },
  heroButtonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroButtonCell: {
    flex: 1,
  },
  sessionCard: {
    ...blockPanelAlt,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...blockTitle,
    fontSize: 24,
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
  builderCard: {
    ...blockCard,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  builderTitle: {
    ...blockTitle,
    fontSize: 24,
    marginBottom: spacing.md,
  },
  formGrid: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  formGridTwoUp: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
    marginBottom: spacing.md,
  },
  formGridThreeUp: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
    marginBottom: spacing.md,
  },
  fieldWrap: {
    width: '100%',
  },
  fieldLabel: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  fieldInput: {
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.24)',
    backgroundColor: 'rgba(12, 7, 18, 0.96)',
    color: colors.text,
    fontSize: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  listBlock: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  profileCard: {
    ...blockCard,
    padding: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  profileTitleWrap: {
    flex: 1,
  },
  profileName: {
    ...blockTitle,
    fontSize: 24,
  },
  profileRole: {
    color: colors.primarySoft,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  profileFocus: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.md,
  },
  profileMetricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
    marginBottom: spacing.md,
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
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionCell: {
    flex: 1,
  },
  teamCard: {
    ...blockCard,
    padding: spacing.lg,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  teamTitleWrap: {
    flex: 1,
  },
  teamName: {
    ...blockTitle,
    fontSize: 24,
  },
  teamAbbreviation: {
    color: colors.primarySoft,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  teamBadgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  teamAssignRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  rosterList: {
    gap: spacing.sm,
  },
  playerRow: {
    ...blockPanel,
    padding: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  playerIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  playerJersey: {
    ...blockValue,
    fontSize: 22,
  },
  playerCopyWrap: {
    flex: 1,
  },
  playerName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  playerRoleTag: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  emptyRosterCard: {
    ...blockPanelAlt,
    padding: spacing.md,
  },
  emptyRosterText: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 19,
  },
  logCard: {
    ...blockCard,
    padding: spacing.lg,
  },
  logList: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  logRow: {
    ...blockPanelAlt,
    padding: spacing.md,
  },
  logTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: 6,
  },
  logCategory: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  logTime: {
    color: colors.textDim,
    fontSize: 11,
  },
  logMessage: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  logDetail: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  utilityChip: {
    borderRadius: 14,
    borderWidth: 2,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  utilityChipPrimary: {
    backgroundColor: 'rgba(255, 63, 164, 0.18)',
    borderColor: 'rgba(255, 110, 209, 0.48)',
  },
  utilityChipSecondary: {
    backgroundColor: 'rgba(11, 8, 18, 0.96)',
    borderColor: 'rgba(126, 249, 255, 0.18)',
  },
  utilityChipPressed: {
    transform: [{scale: 0.98}],
  },
  utilityChipText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  utilityChipTextPrimary: {
    color: colors.text,
  },
  utilityChipTextSecondary: {
    color: colors.accent,
  },
});
