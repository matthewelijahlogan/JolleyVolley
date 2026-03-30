import {Pressable, StyleSheet, Text, View} from 'react-native';

import {colors, radii, spacing} from '../theme/theme';

export function StatStepper({label, value, onIncrement, onDecrement}) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <View style={styles.row}>
        <Pressable onPress={onDecrement} style={styles.control}>
          <Text style={styles.controlLabel}>-</Text>
        </Pressable>
        <Pressable onPress={onIncrement} style={styles.control}>
          <Text style={styles.controlLabel}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: 'rgba(27, 7, 36, 0.92)',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  value: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 30,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  control: {
    width: '46%',
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 209, 0.35)',
    backgroundColor: 'rgba(255, 63, 164, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  controlLabel: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
});