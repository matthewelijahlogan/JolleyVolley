import {Pressable, StyleSheet, Text, View} from 'react-native';

import {blockPanel, blockValue, colors, spacing} from '../theme/theme';

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
    ...blockPanel,
    width: '48%',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  value: {
    ...blockValue,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  control: {
    width: '46%',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 110, 209, 0.4)',
    backgroundColor: 'rgba(255, 63, 164, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  controlLabel: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
});
