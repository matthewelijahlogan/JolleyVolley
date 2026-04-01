import React, {useMemo, useRef, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View} from 'react-native';

import {NeonButton} from '../components/NeonButton';
import {PageHeader} from '../components/PageHeader';
import {defaultScoreboardVisibility, scoreboardStatCategories} from '../data/dashboard';
import {colors, radii, spacing} from '../theme/theme';

function sumRosterStat(roster = [], statId) {
  return roster.reduce((total, player) => total + Number(player.stats?.[statId] || 0), 0);
}

function MiniActionButton({label, onPress, tone = 'primary'}) {
  const active = tone === 'primary';

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.miniButton, active ? styles.miniButtonPrimary : styles.miniButtonSecondary, pressed && styles.pressed]}>
      <Text style={[styles.miniButtonLabel, active ? styles.miniButtonLabelPrimary : styles.miniButtonLabelSecondary]}>{label}</Text>
    </Pressable>
  );
}

function ToggleChip({active, label, onPress}) {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.toggleChip, active ? styles.toggleChipActive : styles.toggleChipInactive, pressed && styles.pressed]}>
      <Text style={[styles.toggleChipLabel, active ? styles.toggleChipLabelActive : styles.toggleChipLabelInactive]}>{label}</Text>
    </Pressable>
  );
}

function CategoryChip({active, label, onPress}) {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.categoryChip, active && styles.categoryChipActive, pressed && styles.pressed]}>
      <Text style={[styles.categoryChipLabel, active && styles.categoryChipLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function BigScorePanel({isFinal, isNarrow, onAdjustScore, onAdjustSets, possession, score, sets, side, title}) {
  const serving = possession === side;

  return (
    <View style={styles.scorePanel}>
      <Text numberOfLines={1} style={[styles.scoreTitle, isNarrow && styles.scoreTitleNarrow]}>{title}</Text>
      <View style={[styles.servePill, serving && styles.servePillActive]}>
        <Text style={[styles.servePillLabel, serving && styles.servePillLabelActive]}>{serving ? 'Serving' : 'Receive'}</Text>
      </View>
      <View style={styles.scoreValueWrap}>
        <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.scoreValue, isNarrow && styles.scoreValueNarrow]}>{score}</Text>
      </View>
      {isFinal ? (
        <Text style={styles.setReadout}>Sets {sets}</Text>
      ) : (
        <>
          <View style={styles.rowGapSmall}>
            <View style={styles.actionRow}>
              <MiniActionButton label="-1" onPress={() => onAdjustScore(side, -1)} tone="secondary" />
              <MiniActionButton label="+1" onPress={() => onAdjustScore(side, 1)} />
            </View>
            <View style={styles.actionRow}>
              <MiniActionButton label="-S" onPress={() => onAdjustSets(side, -1)} tone="secondary" />
              <MiniActionButton label={`Sets ${sets}`} onPress={() => {}} tone="secondary" />
              <MiniActionButton label="+S" onPress={() => onAdjustSets(side, 1)} />
            </View>
          </View>
        </>
      )}
    </View>
  );
}

function TeamStatPanel({players, side, statCategory, title, onAdjustPlayerStat}) {
  return (
    <View style={styles.statTeamCard}>
      <View style={styles.statTeamHeader}>
        <View>
          <Text style={styles.cardEyebrow}>{side === 'home' ? 'Home' : 'Away'}</Text>
          <Text style={styles.statTeamTitle}>{title}</Text>
        </View>
        <View style={styles.totalPill}>
          <Text style={styles.totalPillValue}>{sumRosterStat(players, statCategory.id)}</Text>
          <Text style={styles.totalPillLabel}>{statCategory.shortLabel}</Text>
        </View>
      </View>
      {players.length ? (
        <View style={styles.playerGrid}>
          {players.map(player => (
            <View key={player.id} style={styles.playerCard}>
              <Text style={styles.playerJersey}>#{player.jersey}</Text>
              <Text numberOfLines={1} style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerRole}>{player.role}</Text>
              <Text style={styles.playerValue}>{Number(player.stats?.[statCategory.id] || 0)}</Text>
              <View style={styles.actionRow}>
                <MiniActionButton label="-1" onPress={() => onAdjustPlayerStat(side, player.id, statCategory.id, -1)} tone="secondary" />
                <MiniActionButton label="+1" onPress={() => onAdjustPlayerStat(side, player.id, statCategory.id, 1)} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderCopy}>No players are assigned to this team yet.</Text>
        </View>
      )}
    </View>
  );
}

function ReviewTable({roster, title}) {
  return (
    <View style={styles.reviewCard}>
      <Text style={styles.cardEyebrow}>Final Review</Text>
      <Text style={styles.reviewTitle}>{title}</Text>
      <View style={styles.reviewTotalsRow}>
        {scoreboardStatCategories.map(category => (
          <View key={category.id} style={styles.reviewTotalPill}>
            <Text style={styles.reviewTotalValue}>{sumRosterStat(roster, category.id)}</Text>
            <Text style={styles.reviewTotalLabel}>{category.shortLabel}</Text>
          </View>
        ))}
      </View>
      {roster.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.reviewTable}>
            <View style={[styles.reviewRow, styles.reviewHeaderRow]}>
              <Text style={[styles.reviewCell, styles.reviewJerseyCell]}>#</Text>
              <Text style={[styles.reviewCell, styles.reviewNameCell]}>Player</Text>
              {scoreboardStatCategories.map(category => (
                <Text key={category.id} style={[styles.reviewCell, styles.reviewStatCell]}>{category.shortLabel}</Text>
              ))}
            </View>
            {roster.map(player => (
              <View key={player.id} style={styles.reviewRow}>
                <Text style={[styles.reviewCell, styles.reviewJerseyCell]}>#{player.jersey}</Text>
                <Text numberOfLines={1} style={[styles.reviewCell, styles.reviewNameCell]}>{player.name}</Text>
                {scoreboardStatCategories.map(category => (
                  <Text key={`${player.id}-${category.id}`} style={[styles.reviewCell, styles.reviewStatCell]}>{Number(player.stats?.[category.id] || 0)}</Text>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderCopy}>No final player stats are saved for this side yet.</Text>
        </View>
      )}
    </View>
  );
}

export function CoachBoardScreen({
  coachBoard,
  onAdjustPlayerStat,
  onAdjustScore,
  onAdjustSets,
  onFinishMatch,
  onGoHome,
  onResumeMatch,
  onSetPossession,
  onStartNewMatch,
  onToggleVisibility,
}) {
  const {width} = useWindowDimensions();
  const pagerRef = useRef(null);
  const [activeStatIndex, setActiveStatIndex] = useState(0);
  const isFinal = coachBoard.matchStatus === 'final';
  const isNarrow = width < 390;
  const cardWidth = Math.max(260, width - (isNarrow ? spacing.md * 2 : spacing.lg * 2) - (isNarrow ? spacing.md * 2 : spacing.lg * 2));
  const visibility = {...defaultScoreboardVisibility, ...(coachBoard.visibility || {})};
  const activeStatCategory = scoreboardStatCategories[activeStatIndex] || scoreboardStatCategories[0];
  const showScoreboard = visibility.showScoreboard;
  const showStats = visibility.showStats;
  const showAwayScoreboard = showScoreboard && visibility.showAwayScoreboard;
  const showAwayStats = showStats && visibility.showAwayStats;

  const jumpToStatPage = index => {
    setActiveStatIndex(index);
    pagerRef.current?.scrollTo({x: index * cardWidth, animated: true});
  };

  const handlePageEnd = event => {
    const nextIndex = Math.min(
      scoreboardStatCategories.length - 1,
      Math.max(0, Math.round(event.nativeEvent.contentOffset.x / cardWidth)),
    );
    setActiveStatIndex(nextIndex);
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={styles.safeArea}>
      <PageHeader onHomePress={onGoHome} />

      <View style={styles.controlCard}>
        <View style={styles.controlHeader}>
          <View style={[styles.modePill, isFinal && styles.modePillFinal]}>
            <Text style={styles.modePillLabel}>{isFinal ? 'Final Review' : 'Live Match'}</Text>
          </View>
          <Text style={styles.controlStamp}>{isFinal && coachBoard.finishedAt ? `Closed ${coachBoard.finishedAt}` : 'Choose the board layout you want live.'}</Text>
        </View>

        <Text style={styles.controlTitle}>View Control</Text>
        <View style={styles.toggleGrid}>
          <ToggleChip active={showScoreboard} label="Scoreboard" onPress={() => onToggleVisibility('showScoreboard')} />
          <ToggleChip active={showStats} label="Stats" onPress={() => onToggleVisibility('showStats')} />
          <ToggleChip active={visibility.showAwayScoreboard} label="Away Board" onPress={() => onToggleVisibility('showAwayScoreboard')} />
          <ToggleChip active={visibility.showAwayStats} label="Away Stats" onPress={() => onToggleVisibility('showAwayStats')} />
        </View>

        {!isFinal ? (
          <View style={styles.controlSection}>
            <Text style={styles.cardEyebrow}>Serve Control</Text>
            <View style={styles.actionRow}>
              <MiniActionButton label="Home Serve" onPress={() => onSetPossession('home')} tone={coachBoard.possession === 'home' ? 'primary' : 'secondary'} />
              {showAwayScoreboard ? (
                <MiniActionButton label="Away Serve" onPress={() => onSetPossession('away')} tone={coachBoard.possession === 'away' ? 'primary' : 'secondary'} />
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={styles.actionRowWide}>
          {isFinal ? (
            <>
              <NeonButton label="Reopen Match" onPress={onResumeMatch} />
              <NeonButton label="New Match" onPress={onStartNewMatch} tone="secondary" />
            </>
          ) : (
            <>
              <NeonButton label="Finish Match" onPress={onFinishMatch} />
              <NeonButton label="Reset Match" onPress={onStartNewMatch} tone="secondary" />
            </>
          )}
        </View>
      </View>

      {!showScoreboard && !showStats ? (
        <View style={styles.placeholderCard}>
          <Text style={styles.cardEyebrow}>Nothing Active</Text>
          <Text style={styles.placeholderTitle}>Turn a section back on</Text>
          <Text style={styles.placeholderCopy}>The scoreboard and stat panels are both hidden right now. Use the toggle row above to bring either one back.</Text>
        </View>
      ) : null}

      {showScoreboard ? (
        <View style={styles.boardCard}>
          <View style={styles.boardRow}>
            <BigScorePanel
              isFinal={isFinal}
              isNarrow={isNarrow}
              onAdjustScore={onAdjustScore}
              onAdjustSets={onAdjustSets}
              possession={coachBoard.possession}
              score={coachBoard.homeScore}
              sets={coachBoard.homeSets}
              side="home"
              title="HOME"
            />
            {showAwayScoreboard ? (
              <>
                <View style={styles.centerRail}>
                  <Text style={styles.centerRailEyebrow}>Match</Text>
                  <Text style={styles.centerRailValue}>VS</Text>
                  <Text style={styles.centerRailCopy}>{coachBoard.possession === 'home' ? 'Serve HOME' : 'Serve AWAY'}</Text>
                </View>
                <BigScorePanel
                  isFinal={isFinal}
                  isNarrow={isNarrow}
                  onAdjustScore={onAdjustScore}
                  onAdjustSets={onAdjustSets}
                  possession={coachBoard.possession}
                  score={coachBoard.awayScore}
                  sets={coachBoard.awaySets}
                  side="away"
                  title="AWAY"
                />
              </>
            ) : (
              <View style={styles.hiddenSideCard}>
                <Text style={styles.cardEyebrow}>Away Board Hidden</Text>
                <Text style={styles.hiddenSideCopy}>The live board is focused on home only.</Text>
              </View>
            )}
          </View>
        </View>
      ) : null}

      {showStats ? (
        isFinal ? (
          <>
            <View style={styles.reviewIntro}>
              <Text style={styles.cardEyebrow}>Finished Match</Text>
              <Text style={styles.reviewIntroTitle}>Player stat review</Text>
              <Text style={styles.reviewIntroCopy}>Hide the away stat side above whenever you only want your own team visible here.</Text>
            </View>
            <ReviewTable roster={coachBoard.homeRoster} title="HOME" />
            {showAwayStats ? <ReviewTable roster={coachBoard.awayRoster} title="AWAY" /> : null}
          </>
        ) : (
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <View>
                <Text style={styles.cardEyebrow}>Swipeable Panel</Text>
                <Text style={styles.statsTitle}>{activeStatCategory.label}</Text>
              </View>
              <Text style={styles.statsHint}>{activeStatCategory.hint}</Text>
            </View>

            <ScrollView horizontal pagingEnabled onMomentumScrollEnd={handlePageEnd} ref={pagerRef} showsHorizontalScrollIndicator={false}>
              {scoreboardStatCategories.map(category => (
                <View key={category.id} style={[styles.statsPage, {width: cardWidth}]}> 
                  <TeamStatPanel players={coachBoard.homeRoster} side="home" statCategory={category} title="HOME" onAdjustPlayerStat={onAdjustPlayerStat} />
                  {showAwayStats ? <TeamStatPanel players={coachBoard.awayRoster} side="away" statCategory={category} title="AWAY" onAdjustPlayerStat={onAdjustPlayerStat} /> : null}
                </View>
              ))}
            </ScrollView>

            <View style={styles.dotRow}>
              {scoreboardStatCategories.map((category, index) => (
                <View key={category.id} style={[styles.dot, activeStatIndex === index && styles.dotActive]} />
              ))}
            </View>

            <ScrollView horizontal contentContainerStyle={styles.categoryRow} showsHorizontalScrollIndicator={false}>
              {scoreboardStatCategories.map((category, index) => (
                <CategoryChip active={activeStatIndex === index} key={category.id} label={category.label} onPress={() => jumpToStatPage(index)} />
              ))}
            </ScrollView>
          </View>
        )
      ) : null}
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
  pressed: {
    transform: [{scale: 0.98}],
  },
  controlCard: {
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.44)',
    backgroundColor: 'rgba(18, 6, 25, 0.96)',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  modePill: {
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 209, 0.34)',
    backgroundColor: 'rgba(255, 63, 164, 0.18)',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  modePillFinal: {
    borderColor: 'rgba(126, 249, 255, 0.34)',
    backgroundColor: 'rgba(126, 249, 255, 0.14)',
  },
  modePillLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  controlStamp: {
    flex: 1,
    color: colors.textDim,
    fontSize: 12,
    textAlign: 'right',
  },
  controlTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(255, 110, 209, 0.82)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 8,
  },
  toggleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  toggleChip: {
    borderRadius: 14,
    borderWidth: 2,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleChipActive: {
    borderColor: 'rgba(255, 110, 209, 0.56)',
    backgroundColor: 'rgba(255, 63, 164, 0.2)',
  },
  toggleChipInactive: {
    borderColor: 'rgba(126, 249, 255, 0.18)',
    backgroundColor: 'rgba(11, 8, 18, 0.96)',
  },
  toggleChipLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  toggleChipLabelActive: {
    color: colors.text,
  },
  toggleChipLabelInactive: {
    color: colors.accent,
  },
  controlSection: {
    marginTop: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionRowWide: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  miniButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  miniButtonPrimary: {
    borderColor: 'rgba(255, 110, 209, 0.46)',
    backgroundColor: 'rgba(255, 63, 164, 0.18)',
  },
  miniButtonSecondary: {
    borderColor: 'rgba(126, 249, 255, 0.18)',
    backgroundColor: 'rgba(11, 8, 18, 0.96)',
  },
  miniButtonLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  miniButtonLabelPrimary: {
    color: colors.text,
  },
  miniButtonLabelSecondary: {
    color: colors.accent,
  },
  boardCard: {
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.44)',
    backgroundColor: 'rgba(18, 6, 25, 0.96)',
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.xs,
  },
  scorePanel: {
    flex: 1,
    minWidth: 0,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.34)',
    backgroundColor: 'rgba(12, 7, 18, 0.96)',
    padding: spacing.sm,
    alignItems: 'center',
  },
  scoreTitle: {
    color: colors.primarySoft,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  scoreTitleNarrow: {
    fontSize: 16,
    letterSpacing: 1.2,
  },
  servePill: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.24)',
    backgroundColor: 'rgba(10, 5, 16, 0.96)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    marginTop: 6,
  },
  servePillActive: {
    borderColor: 'rgba(255, 110, 209, 0.56)',
    backgroundColor: 'rgba(255, 63, 164, 0.18)',
  },
  servePillLabel: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  servePillLabelActive: {
    color: colors.text,
  },
  scoreValueWrap: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.46)',
    backgroundColor: 'rgba(255, 63, 164, 0.1)',
    paddingVertical: 4,
    marginVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    color: colors.text,
    fontSize: 72,
    lineHeight: 76,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 110, 209, 0.92)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 12,
  },
  scoreValueNarrow: {
    fontSize: 54,
    lineHeight: 58,
  },
  setReadout: {
    color: colors.primarySoft,
    fontSize: 16,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  rowGapSmall: {
    width: '100%',
    gap: spacing.xs,
  },
  centerRail: {
    width: 52,
    minWidth: 52,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(126, 249, 255, 0.22)',
    backgroundColor: 'rgba(8, 8, 14, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: spacing.sm,
  },
  centerRailEyebrow: {
    color: colors.textDim,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  centerRailValue: {
    color: colors.primaryBright,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.6,
    marginVertical: 2,
  },
  centerRailCopy: {
    color: colors.textMuted,
    fontSize: 8,
    lineHeight: 10,
    textAlign: 'center',
  },
  hiddenSideCard: {
    width: 96,
    minWidth: 96,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(126, 249, 255, 0.22)',
    backgroundColor: 'rgba(8, 8, 14, 0.72)',
    padding: spacing.sm,
    justifyContent: 'center',
  },
  hiddenSideCopy: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  statsCard: {
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.44)',
    backgroundColor: 'rgba(18, 6, 25, 0.96)',
    padding: spacing.lg,
  },
  statsHeader: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  cardEyebrow: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statsTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1.7,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(255, 110, 209, 0.82)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 8,
  },
  statsHint: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  statsPage: {
    gap: spacing.md,
  },
  statTeamCard: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.3)',
    backgroundColor: 'rgba(12, 7, 18, 0.96)',
    padding: spacing.md,
  },
  statTeamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statTeamTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  totalPill: {
    minWidth: 76,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.36)',
    backgroundColor: 'rgba(255, 63, 164, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  totalPillValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  totalPillLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  playerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },
  playerCard: {
    width: '48.5%',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.26)',
    backgroundColor: 'rgba(18, 8, 24, 0.96)',
    padding: spacing.sm,
  },
  playerJersey: {
    color: colors.primaryBright,
    fontSize: 22,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  playerName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  playerRole: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  playerValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    marginVertical: spacing.sm,
    textShadowColor: 'rgba(255, 110, 209, 0.84)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 8,
  },
  categoryRow: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: 2,
  },
  categoryChip: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.24)',
    backgroundColor: 'rgba(13, 10, 20, 0.92)',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  categoryChipActive: {
    borderColor: 'rgba(255, 110, 209, 0.54)',
    backgroundColor: 'rgba(255, 63, 164, 0.2)',
  },
  categoryChipLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  categoryChipLabelActive: {
    color: colors.text,
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 209, 0.28)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
    borderColor: 'rgba(255, 110, 209, 0.64)',
    backgroundColor: 'rgba(255, 63, 164, 0.76)',
  },
  reviewIntro: {
    marginBottom: spacing.md,
  },
  reviewIntroTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 6,
    textShadowColor: 'rgba(255, 110, 209, 0.82)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 8,
  },
  reviewIntroCopy: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  reviewCard: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.42)',
    backgroundColor: 'rgba(18, 6, 25, 0.96)',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  reviewTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  reviewTotalsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.sm,
    marginBottom: spacing.md,
  },
  reviewTotalPill: {
    minWidth: 82,
    marginRight: spacing.sm,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.3)',
    backgroundColor: 'rgba(255, 63, 164, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  reviewTotalValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  reviewTotalLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  reviewTable: {
    minWidth: 680,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.26)',
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(12, 9, 18, 0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 110, 209, 0.08)',
  },
  reviewHeaderRow: {
    backgroundColor: 'rgba(255, 63, 164, 0.18)',
  },
  reviewCell: {
    color: colors.text,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 12,
  },
  reviewJerseyCell: {
    width: 56,
    color: colors.primaryBright,
    fontWeight: '900',
  },
  reviewNameCell: {
    width: 180,
    fontWeight: '800',
  },
  reviewStatCell: {
    width: 62,
    textAlign: 'center',
    fontWeight: '800',
  },
  placeholderCard: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(126, 249, 255, 0.22)',
    backgroundColor: 'rgba(10, 8, 18, 0.92)',
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  placeholderTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  placeholderCopy: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
});

