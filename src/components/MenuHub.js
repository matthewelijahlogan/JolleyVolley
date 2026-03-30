import {useState} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {PageHeader} from './PageHeader';
import {NeonButton} from './NeonButton';
import {colors, neonShadow, radii, spacing} from '../theme/theme';

export function MenuHub({items, onOpenScreen, onGoHome, introTitle, introCopy}) {
  const [selectedItem, setSelectedItem] = useState(null);

  const closeModal = () => {
    setSelectedItem(null);
  };

  const handleOpen = () => {
    if (!selectedItem) {
      return;
    }

    const screenId = selectedItem.id;
    setSelectedItem(null);
    onOpenScreen(screenId);
  };

  return (
    <ScrollView style={styles.safeArea} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <PageHeader onHomePress={onGoHome} />

      {introTitle || introCopy ? (
        <View style={styles.introCard}>
          {introTitle ? <Text style={styles.introTitle}>{introTitle}</Text> : null}
          {introCopy ? <Text style={styles.introCopy}>{introCopy}</Text> : null}
        </View>
      ) : null}

      <View style={styles.menuStack}>
        {items.map(item => (
          <Pressable
            key={item.id}
            onPress={() => setSelectedItem(item)}
            style={({pressed}) => [styles.menuCard, pressed && styles.menuCardPressed]}>
            <Text style={styles.menuEyebrow}>{item.eyebrow}</Text>
            <Text style={styles.menuTitle}>{item.label}</Text>
            <Text style={styles.menuPreview}>{item.preview}</Text>
          </Pressable>
        ))}
      </View>

      <Modal animationType="fade" onRequestClose={closeModal} transparent visible={Boolean(selectedItem)}>
        <View style={styles.modalOverlay}>
          <Pressable onPress={closeModal} style={StyleSheet.absoluteFillObject} />
          {selectedItem ? (
            <View style={styles.modalCard}>
              <Text style={styles.modalEyebrow}>{selectedItem.eyebrow}</Text>
              <Text style={styles.modalTitle}>{selectedItem.label}</Text>
              <Text style={styles.modalDescription}>{selectedItem.description}</Text>

              <View style={styles.modalBulletList}>
                {selectedItem.bullets.map(bullet => (
                  <View key={bullet} style={styles.modalBulletRow}>
                    <View style={styles.modalBulletDot} />
                    <Text style={styles.modalBulletLabel}>{bullet}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.modalActions}>
                <NeonButton label="Close" onPress={closeModal} tone="secondary" />
                <NeonButton label={selectedItem.openLabel} onPress={handleOpen} />
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  introCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...neonShadow,
  },
  introTitle: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 32,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  introCopy: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  menuStack: {
    gap: spacing.md,
  },
  menuCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: 'rgba(24, 10, 34, 0.9)',
    padding: spacing.lg,
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
    fontSize: 28,
    letterSpacing: 0.7,
    marginBottom: spacing.xs,
  },
  menuPreview: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
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
