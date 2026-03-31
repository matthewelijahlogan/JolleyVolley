import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {NeonButton} from '../components/NeonButton';
import {PageHeader} from '../components/PageHeader';
import {colors, neonShadow, radii, spacing} from '../theme/theme';

const toneStyles = {
  good: {
    badgeBorderColor: 'rgba(89, 255, 168, 0.38)',
    badgeBackgroundColor: 'rgba(89, 255, 168, 0.14)',
    badgeTextColor: colors.success,
  },
  neutral: {
    badgeBorderColor: 'rgba(126, 249, 255, 0.28)',
    badgeBackgroundColor: 'rgba(126, 249, 255, 0.12)',
    badgeTextColor: colors.accent,
  },
  warn: {
    badgeBorderColor: 'rgba(255, 182, 88, 0.35)',
    badgeBackgroundColor: 'rgba(255, 182, 88, 0.14)',
    badgeTextColor: '#FFC766',
  },
  alert: {
    badgeBorderColor: 'rgba(255, 95, 95, 0.36)',
    badgeBackgroundColor: 'rgba(255, 95, 95, 0.14)',
    badgeTextColor: '#FF9C9C',
  },
};

function MetricTile({label, value, detail}) {
  return (
    <View style={styles.metricTile}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricDetail}>{detail}</Text>
    </View>
  );
}

function AssessmentCard({item}) {
  const tone = toneStyles[item.tone] || toneStyles.neutral;

  return (
    <View style={styles.assessmentCard}>
      <View style={styles.assessmentTopRow}>
        <View style={styles.assessmentTitleWrap}>
          <Text style={styles.assessmentLabel}>{item.label}</Text>
          <Text style={styles.assessmentValue}>{item.value}</Text>
        </View>
        <View
          style={[
            styles.assessmentBadge,
            {
              borderColor: tone.badgeBorderColor,
              backgroundColor: tone.badgeBackgroundColor,
            },
          ]}>
          <Text style={[styles.assessmentBadgeLabel, {color: tone.badgeTextColor}]}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.assessmentNote}>{item.note}</Text>
    </View>
  );
}

export function MetricsScreen({analysisInput, analysisResult, onGoHome, onOpenScreen, selectedVideo, trackingStatus}) {
  return (
    <ScrollView style={styles.safeArea} contentContainerStyle={styles.content}>
      <PageHeader onHomePress={onGoHome} />

      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>Tabulated Figures</Text>
        <Text style={styles.cardTitle}>Motion Stats</Text>
        <Text style={styles.cardCopy}>
          This page gathers the current rep figures into one place so the coach can see the whole motion profile at once.
        </Text>
      </View>

      {analysisResult ? (
        <>
          <View style={styles.metricGrid}>
            <MetricTile
              detail="Contact reach minus standing reach"
              label="Vertical Leap"
              value={`${analysisResult.verticalLeapInches} in`}
            />
            <MetricTile
              detail={analysisResult.ballSpeedSource === 'ball-track' ? 'Detected directly from the tracked ball trail' : analysisResult.ballSpeedSource === 'tracked-estimate' ? 'Auto-estimated from the tracked swing model' : 'Ball travel distance over release time'}
              label="Ball Speed"
              value={`${analysisResult.ballSpeedMph} MPH`}
            />
            <MetricTile
              detail="Pause severity through the swing"
              label="Hitch Severity"
              value={analysisResult.hitchSeverity}
            />
            <MetricTile
              detail="Current session contact timing label"
              label="Contact Point"
              value={analysisResult.contactPoint}
            />
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Current Rep Breakdown</Text>
            <Text style={styles.sectionCopy}>
              Every current figure is tabulated below so the rep can be reviewed as a full motion snapshot instead of a single number.
            </Text>
          </View>

          <View style={styles.assessmentList}>
            {(analysisResult.assessments || []).map(item => (
              <AssessmentCard item={item} key={item.id} />
            ))}
          </View>

          <View style={styles.formulaCard}>
            <Text style={styles.formulaTitle}>Current Session Inputs</Text>
            <Text style={styles.formulaCopy}>Standing reach: {analysisInput.standingReachInches || '--'} in</Text>
            <Text style={styles.formulaCopy}>Contact reach: {analysisInput.contactReachInches || '--'} in</Text>
            <Text style={styles.formulaCopy}>Ball travel: {analysisInput.ballTravelFeet || '--'} ft</Text>
            <Text style={styles.formulaCopy}>Release frames: {analysisInput.releaseFrames || '--'}</Text>
            <Text style={styles.formulaCopy}>FPS: {analysisInput.fps || '--'}</Text>
            <Text style={styles.formulaCopy}>Hitch frames: {analysisInput.hitchFrames || '--'}</Text>
            <Text style={styles.formulaCopy}>Contact point: {analysisInput.contactPoint}</Text>
            <Text style={styles.formulaCopy}>Landing stability: {analysisInput.landingStability}</Text>
            <Text style={styles.formulaCopy}>Current clip: {selectedVideo?.fileName || 'None selected'}</Text>
            <Text style={styles.formulaCopy}>Ball speed source: {analysisResult.ballSpeedSource === 'ball-track' ? 'Direct ball trail' : analysisResult.ballSpeedSource === 'tracked-estimate' ? 'Tracked swing model' : analysisResult.ballSpeedSource === 'manual-flight' ? 'Manual ball-flight sample' : 'Pending'}</Text>
            <Text style={styles.formulaCopy}>Peak hand speed: {analysisResult.peakHandSpeedMph || '--'} MPH</Text>
            <Text style={styles.formulaCopy}>Tracked ball frames: {analysisResult.trackedBallFrames || '--'}</Text>
            <Text style={styles.formulaCopy}>Ball tracking quality: {analysisResult.ballTrackingApplied ? `${Math.round(Number(analysisResult.ballTrackingQuality || 0) * 100)}%` : '--'}</Text>
            <Text style={styles.formulaCopy}>Tracking status: {trackingStatus === 'running' ? 'Tracking now' : trackingStatus === 'ready' ? 'Tracked clip ready' : 'Manual mode'}</Text>
          </View>
        </>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No stats yet</Text>
          <Text style={styles.emptyBody}>Run the Motion Lab analysis to populate this page.</Text>
        </View>
      )}

      <View style={styles.buttonStack}>
        <NeonButton label="Open Recorder" onPress={() => onOpenScreen('motion-lab')} />
        <NeonButton label="Open Swing Tracker" onPress={() => onOpenScreen('swing-tracker')} tone="secondary" />
        <NeonButton label="Open Ball Speed" onPress={() => onOpenScreen('ball-speed-tool')} tone="secondary" />
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
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  metricTile: {
    width: '48%',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: 'rgba(27, 7, 36, 0.92)',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  metricValue: {
    color: colors.primarySoft,
    fontFamily: 'Bangers',
    fontSize: 30,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  metricLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  metricDetail: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 20,
  },
  sectionCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(126, 249, 255, 0.18)',
    backgroundColor: 'rgba(17, 11, 28, 0.88)',
    padding: spacing.md,
    marginBottom: spacing.md,
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
  },
  assessmentList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  assessmentCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: 'rgba(17, 11, 28, 0.92)',
    padding: spacing.md,
  },
  assessmentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  assessmentTitleWrap: {
    flex: 1,
  },
  assessmentLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  assessmentValue: {
    color: colors.primarySoft,
    fontFamily: 'Bangers',
    fontSize: 28,
    letterSpacing: 0.7,
  },
  assessmentBadge: {
    borderRadius: radii.round,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  assessmentBadgeLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  assessmentNote: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  formulaCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(126, 249, 255, 0.18)',
    backgroundColor: 'rgba(17, 11, 28, 0.88)',
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  formulaTitle: {
    color: colors.primarySoft,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  formulaCopy: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
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
