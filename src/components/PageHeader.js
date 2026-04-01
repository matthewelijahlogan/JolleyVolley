import {Image, Pressable, StyleSheet, View} from 'react-native';

import {spacing} from '../theme/theme';

const iconSource = require('../../assets/images/icon.png');

export function PageHeader({onHomePress}) {
  const canGoHome = typeof onHomePress === 'function';

  return (
    <View style={styles.header}>
      <Pressable disabled={!canGoHome} hitSlop={10} onPress={onHomePress} style={styles.homeButton}>
        <Image source={iconSource} resizeMode="contain" style={styles.icon} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  homeButton: {
    width: 120,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 102,
    height: 102,
  },
});
