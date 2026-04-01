import {useState} from 'react';
import {Modal, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';

import {PageHeader} from './PageHeader';
import {NeonButton} from './NeonButton';
import {
  blockCard,
  blockEyebrow,
  blockGlow,
  blockPanel,
  blockTitle,
  blockTitleLarge,
  colors,
  radii,
  spacing,
} from '../theme/theme';

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
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={styles.safeArea}>
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  introCard: {
    ...blockCard,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  introTitle: {
    ...blockTitleLarge,
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
    ...blockCard,
    padding: spacing.lg,
  },
  menuCardPressed: {
    transform: [{scale: 0.985}],
    borderColor: 'rgba(255, 110, 209, 0.62)',
  },
  menuEyebrow: {
    ...blockEyebrow,
    marginBottom: 6,
  },
  menuTitle: {
    ...blockTitle,
    marginBottom: spacing.xs,
  },
  menuPreview: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 1, 10, 0.78)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    ...blockCard,
    padding: spacing.lg,
    shadowOpacity: blockGlow.shadowOpacity,
  },
  modalEyebrow: {
    ...blockEyebrow,
    marginBottom: 6,
  },
  modalTitle: {
    ...blockTitleLarge,
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
    ...blockPanel,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  modalBulletDot: {
    width: 9,
    height: 9,
    borderRadius: 3,
    backgroundColor: colors.primaryBright,
    marginRight: spacing.sm,
    shadowColor: colors.primaryBright,
    shadowOpacity: 0.85,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 0},
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

