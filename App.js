import React, {useEffect, useMemo, useRef, useState} from 'react';
import {BackHandler, StatusBar, View} from 'react-native';

import {SplashOverlay} from './src/components/SplashOverlay';
import {initialAnalysisInput, initialCoachBoard, initialProfiles} from './src/data/dashboard';
import {createMotionHistoryEntry, createMotionHistoryFromProfiles} from './src/data/motionHistory';
import {analyzeMotionVideo} from './src/native/motionTracker';
import {AboutScreen} from './src/screens/AboutScreen';
import {BallSpeedScreen} from './src/screens/BallSpeedScreen';
import {CoachBoardScreen} from './src/screens/CoachBoardScreen';
import {FeedbackScreen} from './src/screens/FeedbackScreen';
import {HomeScreen} from './src/screens/HomeScreen';
import {MetricsScreen} from './src/screens/MetricsScreen';
import {MotionLabMenuScreen} from './src/screens/MotionLabMenuScreen';
import {MotionLabScreen} from './src/screens/MotionLabScreen';
import {PlaybackScreen} from './src/screens/PlaybackScreen';
import {ProfilesScreen} from './src/screens/ProfilesScreen';
import {runVideoAnalysis} from './src/utils/analysis';

const HOME_SCREEN = 'home';

function buildAnalysisInputFromTracking(result) {
  return {
    standingReachInches:
      Number.isFinite(result?.standingReachInches) && result.standingReachInches > 0
        ? `${Number(result.standingReachInches).toFixed(1)}`
        : '',
    contactReachInches:
      Number.isFinite(result?.contactReachInches) && result.contactReachInches > 0
        ? `${Number(result.contactReachInches).toFixed(1)}`
        : '',
    ballTravelFeet:
      Number.isFinite(result?.detectedBallTravelFeet) && result.detectedBallTravelFeet > 0
        ? `${Number(result.detectedBallTravelFeet).toFixed(1)}`
        : '',
    releaseFrames:
      Number.isFinite(result?.releaseFrames) && result.releaseFrames > 0
        ? `${result.releaseFrames}`
        : '',
    fps:
      Number.isFinite(result?.fps) && result.fps > 0
        ? `${Math.round(result.fps)}`
        : '',
    hitchFrames:
      Number.isFinite(result?.hitchFrames) && result.hitchFrames >= 0
        ? `${result.hitchFrames}`
        : '',
    contactPoint: result?.contactPoint || 'ideal',
    landingStability: result?.landingStability || 'steady',
  };
}

function buildSessionSnapshot(analysisResult, selectedVideo) {
  return {
    id: `${Date.now()}`,
    date: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    verticalLeapInches: analysisResult.verticalLeapInches,
    ballSpeedMph: analysisResult.ballSpeedMph,
    peakHandSpeedMph: analysisResult.peakHandSpeedMph,
    hitchFrames: analysisResult.hitchFrames,
    hitchSeverity: analysisResult.hitchSeverity,
    contactPoint: analysisResult.contactPoint,
    landingStability: analysisResult.landingStability,
    summary: analysisResult.summary,
    clipName: selectedVideo?.fileName || 'Current session',
  };
}

export default function App() {
  const [screenStack, setScreenStack] = useState([HOME_SCREEN]);
  const [showSplash, setShowSplash] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [analysisInput, setAnalysisInput] = useState(initialAnalysisInput);
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingStatus, setTrackingStatus] = useState('idle');
  const [trackingError, setTrackingError] = useState('');
  const [analysisResult, setAnalysisResult] = useState(() => runVideoAnalysis(initialAnalysisInput, null));
  const [coachBoard, setCoachBoard] = useState(initialCoachBoard);
  const [profiles, setProfiles] = useState(initialProfiles);
  const [motionHistory, setMotionHistory] = useState(() => createMotionHistoryFromProfiles(initialProfiles));
  const [selectedHistoryMetricId, setSelectedHistoryMetricId] = useState('verticalLeapInches');
  const screenStackRef = useRef(screenStack);

  const activeScreen = screenStack[screenStack.length - 1] || HOME_SCREEN;

  useEffect(() => {
    screenStackRef.current = screenStack;
  }, [screenStack]);

  useEffect(() => {
    setAnalysisResult(runVideoAnalysis(analysisInput, trackingResult));
  }, [analysisInput, trackingResult]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showSplash) {
        return true;
      }

      if (screenStackRef.current.length > 1) {
        setScreenStack(current => current.slice(0, -1));
      }

      return true;
    });

    return () => {
      subscription.remove();
    };
  }, [showSplash]);

  const navigateToScreen = screen => {
    setScreenStack(current => {
      if (!screen || current[current.length - 1] === screen) {
        return current;
      }

      return [...current, screen];
    });
  };

  const goHome = () => {
    setScreenStack([HOME_SCREEN]);
  };

  const sharedScreenProps = useMemo(
    () => ({
      onGoHome: goHome,
      onOpenScreen: navigateToScreen,
    }),
    [],
  );

  const handleAnalyzeRep = async () => {
    if (!selectedVideo?.uri) {
      setTrackingStatus('error');
      setTrackingError('Select or record a clip so Motion Lab can fill the session from the video.');
      return;
    }

    await handleTrackSwing();
  };

  const handleTrackSwing = async () => {
    if (!selectedVideo?.uri) {
      setTrackingStatus('error');
      setTrackingError('Select or record a clip before running the swing tracker.');
      return;
    }

    try {
      setTrackingStatus('running');
      setTrackingError('');
      const result = await analyzeMotionVideo(selectedVideo.uri);
      const nextAnalysisInput = buildAnalysisInputFromTracking(result);
      const nextAnalysisResult = runVideoAnalysis(nextAnalysisInput, result);

      setTrackingResult(result);
      setTrackingStatus('ready');
      setAnalysisInput(nextAnalysisInput);
      setAnalysisResult(nextAnalysisResult);
      setMotionHistory(current => [createMotionHistoryEntry(nextAnalysisResult, selectedVideo), ...current].slice(0, 60));
    } catch (error) {
      setTrackingResult(null);
      setTrackingStatus('error');
      setTrackingError(error?.message || 'Unable to analyze the selected clip.');
    }
  };

  const handleSelectVideo = videoAsset => {
    setSelectedVideo(videoAsset);
    setAnalysisInput(initialAnalysisInput);
    setTrackingResult(null);
    setTrackingStatus('idle');
    setTrackingError('');
  };

  const handleOpenMetricHistory = metricId => {
    setSelectedHistoryMetricId(metricId);
    navigateToScreen('motion-stats');
  };

  const handleAdjustBoard = (field, deltaOrValue, isStat = false) => {
    setCoachBoard(current => {
      if (isStat) {
        const nextValue = Math.max(0, (current.stats[field] || 0) + deltaOrValue);
        return {
          ...current,
          stats: {
            ...current.stats,
            [field]: nextValue,
          },
        };
      }

      if (field === 'possession') {
        return {
          ...current,
          possession: deltaOrValue,
        };
      }

      return {
        ...current,
        [field]: Math.max(0, (current[field] || 0) + deltaOrValue),
      };
    });
  };

  const handleSaveSessionToProfile = profileId => {
    if (!analysisResult) {
      return;
    }

    const nextSession = buildSessionSnapshot(analysisResult, selectedVideo);

    setProfiles(current =>
      current.map(profile =>
        profile.id === profileId
          ? {
              ...profile,
              sessions: [nextSession, ...profile.sessions],
            }
          : profile,
      ),
    );
  };

  let screen = <HomeScreen onOpenScreen={navigateToScreen} />;

  if (activeScreen === 'motion-lab-menu') {
    screen = <MotionLabMenuScreen {...sharedScreenProps} />;
  }

  if (activeScreen === 'motion-lab') {
    screen = (
      <MotionLabScreen
        analysisResult={analysisResult}
        onAnalyzeRep={handleAnalyzeRep}
        onOpenMetricHistory={handleOpenMetricHistory}
        onSelectVideo={handleSelectVideo}
        selectedVideo={selectedVideo}
        trackingError={trackingError}
        trackingResult={trackingResult}
        trackingStatus={trackingStatus}
        {...sharedScreenProps}
      />
    );
  }

  if (activeScreen === 'swing-tracker' || activeScreen === 'neon-playback') {
    screen = (
      <PlaybackScreen
        analysisResult={analysisResult}
        selectedVideo={selectedVideo}
        trackingStatus={trackingStatus}
        {...sharedScreenProps}
      />
    );
  }

  if (activeScreen === 'ball-speed-tool') {
    screen = (
      <BallSpeedScreen
        analysisInput={analysisInput}
        analysisResult={analysisResult}
        selectedVideo={selectedVideo}
        trackingResult={trackingResult}
        trackingStatus={trackingStatus}
        {...sharedScreenProps}
      />
    );
  }

  if (activeScreen === 'swing-feedback') {
    screen = (
      <FeedbackScreen
        analysisResult={analysisResult}
        selectedVideo={selectedVideo}
        trackingStatus={trackingStatus}
        {...sharedScreenProps}
      />
    );
  }

  if (activeScreen === 'motion-stats' || activeScreen === 'jump-speed') {
    screen = (
      <MetricsScreen
        analysisResult={analysisResult}
        historyMetricId={selectedHistoryMetricId}
        motionHistory={motionHistory}
        {...sharedScreenProps}
      />
    );
  }

  if (activeScreen === 'scoreboard') {
    screen = (
      <CoachBoardScreen
        coachBoard={coachBoard}
        onAdjustBoard={handleAdjustBoard}
        {...sharedScreenProps}
      />
    );
  }

  if (activeScreen === 'player-profiles') {
    screen = (
      <ProfilesScreen
        analysisResult={analysisResult}
        onSaveSessionToProfile={handleSaveSessionToProfile}
        profiles={profiles}
        selectedVideo={selectedVideo}
        {...sharedScreenProps}
      />
    );
  }

  if (activeScreen === 'about') {
    screen = <AboutScreen {...sharedScreenProps} />;
  }

  return (
    <View style={{flex: 1}}>
      <StatusBar barStyle="light-content" backgroundColor="#09020F" />
      {screen}
      <SplashOverlay onComplete={() => setShowSplash(false)} visible={showSplash} />
    </View>
  );
}
