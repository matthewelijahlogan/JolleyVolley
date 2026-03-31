import React, {useMemo, useRef, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View} from 'react-native';

import {NeonButton} from '../components/NeonButton';
import {PageHeader} from '../components/PageHeader';
import {scoreboardStatCategories} from '../data/dashboard';
import {colors, neonShadow, radii, spacing} from '../theme/theme';

function sumRosterStat(roster = [], statId) {
  return roster.reduce((total, player) => total + Number(player.stats?.[statId] || 0), 0);
}

function MiniActionButton({label, onPress, tone = 'primary'}) {
  const primary = tone === 'primary';

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.miniButton,
        primary ? styles.miniButtonPrimary : styles.miniButtonSecondary,
        pressed && styles.miniButtonPressed,
      ]}>
      <Text style={[styles.miniButtonLabel, primary ? styles.miniButtonLabelPrimary : styles.miniButtonLabelSecondary]}>
        {label}
      </Text>
    </Pressable>
  );
}

function CategoryChip({active, label, onPress}) {
  return (
    <Pressable onPress={onPress} style={({pressed}) => [styles.categoryChip, active && styles.categoryChipActive, pressed && styles.categoryChipPressed]}>
      <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function PlayerStatTile({player, statCategory, teamSide, onAdjustPlayerStat}) {
  const value = Number(player.stats?.[statCategory.id] || 0);

  return (
    <View style={styles.playerTile}>
      <View style={styles.playerTileTop}>
        <Text style={styles.playerJersey}>#{player.jersey}</Text>
        <Text numberOfLines={1} style={styles.playerName}>{player.name}</Text>
        <Text style={styles.playerRole}>{player.role}</Text>
      </View>
      <Text style={styles.playerStatValue}>{value}</Text>
      <View style={styles.playerActionRow}>
        <MiniActionButton
          label="-1"
          onPress={() => onAdjustPlayerStat(teamSide, player.id, statCategory.id, -1)}
          tone="secondary"
        />
        <MiniActionButton label="+1" onPress={() => onAdjustPlayerStat(teamSide, player.id, statCategory.id, 1)} />
      </View>
    </View>
  );
}

function QuickTeamPanel({players, statCategory, teamLabel, teamSide, onAdjustPlayerStat}) {
  const total = useMemo(() => sumRosterStat(players, statCategory.id), [players, statCategory.id]);

  return (
    <View style={styles.quickTeamPanel}>
      <View style={styles.quickTeamHeader}>
        <View>
          <Text style={styles.quickTeamEyebrow}>{teamSide === 'home' ? 'Home' : 'Away'}</Text>
          <Text style={styles.quickTeamTitle}>{teamLabel}</Text>
        </View>
        <View style={styles.quickTeamTotalPill}>
          <Text style={styles.quickTeamTotalValue}>{total}</Text>
          <Text style={styles.quickTeamTotalLabel}>{statCategory.label}</Text>
        </View>
      </View>

      <View style={styles.playerGrid}>
        {players.map(player => (
          <PlayerStatTile
            key={player.id}
            onAdjustPlayerStat={onAdjustPlayerStat}
            player={player}
            statCategory={statCategory}
            teamSide={teamSide}
          />
        ))}
      </View>
    </View>
  );
}

function ReviewTeamCard({roster, teamName}) {
  const totals = scoreboardStatCategories.map(category => ({
    ...category,
    value: sumRosterStat(roster, category.id),
  }));

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View>
          <Text style={styles.reviewEyebrow}>Team Review</Text>
          <Text style={styles.reviewTitle}>{teamName}</Text>
        </View>
      </View>

      <View style={styles.reviewTotalsRow}>
        {totals.map(category => (
          <View key={category.id} style={styles.reviewTotalPill}>
            <Text style={styles.reviewTotalValue}>{category.value}</Text>
            <Text style={styles.reviewTotalLabel}>{category.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.reviewTable}>
          <View style={[styles.reviewRow, styles.reviewHeaderRow]}>
            <Text style={[styles.reviewCell, styles.reviewCellJersey]}>#</Text>
            <Text style={[styles.reviewCell, styles.reviewCellName]}>Player</Text>
            {scoreboardStatCategories.map(category => (
              <Text key={category.id} style={[styles.reviewCell, styles.reviewCellStat]}>{category.shortLabel}</Text>
            ))}
          </View>

          {roster.map(player => (
            <View key={player.id} style={styles.reviewRow}>
              <Text style={[styles.reviewCell, styles.reviewCellJersey]}>#{player.jersey}</Text>
              <Text numberOfLines={1} style={[styles.reviewCell, styles.reviewCellName]}>{player.name}</Text>
              {scoreboardStatCategories.map(category => (
                <Text key={`${player.id}-${category.id}`} style={[styles.reviewCell, styles.reviewCellStat]}>
                  {Number(player.stats?.[category.id] || 0)}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
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
}) {
  const {width} = useWindowDimensions();
  const pagerRef = useRef(null);
  const [activeStatIndex, setActiveStatIndex] = useState(0);
  const isFinal = coachBoard.matchStatus === 'final';
  const panelPageWidth = Math.max(280, width - (spacing.lg * 2) - (spacing.lg * 2));
  const activeStatCategory = scoreboardStatCategories[activeStatIndex] || scoreboardStatCategories[0];
  const servingTeamName = coachBoard.possession === 'home' ? coachBoard.homeTeam : coachBoard.awayTeam;

  const jumpToStatPage = index => {
    setActiveStatIndex(index);
    pagerRef.current?.scrollTo({
      x: index * panelPageWidth,
      animated: true,
    });
  };

  const handlePageEnd = event => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const nextIndex = Math.min(
      scoreboardStatCategories.length - 1,
      Math.max(0, Math.round(offsetX / panelPageWidth)),
    );
    setActiveStatIndex(nextIndex);
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={styles.safeArea}>
      <PageHeader onHomePress={onGoHome} />

      <View style={styles.scoreCard}>
        <View style={styles.matchHeaderRow}>
          <View style={[styles.modePill, isFinal && styles.modePillFinal]}>
            <Text style={styles.modePillText}>{isFinal ? 'Final Review' : 'Live Match'}</Text>
          </View>
          <Text style={styles.matchStamp}>{isFinal && coachBoard.finishedAt ? `Closed ${coachBoard.finishedAt}` : 'Big score first. Swipe stats second.'}</Text>
        </View>

        <View style={styles.scoreMainRow}>
          <View style={styles.teamScorePanel}>
            <Text style={styles.teamName}>{coachBoard.homeTeam}</Text>
            <View style={[styles.serveBadge, coachBoard.possession === 'home' && styles.serveBadgeActive]}>
              <Text style={[styles.serveBadgeText, coachBoard.possession === 'home' && styles.serveBadgeTextActive]}>
                {coachBoard.possession === 'home' ? 'Serving' : 'Receive'}
              </Text>
            </View>
            <Text style={styles.scoreValue}>{coachBoard.homeScore}</Text>

            {!isFinal ? (
              <>
                <View style={styles.pointControlRow}>
                  <MiniActionButton label="-1" onPress={() => onAdjustScore('home', -1)} tone="secondary" />
                  <MiniActionButton label="+1" onPress={() => onAdjustScore('home', 1)} />
                </View>
                <View style={styles.setControlRow}>
                  <Text style={styles.setValue}>Sets {coachBoard.homeSets}</Text>
                  <View style={styles.setControlButtons}>
                    <MiniActionButton label="-S" onPress={() => onAdjustSets('home', -1)} tone="secondary" />
                    <MiniActionButton label="+S" onPress={() => onAdjustSets('home', 1)} />
                  </View>
                </View>
              </>
            ) : (
              <Text style={styles.finalSetText}>Sets {coachBoard.homeSets}</Text>
            )}
          </View>

          <View style={styles.scoreCenterRail}>
            <Text style={styles.centerEyebrow}>Match</Text>
            <Text style={styles.centerValue}>VS</Text>
            <Text style={styles.centerMeta}>Serve with {servingTeamName}</Text>
          </View>

          <View style={styles.teamScorePanel}>
            <Text style={styles.teamName}>{coachBoard.awayTeam}</Text>
            <View style={[styles.serveBadge, coachBoard.possession === 'away' && styles.serveBadgeActive]}>
              <Text style={[styles.serveBadgeText, coachBoard.possession === 'away' && styles.serveBadgeTextActive]}>
                {coachBoard.possession === 'away' ? 'Serving' : 'Receive'}
              </Text>
            </View>
            <Text style={styles.scoreValue}>{coachBoard.awayScore}</Text>

            {!isFinal ? (
              <>
                <View style={styles.pointControlRow}>
                  <MiniActionButton label="-1" onPress={() => onAdjustScore('away', -1)} tone="secondary" />
                  <MiniActionButton label="+1" onPress={() => onAdjustScore('away', 1)} />
                </View>
                <View style={styles.setControlRow}>
                  <Text style={styles.setValue}>Sets {coachBoard.awaySets}</Text>
                  <View style={styles.setControlButtons}>
                    <MiniActionButton label="-S" onPress={() => onAdjustSets('away', -1)} tone="secondary" />
                    <MiniActionButton label="+S" onPress={() => onAdjustSets('away', 1)} />
                  </View>
                </View>
              </>
            ) : (
              <Text style={styles.finalSetText}>Sets {coachBoard.awaySets}</Text>
            )}
          </View>
        </View>

        {!isFinal ? (
          <View style={styles.scoreFooter}>
            <View style={styles.serveToggleRow}>
              <MiniActionButton label="Home Serve" onPress={() => onSetPossession('home')} tone={coachBoard.possession === 'home' ? 'primary' : 'secondary'} />
              <MiniActionButton label="Away Serve" onPress={() => onSetPossession('away')} tone={coachBoard.possession === 'away' ? 'primary' : 'secondary'} />
            </View>

            <View style={styles.modeActionRow}>
              <View style={styles.modeButtonWrap}>
                <NeonButton label="Finish Match" onPress={onFinishMatch} />
              </View>
              <View style={styles.modeButtonWrap}>
                <NeonButton label="Reset Match" onPress={onStartNewMatch} tone="secondary" />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.modeActionRow}>
            <View style={styles.modeButtonWrap}>
              <NeonButton label="Reopen Match" onPress={onResumeMatch} />
            </View>
            <View style={styles.modeButtonWrap}>
              <NeonButton label="New Match" onPress={onStartNewMatch} tone="secondary" />
            </View>
          </View>
        )}
      </View>

      {isFinal ? (
        <>
          <View style={styles.reviewIntro}>
            <Text style={styles.reviewIntroEyebrow}>Finished Match</Text>
            <Text style={styles.reviewIntroTitle}>Individual team statistics</Text>
            <Text style={styles.reviewIntroCopy}>Every player line stays visible here after the match is closed so you can review both teams cleanly.</Text>
          </View>
          <ReviewTeamCard roster={coachBoard.homeRoster} teamName={coachBoard.homeTeam} />
          <ReviewTeamCard roster={coachBoard.awayRoster} teamName={coachBoard.awayTeam} />
        </>
      ) : (
        <View style={styles.panelCard}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelEyebrow}>Swipeable Stat Panel</Text>
              <Text style={styles.panelTitle}>{activeStatCategory.label}</Text>
            </View>
            <Text style={styles.panelHint}>{activeStatCategory.hint}</Text>
          </View>

          <ScrollView
            horizontal
            onMomentumScrollEnd={handlePageEnd}
            pagingEnabled
            ref={pagerRef}
            showsHorizontalScrollIndicator={false}
            style={styles.pager}
          >
            {scoreboardStatCategories.map(category => (
              <View key={category.id} style={[styles.pagerPage, {width: panelPageWidth}]}> 
                <QuickTeamPanel
                  onAdjustPlayerStat={onAdjustPlayerStat}
                  players={coachBoard.homeRoster}
                  statCategory={category}
                  teamLabel={coachBoard.homeTeam}
                  teamSide="home"
                />
                <QuickTeamPanel
                  onAdjustPlayerStat={onAdjustPlayerStat}
                  players={coachBoard.awayRoster}
                  statCategory={category}
                  teamLabel={coachBoard.awayTeam}
                  teamSide="away"
                />
              </View>
            ))}
          </ScrollView>

          <View style={styles.pageDotsRow}>
            {scoreboardStatCategories.map((category, index) => (
              <View key={category.id} style={[styles.pageDot, activeStatIndex === index && styles.pageDotActive]} />
            ))}
          </View>

          <ScrollView contentContainerStyle={styles.categoryChipRow} horizontal showsHorizontalScrollIndicator={false}>
            {scoreboardStatCategories.map((category, index) => (
              <CategoryChip
                active={activeStatIndex === index}
                key={category.id}
                label={category.label}
                onPress={() => jumpToStatPage(index)}
              />
            ))}
          </ScrollView>
        </View>
      )}
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
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surfaceStrong,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...neonShadow,
  },
  matchHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  modePill: {
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 209, 0.35)',
    backgroundColor: 'rgba(255, 63, 164, 0.16)',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  modePillFinal: {
    backgroundColor: 'rgba(126, 249, 255, 0.14)',
    borderColor: 'rgba(126, 249, 255, 0.35)',
  },
  modePillText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  matchStamp: {
    flex: 1,
    color: colors.textDim,
    fontSize: 12,
    textAlign: 'right',
  },
  scoreMainRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  teamScorePanel: {
    flex: 1,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 209, 0.24)',
    backgroundColor: 'rgba(255, 63, 164, 0.08)',
    padding: spacing.md,
    alignItems: 'center',
  },
  teamName: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 28,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  serveBadge: {
    marginTop: spacing.sm,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 209, 0.2)',
    backgroundColor: 'rgba(16, 10, 26, 0.9)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  serveBadgeActive: {
    backgroundColor: 'rgba(255, 63, 164, 0.18)',
    borderColor: 'rgba(255, 110, 209, 0.4)',
  },
  serveBadgeText: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  serveBadgeTextActive: {
    color: colors.text,
  },
  scoreValue: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 102,
    lineHeight: 102,
    letterSpacing: 1.4,
    marginVertical: spacing.sm,
  },
  pointControlRow: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  setControlRow: {
    width: '100%',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(126, 249, 255, 0.16)',
    backgroundColor: 'rgba(8, 8, 14, 0.48)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  setValue: {
    color: colors.primarySoft,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  setControlButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  finalSetText: {
    color: colors.primarySoft,
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  scoreCenterRail: {
    width: 76,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  centerEyebrow: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  centerValue: {
    color: colors.accent,
    fontFamily: 'Bangers',
    fontSize: 38,
    letterSpacing: 1,
    marginVertical: spacing.xs,
  },
  centerMeta: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  scoreFooter: {
    gap: spacing.md,
  },
  serveToggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modeActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  modeButtonWrap: {
    flex: 1,
  },
  miniButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: radii.round,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  miniButtonPrimary: {
    backgroundColor: 'rgba(255, 63, 164, 0.18)',
    borderColor: 'rgba(255, 110, 209, 0.34)',
  },
  miniButtonSecondary: {
    backgroundColor: 'rgba(14, 11, 22, 0.92)',
    borderColor: 'rgba(126, 249, 255, 0.18)',
  },
  miniButtonPressed: {
    transform: [{scale: 0.98}],
  },
  miniButtonLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  miniButtonLabelPrimary: {
    color: colors.text,
  },
  miniButtonLabelSecondary: {
    color: colors.accent,
  },
  panelCard: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    ...neonShadow,
  },
  panelHeader: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  panelEyebrow: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  panelTitle: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 34,
    letterSpacing: 0.8,
  },
  panelHint: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  pager: {
    marginHorizontal: -spacing.xs,
  },
  pagerPage: {
    gap: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  quickTeamPanel: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 209, 0.18)',
    backgroundColor: 'rgba(13, 10, 20, 0.86)',
    padding: spacing.md,
  },
  quickTeamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  quickTeamEyebrow: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  quickTeamTitle: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 26,
    letterSpacing: 0.8,
  },
  quickTeamTotalPill: {
    minWidth: 76,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(126, 249, 255, 0.24)',
    backgroundColor: 'rgba(126, 249, 255, 0.08)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  quickTeamTotalValue: {
    color: colors.accent,
    fontFamily: 'Bangers',
    fontSize: 24,
  },
  quickTeamTotalLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  playerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },
  playerTile: {
    width: '48.5%',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 209, 0.18)',
    backgroundColor: 'rgba(255, 63, 164, 0.07)',
    padding: spacing.sm,
  },
  playerTileTop: {
    marginBottom: spacing.sm,
  },
  playerJersey: {
    color: colors.accent,
    fontFamily: 'Bangers',
    fontSize: 26,
    letterSpacing: 0.8,
  },
  playerName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  playerRole: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  playerStatValue: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 32,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  playerActionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  pageDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  pageDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  pageDotActive: {
    width: 20,
    backgroundColor: colors.primaryBright,
  },
  categoryChipRow: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: 2,
  },
  categoryChip: {
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 209, 0.18)',
    backgroundColor: 'rgba(13, 10, 20, 0.86)',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  categoryChipActive: {
    backgroundColor: 'rgba(255, 63, 164, 0.18)',
    borderColor: 'rgba(255, 110, 209, 0.36)',
  },
  categoryChipPressed: {
    transform: [{scale: 0.98}],
  },
  categoryChipText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  categoryChipTextActive: {
    color: colors.text,
  },
  reviewIntro: {
    marginBottom: spacing.md,
  },
  reviewIntroEyebrow: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  reviewIntroTitle: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 34,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  reviewIntroCopy: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  reviewCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...neonShadow,
  },
  reviewHeader: {
    marginBottom: spacing.md,
  },
  reviewEyebrow: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  reviewTitle: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 30,
    letterSpacing: 0.8,
  },
  reviewTotalsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.sm,
    marginBottom: spacing.md,
  },
  reviewTotalPill: {
    minWidth: 92,
    marginRight: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 209, 0.18)',
    backgroundColor: 'rgba(255, 63, 164, 0.08)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  reviewTotalValue: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 22,
  },
  reviewTotalLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  reviewTable: {
    minWidth: 680,
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 209, 0.18)',
  },
  reviewHeaderRow: {
    backgroundColor: 'rgba(255, 63, 164, 0.12)',
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(12, 9, 18, 0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 110, 209, 0.08)',
  },
  reviewCell: {
    color: colors.text,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 12,
  },
  reviewCellJersey: {
    width: 56,
    color: colors.accent,
    fontFamily: 'Bangers',
    fontSize: 18,
  },
  reviewCellName: {
    width: 180,
    fontWeight: '700',
  },
  reviewCellStat: {
    width: 62,
    textAlign: 'center',
    fontWeight: '700',
  },
});
