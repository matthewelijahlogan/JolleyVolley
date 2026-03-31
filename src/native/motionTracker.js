import {NativeModules, Platform} from 'react-native';

const {MotionTracker} = NativeModules;

export async function analyzeMotionVideo(videoUri) {
  if (Platform.OS !== 'android') {
    throw new Error('Motion tracking is only wired for Android right now.');
  }

  if (!MotionTracker?.analyzeVideo) {
    throw new Error('Motion tracking native module is unavailable.');
  }

  return MotionTracker.analyzeVideo(videoUri);
}
