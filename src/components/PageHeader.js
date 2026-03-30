import {Image, Pressable, StyleSheet, View} from 'react-native';

import {colors, neonShadow, radii, spacing} from '../theme/theme';

const iconSource = require('../../assets/images/icon.png');

export function PageHeader({onHomePress}) {
  const canGoHome = typeof onHomePress === 'function';

  return (
    <View style={styles.header}>
      <Pressable disabled={!canGoHome} onPress={onHomePress} style={styles.homeButton}>
        <Image source={iconSource} resizeMode="contain" style={styles.icon} />
        <View pointerEvents="none" style={styles.iconLine} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  homeButton: {
    width: 86,
    height: 86,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 63, 164, 0.1)',
    borderWidth: 1,
    borderColor: colors.stroke,
    ...neonShadow,
  },
  icon: {
    width: 58,
    height: 58,
  },
  iconLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: '50%',
    height: 3,
    borderRadius: radii.round,
    backgroundColor: colors.primaryBright,
    shadowColor: colors.primaryBright,
    shadowOpacity: 0.95,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
});
