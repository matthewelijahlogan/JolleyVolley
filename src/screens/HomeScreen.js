import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  actionChips,
  analyzerModules,
  scoreboardSnapshot,
  statHighlights,
} from "../data/dashboard";
import { GlowChip } from "../components/GlowChip";
import { FeatureCard } from "../components/FeatureCard";
import { colors, neonShadow, radii, spacing } from "../theme/theme";

const logoSource = require("../../assets/images/logo.png");
const iconSource = require("../../assets/images/icon.png");

export function HomeScreen() {
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.delay(800),
        Animated.timing(logoOpacity, {
          toValue: 0.15,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [logoOpacity]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View pointerEvents="none" style={styles.backgroundGlowOne} />
      <View pointerEvents="none" style={styles.backgroundGlowTwo} />

      <View style={styles.fixedHeader}>
        <View style={styles.headerBadge}>
          <Image source={iconSource} style={styles.headerIcon} resizeMode="contain" />
        </View>
        <View>
          <Text style={styles.headerTitle}>Jolley Volley</Text>
          <Text style={styles.headerSubtitle}>Track. Trail. Correct.</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Standalone Volleyball Intelligence</Text>
          <Animated.Image
            source={logoSource}
            resizeMode="contain"
            style={[styles.heroLogo, { opacity: logoOpacity }]}
          />
          <Text style={styles.heroTitle}>Record the rep, score the rally, coach the correction.</Text>
          <Text style={styles.heroCopy}>
            Jolley Volley is being built to help coaches record players, highlight swing and ball movement with neon playback trails, estimate vertical leap and ball speed, suggest mechanical corrections, and keep score plus popular volleyball stats without friction.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Coach Scorecard</Text>
          <Text style={styles.sectionCopy}>Fast-glance score, possession, and rally context for match tracking.</Text>
        </View>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreEyebrow}>{scoreboardSnapshot.matchup}</Text>

          <View style={styles.scoreRow}>
            <View style={styles.scoreBlock}>
              <Text style={styles.scoreLabel}>Sets</Text>
              <Text style={styles.scoreValue}>{scoreboardSnapshot.setCount}</Text>
            </View>
            <View style={styles.scoreBlock}>
              <Text style={styles.scoreLabel}>Current</Text>
              <Text style={styles.scoreValue}>{scoreboardSnapshot.currentScore}</Text>
            </View>
          </View>

          <View style={styles.scoreMetaRow}>
            <Text style={styles.scoreMetaLabel}>Possession</Text>
            <Text style={styles.scoreMetaValue}>{scoreboardSnapshot.possession}</Text>
          </View>
          <View style={styles.scoreMetaRow}>
            <Text style={styles.scoreMetaLabel}>Rotation</Text>
            <Text style={styles.scoreMetaValue}>{scoreboardSnapshot.rotation}</Text>
          </View>
          <View style={styles.scoreMetaRow}>
            <Text style={styles.scoreMetaLabel}>Momentum</Text>
            <Text style={styles.scoreMetaHighlight}>{scoreboardSnapshot.momentum}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Motion Metrics</Text>
          <Text style={styles.sectionCopy}>The first three athlete feedback numbers this app is aiming to surface clearly.</Text>
        </View>

        <View style={styles.statGrid}>
          {statHighlights.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
              <Text style={styles.statDetail}>{item.detail}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recorder Intelligence</Text>
          <Text style={styles.sectionCopy}>
            Framework cards for capture, neon playback overlays, and AI-driven swing feedback.
          </Text>
        </View>

        <View style={styles.featureStack}>
          {analyzerModules.map((module) => (
            <FeatureCard
              key={module.title}
              eyebrow={module.eyebrow}
              title={module.title}
              description={module.description}
              bullets={module.bullets}
            />
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <Text style={styles.sectionCopy}>
            Placeholder entry points for the recorder, playback, and scorekeeping flow.
          </Text>
        </View>

        <View style={styles.chipWrap}>
          {actionChips.map((chip) => (
            <GlowChip key={chip} label={chip} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundGlowOne: {
    position: "absolute",
    top: -80,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(255, 63, 164, 0.2)",
  },
  backgroundGlowTwo: {
    position: "absolute",
    bottom: 180,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: "rgba(126, 249, 255, 0.09)",
  },
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.select({
      ios: 18,
      android: 48,
      default: 24,
    }),
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: "rgba(9, 2, 15, 0.94)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 92, 190, 0.18)",
  },
  headerBadge: {
    width: 54,
    height: 54,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 63, 164, 0.1)",
    borderWidth: 1,
    borderColor: colors.stroke,
    marginRight: spacing.md,
    ...neonShadow,
  },
  headerIcon: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    color: colors.text,
    fontFamily: "Bangers",
    fontSize: 28,
    letterSpacing: 1.1,
    textShadowColor: "rgba(255, 110, 209, 0.95)",
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowRadius: 14,
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },
  content: {
    paddingTop: 126,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  heroCard: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.stroke,
    alignItems: "center",
    ...neonShadow,
  },
  heroEyebrow: {
    color: colors.accent,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.9,
  },
  heroLogo: {
    width: 210,
    height: 210,
    marginVertical: spacing.md,
  },
  heroTitle: {
    color: colors.text,
    fontFamily: "Bangers",
    fontSize: 38,
    lineHeight: 40,
    textAlign: "center",
    marginBottom: spacing.sm,
    letterSpacing: 1,
    textShadowColor: "rgba(255, 110, 209, 0.95)",
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowRadius: 14,
  },
  heroCopy: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: "Bangers",
    fontSize: 30,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  sectionCopy: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 21,
  },
  scoreCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...neonShadow,
  },
  scoreEyebrow: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  scoreRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  scoreBlock: {
    flex: 1,
    borderRadius: radii.md,
    backgroundColor: "rgba(255, 63, 164, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 110, 209, 0.2)",
    padding: spacing.md,
  },
  scoreLabel: {
    color: colors.textDim,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  scoreValue: {
    color: colors.text,
    fontFamily: "Bangers",
    fontSize: 34,
    letterSpacing: 1.2,
  },
  scoreMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  scoreMetaLabel: {
    color: colors.textDim,
    fontSize: 13,
    letterSpacing: 0.6,
  },
  scoreMetaValue: {
    color: colors.text,
    fontSize: 13,
  },
  scoreMetaHighlight: {
    color: colors.success,
    fontSize: 13,
    fontWeight: "700",
  },
  statGrid: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: "rgba(27, 7, 36, 0.92)",
    padding: spacing.lg,
  },
  statValue: {
    color: colors.primarySoft,
    fontFamily: "Bangers",
    fontSize: 34,
    letterSpacing: 1,
    marginBottom: 2,
  },
  statLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  statDetail: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 20,
  },
  featureStack: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});