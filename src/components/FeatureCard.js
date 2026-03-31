import {StyleSheet, Text, View} from 'react-native';

import {blockCard, blockEyebrow, blockTitle, colors, radii, spacing} from '../theme/theme';

export function FeatureCard({eyebrow, title, description, bullets}) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.bulletList}>
        {bullets.map(bullet => (
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
    ...blockCard,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  eyebrow: {
    ...blockEyebrow,
  },
  title: {
    ...blockTitle,
    fontSize: 24,
    lineHeight: 28,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 3,
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
