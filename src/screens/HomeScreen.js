import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  actionChips,
  menuSections,
  scoreboardSnapshot,
  statHighlights,
} from "../data/dashboard";
import { GlowChip } from "../components/GlowChip";
import { colors, neonShadow, radii, spacing } from "../theme/theme";

const logoSource = require("../../assets/images/logo.png");
const iconSource = require("../../assets/images/icon.png");

export function HomeScreen() {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);

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

  const closeMenuModal = () => {
    setSelectedMenuItem(null);
  };

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
          <Text style={styles.sectionTitle}>Main Menu</Text>
          <Text style={styles.sectionCopy}>
            Tap a module to open a detail card and see exactly what that part of the app is meant to do.
          </Text>
        </View>

        <View style={styles.menuGrid}>
          {menuSections.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setSelectedMenuItem(item)}
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            >
              <Text style={styles.menuEyebrow}>{item.eyebrow}</Text>
              <Text style={styles.menuTitle}>{item.label}</Text>
              <Text style={styles.menuPreview}>{item.preview}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.menuHintCard}>
          <Text style={styles.menuHintTitle}>Menu-driven flow</Text>
          <Text style={styles.menuHintCopy}>
            This home screen now works more like a launcher. The previews stay light here, and the deeper explanation pops up only when a coach taps the module they want.
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
          <Text style={styles.sectionCopy}>Quick preview numbers stay visible while the menu popups handle the deeper explanation.</Text>
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

        <View style={styles.chipWrap}>
          {actionChips.map((chip) => (
            <GlowChip key={chip} label={chip} />
          ))}
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={closeMenuModal}
        transparent
        visible={Boolean(selectedMenuItem)}
      >
        <View style={styles.modalOverlay}>
          <Pressable onPress={closeMenuModal} style={StyleSheet.absoluteFillObject} />
          {selectedMenuItem ? (
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleWrap}>
                  <Text style={styles.modalEyebrow}>{selectedMenuItem.eyebrow}</Text>
                  <Text style={styles.modalTitle}>{selectedMenuItem.label}</Text>
                </View>
                <Pressable onPress={closeMenuModal} style={styles.modalClose}>
                  <Text style={styles.modalCloseLabel}>Close</Text>
                </Pressable>
              </View>

              <Text style={styles.modalDescription}>
                {selectedMenuItem.description}
              </Text>

              <View style={styles.modalBulletList}>
                {selectedMenuItem.bullets.map((bullet) => (
                  <View key={bullet} style={styles.modalBulletRow}>
                    <View style={styles.modalBulletDot} />
                    <Text style={styles.modalBulletLabel}>{bullet}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
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
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  menuItem: {
    width: "47.5%",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: "rgba(27, 7, 36, 0.92)",
    padding: spacing.md,
    minHeight: 138,
    ...neonShadow,
  },
  menuItemPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: "rgba(44, 10, 51, 0.96)",
  },
  menuEyebrow: {
    color: colors.accent,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  menuTitle: {
    color: colors.text,
    fontFamily: "Bangers",
    fontSize: 24,
    letterSpacing: 0.7,
    marginBottom: spacing.xs,
  },
  menuPreview: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  menuHintCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(126, 249, 255, 0.18)",
    backgroundColor: "rgba(17, 11, 28, 0.88)",
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  menuHintTitle: {
    color: colors.primarySoft,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  menuHintCopy: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 20,
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
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(5, 1, 10, 0.74)",
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
  },
  modalCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: "rgba(19, 8, 31, 0.98)",
    padding: spacing.lg,
    ...neonShadow,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  modalTitleWrap: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  modalEyebrow: {
    color: colors.accent,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  modalTitle: {
    color: colors.text,
    fontFamily: "Bangers",
    fontSize: 34,
    letterSpacing: 0.8,
  },
  modalClose: {
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: "rgba(255, 110, 209, 0.35)",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 63, 164, 0.1)",
  },
  modalCloseLabel: {
    color: colors.text,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  modalDescription: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
    marginBottom: spacing.md,
  },
  modalBulletList: {
    gap: spacing.sm,
  },
  modalBulletRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalBulletDot: {
    width: 9,
    height: 9,
    borderRadius: radii.round,
    backgroundColor: colors.primaryBright,
    marginRight: spacing.sm,
    shadowColor: colors.primaryBright,
    shadowOpacity: 0.65,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
  modalBulletLabel: {
    color: colors.text,
    fontSize: 14,
    flex: 1,
    lineHeight: 21,
  },
});