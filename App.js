import React, {useEffect, useMemo, useRef, useState} from 'react';
import {BackHandler, StatusBar, View} from 'react-native';

import {SplashOverlay} from './src/components/SplashOverlay';
import {initialAnalysisInput, initialCoachBoard, initialProfiles} from './src/data/dashboard';
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
  const [analysisResult, setAnalysisResult] = useState(() => runVideoAnalysis(initialAnalysisInput));
  const [coachBoard, setCoachBoard] = useState(initialCoachBoard);
  const [profiles, setProfiles] = useState(initialProfiles);
  const screenStackRef = useRef(screenStack);

  const activeScreen = screenStack[screenStack.length - 1] || HOME_SCREEN;

  useEffect(() => {
    screenStackRef.current = screenStack;
  }, [screenStack]);

  useEffect(() => {
    setAnalysisResult(runVideoAnalysis(analysisInput));
  }, [analysisInput]);

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
    setScreenStack(current => {
      if (current[current.length - 1] === HOME_SCREEN) {
        return current;
      }

      return [...current, HOME_SCREEN];
    });
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
    setAnalysisResult(runVideoAnalysis(analysisInput));
  };

  const handleSelectVideo = videoAsset => {
    setSelectedVideo(videoAsset);
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
        onRunAnalysis={handleRunAnalysis}
        onSelectVideo={handleSelectVideo}
        selectedVideo={selectedVideo}
        {...sharedScreenProps}
      />
    );
  }

  if (activeScreen === 'swing-tracker' || activeScreen === 'neon-playback') {
    screen = (
      <PlaybackScreen
        analysisResult={analysisResult}
        selectedVideo={selectedVideo}
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
        {...sharedScreenProps}
      />
    );
  }

  if (activeScreen === 'swing-feedback') {
    screen = <FeedbackScreen analysisResult={analysisResult} {...sharedScreenProps} />;
  }

  if (activeScreen === 'motion-stats' || activeScreen === 'jump-speed') {
    screen = (
      <MetricsScreen
        analysisInput={analysisInput}
        analysisResult={analysisResult}
        selectedVideo={selectedVideo}
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
