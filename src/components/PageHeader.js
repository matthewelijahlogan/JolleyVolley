import {Image, Pressable, StyleSheet, Text, View} from 'react-native';

import {colors, neonShadow, radii, spacing} from '../theme/theme';

const iconSource = require('../../assets/images/icon.png');

export function PageHeader({title, subtitle, onHomePress}) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onHomePress} style={styles.homeButton}>
        <Image source={iconSource} resizeMode="contain" style={styles.icon} />
        <View pointerEvents="none" style={styles.iconLine} />
      </Pressable>

      <View style={styles.copyWrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  homeButton: {
    width: 60,
    height: 60,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 63, 164, 0.1)',
    borderWidth: 1,
    borderColor: colors.stroke,
    marginRight: spacing.md,
    ...neonShadow,
  },
  icon: {
    width: 42,
    height: 42,
  },
  iconLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: '50%',
    height: 3,
    borderRadius: radii.round,
    backgroundColor: colors.primaryBright,
    shadowColor: colors.primaryBright,
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
  copyWrap: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 30,
    letterSpacing: 0.9,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
});