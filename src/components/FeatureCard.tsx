import { StyleSheet, Text, View } from "react-native";

import { colors, neonShadow, radii, spacing } from "../theme/theme";

type FeatureCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
};

export function FeatureCard({
  eyebrow,
  title,
  description,
  bullets,
}: FeatureCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.bulletList}>
        {bullets.map((bullet) => (
          <View key={bullet} style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletLabel}>{bullet}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.sm,
    ...neonShadow,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 30,
    fontFamily: "Bangers",
    letterSpacing: 0.8,
    textShadowColor: "rgba(255, 110, 209, 0.9)",
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowRadius: 14,
  },
  description: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  bulletList: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: radii.round,
    backgroundColor: colors.primaryBright,
    marginRight: spacing.sm,
    shadowColor: colors.primaryBright,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
  bulletLabel: {
    color: colors.text,
    fontSize: 14,
    letterSpacing: 0.3,
  },
});
