import {Image, Pressable, StyleSheet, View} from 'react-native';

import {colors, spacing} from '../theme/theme';

const iconSource = require('../../assets/images/icon.png');

export function PageHeader({onHomePress}) {
  const canGoHome = typeof onHomePress === 'function';

  return (
    <View style={styles.header}>
      <Pressable disabled={!canGoHome} onPress={onHomePress} style={styles.homeButton}>
        <View pointerEvents="none" style={styles.iconLine} />
        <Image source={iconSource} resizeMode="contain" style={styles.icon} />
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
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 64,
    height: 64,
    zIndex: 1,
  },
  iconLine: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    left: '50%',
    width: 3,
    marginLeft: -1.5,
    borderRadius: 999,
    backgroundColor: colors.primaryBright,
    shadowColor: colors.primaryBright,
    shadowOpacity: 0.95,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    zIndex: 0,
  },
});
