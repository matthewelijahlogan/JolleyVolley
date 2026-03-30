import {Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Video from 'react-native-video';

import {NeonButton} from '../components/NeonButton';
import {PageHeader} from '../components/PageHeader';
import {colors, neonShadow, radii, spacing} from '../theme/theme';

function ChoicePill({label, active, onPress}) {
  return (
    <Pressable onPress={onPress} style={[styles.choicePill, active && styles.choicePillActive]}>
      <Text style={[styles.choicePillLabel, active && styles.choicePillLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function InputCard({label, value, onChangeText}) {
  return (
    <View style={styles.inputCard}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        keyboardType="numeric"
        onChangeText={onChangeText}
        placeholder="0"
        placeholderTextColor={colors.textDim}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

function AssessmentPreview({item}) {
  return (
    <View style={styles.assessmentRow}>
      <View>
        <Text style={styles.assessmentLabel}>{item.label}</Text>
        <Text style={styles.assessmentStatus}>{item.status}</Text>
      </View>
      <Text style={styles.assessmentValue}>{item.value}</Text>
    </View>
  );
}

export function MotionLabScreen({
  analysisInput,
  analysisResult,
  onChangeField,
  onGoHome,
  onOpenScreen,
  onRunAnalysis,
  onSelectVideo,
  selectedVideo,
}) {
  const handleCameraLaunch = async () => {
    const result = await launchCamera({
      mediaType: 'video',
      durationLimit: 20,
      saveToPhotos: true,
      videoQuality: 'high',
    });

    if (result.didCancel) {
      return;
    }

    if (result.errorCode) {
      Alert.alert('Camera unavailable', result.errorMessage || 'Unable to launch the camera right now.');
      return;
    }

    if (result.assets && result.assets[0]) {
      onSelectVideo(result.assets[0]);
    }
  };

  const handleLibraryLaunch = async () => {
    const result = await launchImageLibrary({
      mediaType: 'video',
      selectionLimit: 1,
    });

    if (result.didCancel) {
      return;
    }

    if (result.errorCode) {
      Alert.alert('Video picker unavailable', result.errorMessage || 'Unable to open the library right now.');
      return;
    }

    if (result.assets && result.assets[0]) {
      onSelectVideo(result.assets[0]);
    }
  };

  const previewAssessments = analysisResult?.assessments?.slice(0, 3) || [];

  return (
    <ScrollView style={styles.safeArea} contentContainerStyle={styles.content}>
      <PageHeader onHomePress={onGoHome} />

      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>Recorder</Text>
        <Text style={styles.cardTitle}>Motion Lab</Text>
        <Text style={styles.cardCopy}>
          Record or import a rep, set the motion markers, and let the app score the current clip.
        </Text>
      </View>

      <View style={styles.buttonStack}>
        <NeonButton label="Record Video" onPress={handleCameraLaunch} />
        <NeonButton label="Choose Video" onPress={handleLibraryLaunch} tone="secondary" />
      </View>

      <View style={styles.videoCard}>
        <Text style={styles.sectionLabel}>Current Clip</Text>
        {selectedVideo && selectedVideo.uri ? (
          <>
            <View style={styles.videoFrame}>
              <Video
                controls
                paused
                resizeMode="contain"
                source={{uri: selectedVideo.uri}}
                style={styles.video}
              />
            </View>
            <Text style={styles.videoMeta}>{selectedVideo.fileName || 'Selected clip'}</Text>
            <Text style={styles.videoMeta}>
              Duration: {selectedVideo.duration ? `${selectedVideo.duration}s` : 'Unknown'}
            </Text>
          </>
        ) : (
          <Text style={styles.emptyCopy}>
            No clip selected yet. Record a player or import a rep from the phone to start the analysis flow.
          </Text>
        )}
      </View>

      <View style={styles.sectionRow}>
        <InputCard
          label="Standing Reach (in)"
          onChangeText={value => onChangeField('standingReachInches', value)}
          value={analysisInput.standingReachInches}
        />
        <InputCard
          label="Contact Reach (in)"
          onChangeText={value => onChangeField('contactReachInches', value)}
          value={analysisInput.contactReachInches}
        />
      </View>
      <View style={styles.sectionRow}>
        <InputCard
          label="Ball Travel (ft)"
          onChangeText={value => onChangeField('ballTravelFeet', value)}
          value={analysisInput.ballTravelFeet}
        />
        <InputCard
          label="Release Frames"
          onChangeText={value => onChangeField('releaseFrames', value)}
          value={analysisInput.releaseFrames}
        />
      </View>
      <View style={styles.sectionRow}>
        <InputCard
          label="FPS"
          onChangeText={value => onChangeField('fps', value)}
          value={analysisInput.fps}
        />
        <InputCard
          label="Hitch Frames"
          onChangeText={value => onChangeField('hitchFrames', value)}
          value={analysisInput.hitchFrames}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Contact Point</Text>
        <View style={styles.choiceRow}>
          <ChoicePill
            active={analysisInput.contactPoint === 'behind'}
            label="Behind"
            onPress={() => onChangeField('contactPoint', 'behind')}
          />
          <ChoicePill
            active={analysisInput.contactPoint === 'ideal'}
            label="Ideal"
            onPress={() => onChangeField('contactPoint', 'ideal')}
          />
          <ChoicePill
            active={analysisInput.contactPoint === 'in-front'}
            label="In Front"
            onPress={() => onChangeField('contactPoint', 'in-front')}
          />
        </View>

        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>Landing Stability</Text>
        <View style={styles.choiceRow}>
          <ChoicePill
            active={analysisInput.landingStability === 'steady'}
            label="Steady"
            onPress={() => onChangeField('landingStability', 'steady')}
          />
          <ChoicePill
            active={analysisInput.landingStability === 'off-balance'}
            label="Off Balance"
            onPress={() => onChangeField('landingStability', 'off-balance')}
          />
        </View>
      </View>

      <View style={styles.buttonStack}>
        <NeonButton label="Run Analysis" onPress={onRunAnalysis} />
        <NeonButton label="Open Playback" onPress={() => onOpenScreen('neon-playback')} tone="secondary" />
        <NeonButton label="Open Feedback" onPress={() => onOpenScreen('swing-feedback')} tone="secondary" />
        <NeonButton label="Open Metrics" onPress={() => onOpenScreen('jump-speed')} tone="secondary" />
      </View>

      {analysisResult ? (
        <View style={styles.resultCard}>
          <Text style={styles.cardEyebrow}>Current Result</Text>
          <Text style={styles.resultSummary}>{analysisResult.summary}</Text>
          <Text style={styles.resultCopy}>
            The computer is assessing the current session and can return the full breakdown in Jump + Speed.
          </Text>

          <View style={styles.assessmentWrap}>
            {previewAssessments.map(item => (
              <AssessmentPreview item={item} key={item.id} />
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...neonShadow,
  },
  cardEyebrow: {
    color: colors.accent,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 34,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  cardCopy: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  buttonStack: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  videoCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: 'rgba(17, 11, 28, 0.92)',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    color: colors.primarySoft,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  sectionLabelSpaced: {
    marginTop: spacing.md,
  },
  videoFrame: {
    height: 220,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: '#030107',
    marginBottom: spacing.md,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoMeta: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  emptyCopy: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 21,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  inputCard: {
    width: '48%',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: 'rgba(24, 10, 34, 0.9)',
    padding: spacing.md,
  },
  inputLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: spacing.xs,
  },
  input: {
    color: colors.text,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 209, 0.22)',
    backgroundColor: 'rgba(9, 2, 15, 0.92)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    fontSize: 16,
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  choicePill: {
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 209, 0.2)',
    backgroundColor: 'rgba(9, 2, 15, 0.92)',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  choicePillActive: {
    borderColor: 'rgba(255, 110, 209, 0.45)',
    backgroundColor: 'rgba(255, 63, 164, 0.16)',
  },
  choicePillLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  choicePillLabelActive: {
    color: colors.text,
    fontWeight: '700',
  },
  resultCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(126, 249, 255, 0.2)',
    backgroundColor: 'rgba(17, 11, 28, 0.92)',
    padding: spacing.lg,
  },
  resultSummary: {
    color: colors.text,
    fontFamily: 'Bangers',
    fontSize: 28,
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  resultCopy: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.md,
  },
  assessmentWrap: {
    gap: spacing.sm,
  },
  assessmentRow: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 209, 0.18)',
    backgroundColor: 'rgba(12, 5, 20, 0.8)',
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assessmentLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  assessmentStatus: {
    color: colors.textDim,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  assessmentValue: {
    color: colors.primarySoft,
    fontFamily: 'Bangers',
    fontSize: 24,
    letterSpacing: 0.6,
  },
});
