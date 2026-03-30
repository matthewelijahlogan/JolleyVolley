import {Animated, Image, StyleSheet, View} from 'react-native';
import {useEffect, useRef} from 'react';

import {colors, neonShadow, radii} from '../theme/theme';

const logoSource = require('../../assets/images/logo.png');

export function SplashOverlay({visible, onComplete}) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    const sequence = Animated.sequence([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.delay(700),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]);

    sequence.start(({finished}) => {
      if (finished && onComplete) {
        onComplete();
      }
    });

    return () => {
      sequence.stop();
    };
  }, [logoOpacity, onComplete, screenOpacity, visible]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View style={[styles.overlay, {opacity: screenOpacity}]}> 
      <Animated.Image source={logoSource} resizeMode="contain" style={[styles.logo, {opacity: logoOpacity}]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  logo: {
    width: 230,
    height: 230,
    borderRadius: radii.round,
    ...neonShadow,
  },
});