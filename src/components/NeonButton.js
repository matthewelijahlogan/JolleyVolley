import {Pressable, StyleSheet, Text} from 'react-native';

import {colors, neonShadow, radii, spacing} from '../theme/theme';

export function NeonButton({label, onPress, tone = 'primary'}) {
  const filled = tone === 'primary';

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        filled ? styles.buttonPrimary : styles.buttonSecondary,
        pressed && styles.buttonPressed,
      ]}>
      <Text style={[styles.label, filled ? styles.labelPrimary : styles.labelSecondary]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  buttonPrimary: {
    backgroundColor: 'rgba(255, 63, 164, 0.18)',
    borderColor: 'rgba(255, 110, 209, 0.4)',
    ...neonShadow,
  },
  buttonSecondary: {
    backgroundColor: 'rgba(17, 11, 28, 0.9)',
    borderColor: 'rgba(126, 249, 255, 0.2)',
  },
  buttonPressed: {
    transform: [{scale: 0.98}],
  },
  label: {
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  labelPrimary: {
    color: colors.text,
  },
  labelSecondary: {
    color: colors.accent,
  },
});