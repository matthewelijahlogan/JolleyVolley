import {Pressable, StyleSheet, Text} from 'react-native';

import {blockGlow, colors, radii, spacing} from '../theme/theme';

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
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 2,
  },
  buttonPrimary: {
    backgroundColor: 'rgba(255, 63, 164, 0.2)',
    borderColor: 'rgba(255, 110, 209, 0.54)',
    ...blockGlow,
  },
  buttonSecondary: {
    backgroundColor: 'rgba(12, 8, 18, 0.96)',
    borderColor: 'rgba(126, 249, 255, 0.24)',
  },
  buttonPressed: {
    transform: [{scale: 0.98}],
  },
  label: {
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    fontWeight: '900',
  },
  labelPrimary: {
    color: colors.text,
    textShadowColor: 'rgba(255, 110, 209, 0.82)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 8,
  },
  labelSecondary: {
    color: colors.accent,
  },
});
