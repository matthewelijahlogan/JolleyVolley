import React, {useMemo, useState} from 'react';
import {StatusBar, View} from 'react-native';

import {SplashOverlay} from './src/components/SplashOverlay';
import {initialAnalysisInput, initialCoachBoard} from './src/data/dashboard';
import {CoachBoardScreen} from './src/screens/CoachBoardScreen';
import {FeedbackScreen} from './src/screens/FeedbackScreen';
import {HomeScreen} from './src/screens/HomeScreen';
import {MetricsScreen} from './src/screens/MetricsScreen';
import {MotionLabScreen} from './src/screens/MotionLabScreen';
import {PlaybackScreen} from './src/screens/PlaybackScreen';
import {runVideoAnalysis} from './src/utils/analysis';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('home');
  const [showSplash, setShowSplash] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [analysisInput, setAnalysisInput] = useState(initialAnalysisInput);
  const [analysisResult, setAnalysisResult] = useState(runVideoAnalysis(initialAnalysisInput));
  const [coachBoard, setCoachBoard] = useState(initialCoachBoard);

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

  let screen = <HomeScreen onOpenScreen={setActiveScreen} />;

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

  if (activeScreen === 'coach-board') {
    screen = (
      <CoachBoardScreen
        coachBoard={coachBoard}
        onAdjustBoard={handleAdjustBoard}
        {...sharedScreenProps}
      />
    );
  }

  return (
    <View style={{flex: 1}}>
      <StatusBar barStyle="light-content" backgroundColor="#09020F" />
      {screen}
      <SplashOverlay onComplete={() => setShowSplash(false)} visible={showSplash} />
    </View>
  );
}