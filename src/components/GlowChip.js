import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radii, spacing } from "../theme/theme";

export function GlowChip({ label, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.chip}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: "rgba(255, 110, 209, 0.35)",
    backgroundColor: "rgba(255, 63, 164, 0.12)",
    shadowColor: colors.primaryBright,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 10,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    letterSpacing: 0.4,
  },
});