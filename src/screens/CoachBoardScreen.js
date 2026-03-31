import React, {useMemo, useRef, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View} from 'react-native';

import {NeonButton} from '../components/NeonButton';
import {PageHeader} from '../components/PageHeader';
import {scoreboardStatCategories} from '../data/dashboard';
import {colors, radii, spacing} from '../theme/theme';

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
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.categoryChip, active && styles.categoryChipActive, pressed && styles.categoryChipPressed]}>
      <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function PlayerStatTile({isVeryCompact, player, statCategory, teamSide, onAdjustPlayerStat}) {
  const value = Number(player.stats?.[statCategory.id] || 0);

  return (
    <View style={[styles.playerTile, isVeryCompact && styles.playerTileCompact]}>
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

function QuickTeamPanel({isCompact, isVeryCompact, players, statCategory, teamLabel, teamSide, onAdjustPlayerStat}) {
  const total = useMemo(() => sumRosterStat(players, statCategory.id), [players, statCategory.id]);

  return (
    <View style={[styles.quickTeamPanel, isCompact && styles.quickTeamPanelCompact]}>
      <View style={[styles.quickTeamHeader, isCompact && styles.quickTeamHeaderCompact]}>
        <View style={styles.quickTeamTitleWrap}>
          <Text style={styles.quickTeamEyebrow}>{teamSide === 'home' ? 'Home' : 'Away'}</Text>
          <Text numberOfLines={2} style={styles.quickTeamTitle}>{teamLabel}</Text>
        </View>
        <View style={[styles.quickTeamTotalPill, isCompact && styles.quickTeamTotalPillCompact]}>
          <Text style={styles.quickTeamTotalValue}>{total}</Text>
          <Text style={styles.quickTeamTotalLabel}>{statCategory.label}</Text>
        </View>
      </View>

      <View style={styles.playerGrid}>
        {players.map(player => (
          <PlayerStatTile
            isVeryCompact={isVeryCompact}
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
  const isCompact = width < 430;
  const isVeryCompact = width < 380;
  const screenPadding = isCompact ? spacing.md : spacing.lg;
  const cardPadding = isCompact ? spacing.md : spacing.lg;
  const panelPageWidth = Math.max(248, width - (screenPadding * 2) - (cardPadding * 2));
  const activeStatCategory = scoreboardStatCategories[activeStatIndex] || scoreboardStatCategories[0];
  const homeDisplayLabel = 'HOME';
  const awayDisplayLabel = 'AWAY';
  const servingTeamName = coachBoard.possession === 'home' ? homeDisplayLabel : awayDisplayLabel;

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
    <ScrollView contentContainerStyle={[styles.content, isCompact && styles.contentCompact]} showsVerticalScrollIndicator={false} style={styles.safeArea}>
      <PageHeader onHomePress={onGoHome} />

      <View style={[styles.scoreCard, isCompact && styles.scoreCardCompact]}>
        <View style={[styles.matchHeaderRow, isCompact && styles.matchHeaderRowCompact]}>
          <View style={[styles.modePill, isFinal && styles.modePillFinal]}>
            <Text style={styles.modePillText}>{isFinal ? 'Final Review' : 'Live Match'}</Text>
          </View>
          <Text style={[styles.matchStamp, isCompact && styles.matchStampCompact]}>
            {isFinal && coachBoard.finishedAt ? `Closed ${coachBoard.finishedAt}` : 'Big score first. Swipe stats second.'}
          </Text>
        </View>

        <View style={[styles.scoreMainRow, isCompact && styles.scoreMainRowCompact]}>
          <View style={[styles.teamScorePanel, isCompact && styles.teamScorePanelCompact]}>
            <Text numberOfLines={2} style={[styles.teamName, isCompact && styles.teamNameCompact]}>{homeDisplayLabel}</Text>
            <View style={[styles.serveBadge, coachBoard.possession === 'home' && styles.serveBadgeActive]}>
              <Text style={[styles.serveBadgeText, coachBoard.possession === 'home' && styles.serveBadgeTextActive]}>
                {coachBoard.possession === 'home' ? 'Serving' : 'Receive'}
              </Text>
            </View>
            <View style={[styles.scoreValueFrame, isCompact && styles.scoreValueFrameCompact]}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={[
                  styles.scoreValue,
                  isCompact && styles.scoreValueCompact,
                  isVeryCompact && styles.scoreValueVeryCompact,
                ]}>
                {coachBoard.homeScore}
              </Text>
            </View>

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

          <View style={[styles.scoreCenterRail, isCompact && styles.scoreCenterRailCompact]}>
            <Text style={styles.centerEyebrow}>Match</Text>
            <Text style={[styles.centerValue, isCompact && styles.centerValueCompact]}>VS</Text>
            <Text style={[styles.centerMeta, isCompact && styles.centerMetaCompact]}>Serve with {servingTeamName}</Text>
          </View>

          <View style={[styles.teamScorePanel, isCompact && styles.teamScorePanelCompact]}>
            <Text numberOfLines={2} style={[styles.teamName, isCompact && styles.teamNameCompact]}>{awayDisplayLabel}</Text>
            <View style={[styles.serveBadge, coachBoard.possession === 'away' && styles.serveBadgeActive]}>
              <Text style={[styles.serveBadgeText, coachBoard.possession === 'away' && styles.serveBadgeTextActive]}>
                {coachBoard.possession === 'away' ? 'Serving' : 'Receive'}
              </Text>
            </View>
            <View style={[styles.scoreValueFrame, isCompact && styles.scoreValueFrameCompact]}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={[
                  styles.scoreValue,
                  isCompact && styles.scoreValueCompact,
                  isVeryCompact && styles.scoreValueVeryCompact,
                ]}>
                {coachBoard.awayScore}
              </Text>
            </View>

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
            <View style={[styles.serveToggleRow, isCompact && styles.serveToggleRowCompact]}>
              <MiniActionButton
                label="Home Serve"
                onPress={() => onSetPossession('home')}
                tone={coachBoard.possession === 'home' ? 'primary' : 'secondary'}
              />
              <MiniActionButton
                label="Away Serve"
                onPress={() => onSetPossession('away')}
                tone={coachBoard.possession === 'away' ? 'primary' : 'secondary'}
              />
            </View>

            <View style={[styles.modeActionRow, isCompact && styles.modeActionRowCompact]}>
              <View style={styles.modeButtonWrap}>
                <NeonButton label="Finish Match" onPress={onFinishMatch} />
              </View>
              <View style={styles.modeButtonWrap}>
                <NeonButton label="Reset Match" onPress={onStartNewMatch} tone="secondary" />
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.modeActionRow, isCompact && styles.modeActionRowCompact]}>
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
          <ReviewTeamCard roster={coachBoard.homeRoster} teamName={homeDisplayLabel} />
          <ReviewTeamCard roster={coachBoard.awayRoster} teamName={awayDisplayLabel} />
        </>
      ) : (
        <View style={[styles.panelCard, isCompact && styles.panelCardCompact]}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelEyebrow}>Swipeable Stat Panel</Text>
              <Text style={[styles.panelTitle, isCompact && styles.panelTitleCompact]}>{activeStatCategory.label}</Text>
            </View>
            <Text style={styles.panelHint}>{activeStatCategory.hint}</Text>
          </View>

          <ScrollView
            horizontal
            onMomentumScrollEnd={handlePageEnd}
            pagingEnabled
            ref={pagerRef}
            showsHorizontalScrollIndicator={false}
            style={styles.pager}>
            {scoreboardStatCategories.map(category => (
              <View key={category.id} style={[styles.pagerPage, {width: panelPageWidth}]}> 
                <QuickTeamPanel
                  isCompact={isCompact}
                  isVeryCompact={isVeryCompact}
                  onAdjustPlayerStat={onAdjustPlayerStat}
                  players={coachBoard.homeRoster}
                  statCategory={category}
                  teamLabel={homeDisplayLabel}
                  teamSide="home"
                />
                <QuickTeamPanel
                  isCompact={isCompact}
                  isVeryCompact={isVeryCompact}
                  onAdjustPlayerStat={onAdjustPlayerStat}
                  players={coachBoard.awayRoster}
                  statCategory={category}
                  teamLabel={awayDisplayLabel}
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
  contentCompact: {
    paddingHorizontal: spacing.md,
  },
  scoreCard: {
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.5)',
    backgroundColor: 'rgba(18, 6, 25, 0.98)',
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.primaryBright,
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 16,
  },
  scoreCardCompact: {
    padding: spacing.md,
  },
  matchHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  matchHeaderRowCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
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
  matchStampCompact: {
    textAlign: 'left',
  },
  scoreMainRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  scoreMainRowCompact: {
    flexDirection: 'column',
    gap: spacing.md,
  },
  teamScorePanel: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.44)',
    backgroundColor: 'rgba(14, 6, 20, 0.96)',
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.primaryBright,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 10,
  },
  teamScorePanelCompact: {
    width: '100%',
  },
  teamName: {
    color: colors.primarySoft,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2.4,
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(255, 110, 209, 0.9)',
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowRadius: 10,
  },
  teamNameCompact: {
    fontSize: 21,
  },
  serveBadge: {
    marginTop: spacing.sm,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.24)',
    backgroundColor: 'rgba(10, 5, 16, 0.96)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  serveBadgeActive: {
    backgroundColor: 'rgba(255, 63, 164, 0.22)',
    borderColor: 'rgba(255, 110, 209, 0.56)',
    shadowColor: colors.primaryBright,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 6,
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
  scoreValueFrame: {
    minWidth: 154,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.48)',
    backgroundColor: 'rgba(255, 63, 164, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginVertical: spacing.sm,
    shadowColor: colors.primaryBright,
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 10,
  },
  scoreValueFrameCompact: {
    minWidth: 124,
    width: '100%',
    marginVertical: spacing.xs,
  },
  scoreValue: {
    color: colors.text,
    fontSize: 96,
    lineHeight: 100,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
    letterSpacing: 2.5,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 110, 209, 0.95)',
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowRadius: 18,
  },
  scoreValueCompact: {
    fontSize: 78,
    lineHeight: 82,
  },
  scoreValueVeryCompact: {
    fontSize: 64,
    lineHeight: 68,
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
  scoreCenterRailCompact: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(126, 249, 255, 0.16)',
    backgroundColor: 'rgba(8, 8, 14, 0.48)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  centerEyebrow: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  centerValue: {
    color: colors.primaryBright,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 3,
    marginVertical: spacing.xs,
    textShadowColor: 'rgba(255, 110, 209, 0.9)',
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowRadius: 12,
  },
  centerValueCompact: {
    fontSize: 30,
    marginVertical: 0,
  },
  centerMeta: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  centerMetaCompact: {
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.sm,
  },
  scoreFooter: {
    gap: spacing.md,
  },
  serveToggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  serveToggleRowCompact: {
    flexDirection: 'column',
  },
  modeActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  modeActionRowCompact: {
    flexDirection: 'column',
  },
  modeButtonWrap: {
    flex: 1,
  },
  miniButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 2,
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
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.42)',
    backgroundColor: 'rgba(16, 6, 23, 0.96)',
    padding: spacing.lg,
    shadowColor: colors.primaryBright,
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 12,
  },
  panelCardCompact: {
    padding: spacing.md,
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
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(255, 110, 209, 0.88)',
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowRadius: 10,
  },
  panelTitleCompact: {
    fontSize: 24,
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
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.34)',
    backgroundColor: 'rgba(10, 4, 15, 0.94)',
    padding: spacing.md,
    shadowColor: colors.primaryBright,
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 8,
  },
  quickTeamPanelCompact: {
    padding: spacing.sm,
  },
  quickTeamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  quickTeamHeaderCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  quickTeamTitleWrap: {
    flexShrink: 1,
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
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(255, 110, 209, 0.72)',
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowRadius: 8,
  },
  quickTeamTotalPill: {
    minWidth: 82,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.4)',
    backgroundColor: 'rgba(255, 63, 164, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  quickTeamTotalPillCompact: {
    alignSelf: 'stretch',
  },
  quickTeamTotalValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1.2,
    textShadowColor: 'rgba(255, 110, 209, 0.82)',
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowRadius: 8,
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
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.28)',
    backgroundColor: 'rgba(20, 8, 28, 0.94)',
    padding: spacing.sm,
    shadowColor: colors.primaryBright,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 5,
  },
  playerTileCompact: {
    width: '100%',
  },
  playerTileTop: {
    marginBottom: spacing.sm,
  },
  playerJersey: {
    color: colors.primaryBright,
    fontSize: 22,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1.4,
    textShadowColor: 'rgba(255, 110, 209, 0.8)',
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowRadius: 8,
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
    fontSize: 30,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1.4,
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(255, 110, 209, 0.84)',
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowRadius: 10,
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
    width: 10,
    height: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 209, 0.28)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  pageDotActive: {
    width: 24,
    borderRadius: 4,
    borderColor: 'rgba(255, 110, 209, 0.64)',
    backgroundColor: 'rgba(255, 63, 164, 0.76)',
  },
  categoryChipRow: {
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
    backgroundColor: 'rgba(255, 63, 164, 0.22)',
    borderColor: 'rgba(255, 110, 209, 0.52)',
    shadowColor: colors.primaryBright,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 6,
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
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: 6,
    textShadowColor: 'rgba(255, 110, 209, 0.82)',
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowRadius: 10,
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
    backgroundColor: 'rgba(16, 6, 23, 0.96)',
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.primaryBright,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 10,
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
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(255, 110, 209, 0.8)',
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowRadius: 8,
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
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.32)',
    backgroundColor: 'rgba(255, 63, 164, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  reviewTotalValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1.2,
    textShadowColor: 'rgba(255, 110, 209, 0.76)',
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowRadius: 8,
  },
  reviewTotalLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  reviewTable: {
    minWidth: 680,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.28)',
  },
  reviewHeaderRow: {
    backgroundColor: 'rgba(255, 63, 164, 0.2)',
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
    color: colors.primaryBright,
    fontSize: 16,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
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
