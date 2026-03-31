import React, {useEffect, useMemo, useRef, useState} from 'react';
import {BackHandler, StatusBar, View} from 'react-native';

import {SplashOverlay} from './src/components/SplashOverlay';
import {initialAnalysisInput, initialCoachBoard, initialProfiles} from './src/data/dashboard';
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
    hitchSeverity: analysisResult.hitchSeverity,
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

  const handleChangeField = (field, value) => {
    setAnalysisInput(current => ({
      ...current,
      [field]: value,
    }));
  };

  const handleRunAnalysis = () => {
    setAnalysisResult(runVideoAnalysis(analysisInput, trackingResult));
  };

  const handleAnalyzeRep = async () => {
    if (selectedVideo?.uri) {
      await handleTrackSwing();
      return;
    }

    handleRunAnalysis();
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
      setTrackingResult(result);
      setTrackingStatus('ready');
      setAnalysisInput(current => ({
        ...current,
        hitchFrames: Number.isFinite(result?.hitchFrames) ? `${result.hitchFrames}` : current.hitchFrames,
        contactPoint: result?.contactPoint || current.contactPoint,
        ballTravelFeet: Number.isFinite(result?.detectedBallTravelFeet) && result.detectedBallTravelFeet > 0
          ? `${Number(result.detectedBallTravelFeet).toFixed(1)}`
          : current.ballTravelFeet,
      }));
    } catch (error) {
      setTrackingResult(null);
      setTrackingStatus('error');
      setTrackingError(error?.message || 'Unable to analyze the selected clip.');
    }
  };

  const handleSelectVideo = videoAsset => {
    setSelectedVideo(videoAsset);
    setTrackingResult(null);
    setTrackingStatus('idle');
    setTrackingError('');
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
        analysisInput={analysisInput}
        analysisResult={analysisResult}
        onChangeField={handleChangeField}
        onAnalyzeRep={handleAnalyzeRep}
        onSelectVideo={handleSelectVideo}
        onTrackSwing={handleTrackSwing}
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
        analysisInput={analysisInput}
        analysisResult={analysisResult}
        selectedVideo={selectedVideo}
        trackingStatus={trackingStatus}
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
