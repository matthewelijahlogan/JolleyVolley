import React, {useEffect, useMemo, useState} from 'react';
import {StatusBar, View} from 'react-native';

import {SplashOverlay} from './src/components/SplashOverlay';
import {initialAnalysisInput, initialCoachBoard, initialProfiles} from './src/data/dashboard';
import {AboutScreen} from './src/screens/AboutScreen';
import {CoachBoardScreen} from './src/screens/CoachBoardScreen';
import {FeedbackScreen} from './src/screens/FeedbackScreen';
import {HomeScreen} from './src/screens/HomeScreen';
import {MetricsScreen} from './src/screens/MetricsScreen';
import {MotionLabMenuScreen} from './src/screens/MotionLabMenuScreen';
import {MotionLabScreen} from './src/screens/MotionLabScreen';
import {PlaybackScreen} from './src/screens/PlaybackScreen';
import {ProfilesScreen} from './src/screens/ProfilesScreen';
import {runVideoAnalysis} from './src/utils/analysis';

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
  const [activeScreen, setActiveScreen] = useState('home');
  const [showSplash, setShowSplash] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [analysisInput, setAnalysisInput] = useState(initialAnalysisInput);
  const [analysisResult, setAnalysisResult] = useState(() => runVideoAnalysis(initialAnalysisInput));
  const [coachBoard, setCoachBoard] = useState(initialCoachBoard);
  const [profiles, setProfiles] = useState(initialProfiles);

  useEffect(() => {
    setAnalysisResult(runVideoAnalysis(analysisInput));
  }, [analysisInput]);

  const sharedScreenProps = useMemo(
    () => ({
      onGoHome: () => setActiveScreen('home'),
      onOpenScreen: screen => setActiveScreen(screen),
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

  let screen = <HomeScreen onOpenScreen={setActiveScreen} />;

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

  if (activeScreen === 'neon-playback') {
    screen = (
      <PlaybackScreen
        analysisResult={analysisResult}
        selectedVideo={selectedVideo}
        {...sharedScreenProps}
      />
    );
  }

  if (activeScreen === 'swing-feedback') {
    screen = <FeedbackScreen analysisResult={analysisResult} {...sharedScreenProps} />;
  }

  if (activeScreen === 'jump-speed') {
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
