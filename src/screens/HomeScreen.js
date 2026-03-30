import {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {GlowChip} from '../components/GlowChip';
import {NeonButton} from '../components/NeonButton';
import {homeQuickActions, menuSections} from '../data/dashboard';
import {colors, neonShadow, radii, spacing} from '../theme/theme';

const logoSource = require('../../assets/images/logo.png');

export function HomeScreen({onOpenScreen}) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.delay(800),
        Animated.timing(logoOpacity, {
          toValue: 0.12,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [logoOpacity]);

  const closeModal = () => {
    setSelectedMenuItem(null);
  };

  const openSelectedScreen = () => {
    if (!selectedMenuItem) {
      return;
    }

    const screenId = selectedMenuItem.id;
    setSelectedMenuItem(null);
    onOpenScreen(screenId);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View pointerEvents="none" style={styles.backgroundGlowOne} />
      <View pointerEvents="none" style={styles.backgroundGlowTwo} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoWrap}>
          <Animated.Image
            source={logoSource}
            resizeMode="contain"
            style={[styles.logo, {opacity: logoOpacity}]}
          />
          <Text style={styles.title}>Jolley Volley</Text>
          <Text style={styles.subtitle}>Neon volleyball tracking, analysis, and coaching.</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Main Menu</Text>
          <Text style={styles.sectionCopy}>
            Tap any menu option to read the description card, then open the working page behind it.
          </Text>
        </View>

        <View style={styles.menuGrid}>
          {menuSections.map(item => (
            <Pressable
              key={item.id}
              onPress={() => setSelectedMenuItem(item)}
              style={({pressed}) => [styles.menuCard, pressed && styles.menuCardPressed]}>
              <Text style={styles.menuEyebrow}>{item.eyebrow}</Text>
              <Text style={styles.menuTitle}>{item.label}</Text>
              <Text style={styles.menuPreview}>{item.preview}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Open</Text>
          <Text style={styles.sectionCopy}>
            Fast links into the main tasks while the menu handles the deeper description layer.
          </Text>
        </View>

        <View style={styles.chipWrap}>
          {homeQuickActions.map(action => (
            <GlowChip
              key={action.screen}
              label={action.label}
              onPress={() => onOpenScreen(action.screen)}
            />
          ))}
        </View>
      </ScrollView>

      <Modal animationType="fade" onRequestClose={closeModal} transparent visible={Boolean(selectedMenuItem)}>
        <View style={styles.modalOverlay}>
          <Pressable onPress={closeModal} style={StyleSheet.absoluteFillObject} />
          {selectedMenuItem ? (
            <View style={styles.modalCard}>
              <Text style={styles.modalEyebrow}>{selectedMenuItem.eyebrow}</Text>
              <Text style={styles.modalTitle}>{selectedMenuItem.label}</Text>
              <Text style={styles.modalDescription}>{selectedMenuItem.description}</Text>

              <View style={styles.modalBulletList}>
                {selectedMenuItem.bullets.map(bullet => (
                  <View key={bullet} style={styles.modalBulletRow}>
                    <View style={styles.modalBulletDot} />
                    <Text style={styles.modalBulletLabel}>{bullet}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.modalActions}>
                <NeonButton label="Close" onPress={closeModal} tone="secondary" />
                <NeonButton label={selectedMenuItem.openLabel} onPress={openSelectedScreen} />
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundGlowOne: {
    position: 'absolute',
    top: -100,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 63, 164, 0.18)',
  },
  backgroundGlowTwo: {
    position: 'absolute',
    bottom: 100,
    left: -90,
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: 'rgba(126, 249, 255, 0.08)',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 230,
    height: 230,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 48,
    letterSpacing: 1.2,
    textShadowColor: 'rgba(255, 110, 209, 0.95)',
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowRadius: 16,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 6,
    maxWidth: 320,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 32,
    letterSpacing: 0.9,
    marginBottom: 4,
  },
  sectionCopy: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 21,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  menuCard: {
    width: '47.5%',
    minHeight: 150,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: 'rgba(24, 10, 34, 0.9)',
    padding: spacing.md,
    ...neonShadow,
  },
  menuCardPressed: {
    transform: [{scale: 0.98}],
  },
  menuEyebrow: {
    color: colors.accent,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  menuTitle: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 24,
    letterSpacing: 0.7,
    marginBottom: spacing.xs,
  },
  menuPreview: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 1, 10, 0.76)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: 'rgba(19, 8, 31, 0.98)',
    padding: spacing.lg,
    ...neonShadow,
  },
  modalEyebrow: {
    color: colors.accent,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  modalTitle: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 36,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  modalDescription: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
    marginBottom: spacing.md,
  },
  modalBulletList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  modalBulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalBulletDot: {
    width: 8,
    height: 8,
    borderRadius: radii.round,
    backgroundColor: colors.primaryBright,
    marginRight: spacing.sm,
  },
  modalBulletLabel: {
    color: colors.text,
    fontSize: 14,
    flex: 1,
    lineHeight: 21,
  },
  modalActions: {
    gap: spacing.sm,
  },
});