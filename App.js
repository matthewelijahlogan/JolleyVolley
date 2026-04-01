import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Alert, BackHandler, StatusBar, View} from 'react-native';

import {SplashOverlay} from './src/components/SplashOverlay';
import {
  createEmptyScoreboardStats,
  createMatchRosterFromTeam,
  defaultScoreboardVisibility,
  initialAnalysisInput,
  initialCoachBoard,
  initialProfiles,
  initialTeams,
  scoreboardStatCategories,
} from './src/data/dashboard';
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
import {loadPersistedAppState, savePersistedAppState} from './src/storage/appState';
import {runVideoAnalysis, validateMotionCapture} from './src/utils/analysis';

const HOME_SCREEN = 'home';
const MAX_LOGS = 250;

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

function formatFinishedMatchTime() {
  return new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function slugify(value = 'item') {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

function createEntityId(prefix, seed) {
  return `${prefix}-${slugify(seed)}-${Date.now().toString(36)}`;
}

function createLogEntry(category, message, detail = '') {
  const now = new Date();

  return {
    id: `log-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    category,
    message,
    detail,
    createdAt: now.toISOString(),
    label: now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }),
  };
}

function createInitialLogs() {
  return [createLogEntry('system', 'Local state initialized from defaults.')];
}

function normalizeVisibility(visibility) {
  return {
    ...defaultScoreboardVisibility,
    ...(visibility || {}),
  };
}

function normalizeTrackingStatus(status) {
  if (status === 'ready' || status === 'error' || status === 'recapture') {
    return status;
  }

  return 'idle';
}

function sanitizeTeamPlayer(player, index) {
  return {
    id: player?.id || createEntityId('player', `${player?.name || 'player'}-${index}`),
    jersey: `${player?.jersey || ''}`,
    name: player?.name || `Player ${index + 1}`,
    role: player?.role || 'ATH',
  };
}

function sanitizeTeam(team, index) {
  const name = team?.name?.trim() || `Team ${index + 1}`;
  const abbreviationSource = team?.abbreviation?.trim() || name;

  return {
    id: team?.id || createEntityId('team', `${name}-${index}`),
    name,
    abbreviation: abbreviationSource.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 6) || 'TEAM',
    players: Array.isArray(team?.players) ? team.players.map(sanitizeTeamPlayer) : [],
  };
}

function sanitizeTeams(teams) {
  if (!Array.isArray(teams) || teams.length === 0) {
    return initialTeams;
  }

  return teams.map(sanitizeTeam);
}

function normalizeRoster(roster = []) {
  return roster.map((player, index) => ({
    id: player?.id || createEntityId('roster-player', `${player?.name || 'player'}-${index}`),
    jersey: `${player?.jersey || ''}`,
    name: player?.name || `Player ${index + 1}`,
    role: player?.role || 'ATH',
    stats: {
      ...createEmptyScoreboardStats(),
      ...(player?.stats || {}),
    },
  }));
}

function syncRosterWithTeamPlayers(teamPlayers = [], currentRoster = []) {
  const rosterById = new Map((currentRoster || []).map(player => [player.id, player]));

  return teamPlayers.map(player => {
    const currentPlayer = rosterById.get(player.id);

    return {
      ...player,
      stats: currentPlayer
        ? {
            ...createEmptyScoreboardStats(),
            ...(currentPlayer.stats || {}),
          }
        : createEmptyScoreboardStats(),
    };
  });
}

function syncCoachBoardWithTeams(coachBoard, teams) {
  const safeTeams = sanitizeTeams(teams);
  const homeFallback = safeTeams[0] || null;
  const awayFallback = safeTeams[1] || safeTeams[0] || null;
  const homeTeam = safeTeams.find(team => team.id === coachBoard?.homeTeamId) || homeFallback;
  const awayTeam = safeTeams.find(team => team.id === coachBoard?.awayTeamId) || awayFallback;
  const homeRoster = Array.isArray(coachBoard?.homeRoster) && coachBoard.homeRoster.length
    ? syncRosterWithTeamPlayers(homeTeam?.players || [], normalizeRoster(coachBoard.homeRoster))
    : createMatchRosterFromTeam(homeTeam?.players || []);
  const awayRoster = Array.isArray(coachBoard?.awayRoster) && coachBoard.awayRoster.length
    ? syncRosterWithTeamPlayers(awayTeam?.players || [], normalizeRoster(coachBoard.awayRoster))
    : createMatchRosterFromTeam(awayTeam?.players || []);

  return {
    ...initialCoachBoard,
    ...(coachBoard || {}),
    homeTeamId: homeTeam?.id || '',
    awayTeamId: awayTeam?.id || homeTeam?.id || '',
    homeTeam: homeTeam?.name || initialCoachBoard.homeTeam,
    awayTeam: awayTeam?.name || homeTeam?.name || initialCoachBoard.awayTeam,
    homeRoster,
    awayRoster,
    visibility: normalizeVisibility(coachBoard?.visibility),
    possession: coachBoard?.possession === 'away' ? 'away' : 'home',
    matchStatus: coachBoard?.matchStatus === 'final' ? 'final' : 'live',
    finishedAt: coachBoard?.finishedAt || '',
  };
}

function removeAthleteHistoryEntries(history, athleteName) {
  return (history || []).filter(entry => entry.athleteName !== athleteName);
}

function createProfileHistoryEntry(profileName, analysisResult, selectedVideo) {
  return {
    ...createMotionHistoryEntry(analysisResult, selectedVideo),
    id: `profile-motion-${Date.now()}`,
    athleteName: profileName,
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
  const [trackingPrompt, setTrackingPrompt] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(() => runVideoAnalysis(initialAnalysisInput, null));
  const [teams, setTeams] = useState(initialTeams);
  const [coachBoard, setCoachBoard] = useState(() => syncCoachBoardWithTeams(initialCoachBoard, initialTeams));
  const [profiles, setProfiles] = useState(initialProfiles);
  const [motionHistory, setMotionHistory] = useState(() => createMotionHistoryFromProfiles(initialProfiles));
  const [selectedHistoryMetricId, setSelectedHistoryMetricId] = useState('verticalLeapInches');
  const [appLogs, setAppLogs] = useState(() => createInitialLogs());
  const [storageReady, setStorageReady] = useState(false);
  const screenStackRef = useRef(screenStack);

  const activeScreen = screenStack[screenStack.length - 1] || HOME_SCREEN;

  const appendLog = (category, message, detail = '') => {
    setAppLogs(current => [createLogEntry(category, message, detail), ...current].slice(0, MAX_LOGS));
  };

  useEffect(() => {
    screenStackRef.current = screenStack;
  }, [screenStack]);

  useEffect(() => {
    setAnalysisResult(runVideoAnalysis(analysisInput, trackingResult));
  }, [analysisInput, trackingResult]);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      try {
        const saved = await loadPersistedAppState();

        if (!active) {
          return;
        }

        if (saved) {
          const restoredTeams = sanitizeTeams(saved.teams);
          const restoredProfiles = Array.isArray(saved.profiles) ? saved.profiles : initialProfiles;
          const restoredCoachBoard = syncCoachBoardWithTeams(saved.coachBoard || initialCoachBoard, restoredTeams);

          setTeams(restoredTeams);
          setProfiles(restoredProfiles);
          setCoachBoard(restoredCoachBoard);
          setSelectedVideo(saved.selectedVideo || null);
          setAnalysisInput(saved.analysisInput || initialAnalysisInput);
          setTrackingResult(saved.trackingResult || null);
          setTrackingStatus(normalizeTrackingStatus(saved.trackingStatus));
          setTrackingError(saved.trackingError || '');
          setTrackingPrompt(saved.trackingPrompt || null);
          setMotionHistory(Array.isArray(saved.motionHistory) ? saved.motionHistory : createMotionHistoryFromProfiles(restoredProfiles));
          setSelectedHistoryMetricId(saved.selectedHistoryMetricId || 'verticalLeapInches');
          setAppLogs(Array.isArray(saved.appLogs) && saved.appLogs.length ? saved.appLogs : [createLogEntry('system', 'Restored local app state.')]);
        }
      } catch (error) {
        if (active) {
          setAppLogs([createLogEntry('system', 'Local state restore failed. Using default data.', error?.message || '')]);
        }
      } finally {
        if (active) {
          setStorageReady(true);
        }
      }
    };

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    const timeout = setTimeout(() => {
      savePersistedAppState({
        selectedVideo,
        analysisInput,
        trackingResult,
        trackingStatus: normalizeTrackingStatus(trackingStatus),
        trackingError,
        trackingPrompt,
        coachBoard,
        profiles,
        teams,
        motionHistory,
        selectedHistoryMetricId,
        appLogs,
      }).catch(() => {});
    }, 250);

    return () => {
      clearTimeout(timeout);
    };
  }, [
    analysisInput,
    appLogs,
    coachBoard,
    motionHistory,
    profiles,
    selectedHistoryMetricId,
    selectedVideo,
    storageReady,
    teams,
    trackingError,
    trackingPrompt,
    trackingResult,
    trackingStatus,
  ]);

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
      appendLog('motion', 'Motion Lab run blocked because no clip was selected.');
      return;
    }

    await handleTrackSwing();
  };

  const handleTrackSwing = async () => {
    if (!selectedVideo?.uri) {
      setTrackingStatus('error');
      setTrackingError('Select or record a clip before running the swing tracker.');
      appendLog('motion', 'Swing tracking was blocked because no clip was selected.');
      return;
    }

    try {
      setTrackingStatus('running');
      setTrackingError('');
      appendLog('motion', `Started Motion Lab analysis for ${selectedVideo.fileName || 'the current clip'}.`);
      const result = await analyzeMotionVideo(selectedVideo.uri);
      const validation = validateMotionCapture(result);

      if (!validation.isValid) {
        setTrackingResult(null);
        setTrackingStatus('recapture');
        setTrackingError(validation.message);
        setTrackingPrompt(validation);
        setAnalysisInput(initialAnalysisInput);
        setAnalysisResult(runVideoAnalysis(initialAnalysisInput, null));
        appendLog('motion', 'Motion Lab requested a recapture.', validation.message);
        Alert.alert(validation.title, validation.message);
        return;
      }

      const nextAnalysisInput = buildAnalysisInputFromTracking(result);
      const nextAnalysisResult = runVideoAnalysis(nextAnalysisInput, result);

      setTrackingPrompt(null);
      setTrackingResult(result);
      setTrackingStatus('ready');
      setAnalysisInput(nextAnalysisInput);
      setAnalysisResult(nextAnalysisResult);
      setMotionHistory(current => [createMotionHistoryEntry(nextAnalysisResult, selectedVideo), ...current].slice(0, 120));
      appendLog('motion', 'Motion Lab analysis completed.', nextAnalysisResult.summary);
    } catch (error) {
      setTrackingPrompt(null);
      setTrackingResult(null);
      setTrackingStatus('error');
      setTrackingError(error?.message || 'Unable to analyze the selected clip.');
      appendLog('motion', 'Motion Lab analysis failed.', error?.message || 'Unknown analysis error.');
    }
  };

  const handleSelectVideo = videoAsset => {
    setSelectedVideo(videoAsset);
    setAnalysisInput(initialAnalysisInput);
    setTrackingResult(null);
    setTrackingStatus('idle');
    setTrackingError('');
    setTrackingPrompt(null);
    appendLog('motion', `Loaded clip ${videoAsset?.fileName || 'video asset'} into Motion Lab.`);
  };

  const handleOpenMetricHistory = metricId => {
    setSelectedHistoryMetricId(metricId);
    navigateToScreen('motion-stats');
  };

  const handleAdjustScore = (teamSide, delta) => {
    const teamLabel = teamSide === 'home' ? 'Home' : 'Away';
    const scoreField = teamSide === 'home' ? 'homeScore' : 'awayScore';
    const nextScore = Math.max(0, Number(coachBoard?.[scoreField] || 0) + delta);

    setCoachBoard(current => {
      if (current.matchStatus === 'final') {
        return current;
      }

      return {
        ...current,
        [scoreField]: nextScore,
        possession: delta > 0 ? teamSide : current.possession,
      };
    });

    appendLog('scoreboard', `${teamLabel} score ${delta >= 0 ? 'changed' : 'reduced'} to ${nextScore}.`);
  };

  const handleAdjustSets = (teamSide, delta) => {
    const teamLabel = teamSide === 'home' ? 'Home' : 'Away';
    const setField = teamSide === 'home' ? 'homeSets' : 'awaySets';
    const nextSets = Math.max(0, Number(coachBoard?.[setField] || 0) + delta);

    setCoachBoard(current => {
      if (current.matchStatus === 'final') {
        return current;
      }

      return {
        ...current,
        [setField]: nextSets,
      };
    });

    appendLog('scoreboard', `${teamLabel} sets changed to ${nextSets}.`);
  };

  const handleSetPossession = teamSide => {
    setCoachBoard(current => {
      if (current.matchStatus === 'final') {
        return current;
      }

      return {
        ...current,
        possession: teamSide,
      };
    });

    appendLog('scoreboard', `${teamSide === 'home' ? 'Home' : 'Away'} serve selected.`);
  };

  const handleAdjustPlayerStat = (teamSide, playerId, statId, delta) => {
    const rosterField = teamSide === 'home' ? 'homeRoster' : 'awayRoster';
    const player = (coachBoard?.[rosterField] || []).find(item => item.id === playerId);
    const statLabel = scoreboardStatCategories.find(category => category.id === statId)?.label || statId;
    const nextValue = Math.max(0, Number(player?.stats?.[statId] || 0) + delta);

    setCoachBoard(current => {
      if (current.matchStatus === 'final') {
        return current;
      }

      return {
        ...current,
        [rosterField]: (current[rosterField] || []).map(teamPlayer =>
          teamPlayer.id === playerId
            ? {
                ...teamPlayer,
                stats: {
                  ...teamPlayer.stats,
                  [statId]: Math.max(0, Number(teamPlayer.stats?.[statId] || 0) + delta),
                },
              }
            : teamPlayer,
        ),
      };
    });

    appendLog(
      'scoreboard',
      `${player?.name || 'Player'} ${delta >= 0 ? 'updated' : 'reduced'} ${statLabel} to ${nextValue}.`,
      `${teamSide === 'home' ? 'Home' : 'Away'} roster`,
    );
  };

  const handleFinishMatch = () => {
    setCoachBoard(current => {
      if (current.matchStatus === 'final') {
        return current;
      }

      return {
        ...current,
        matchStatus: 'final',
        finishedAt: formatFinishedMatchTime(),
      };
    });

    appendLog('scoreboard', 'Match moved into final review mode.');
  };

  const handleResumeMatch = () => {
    setCoachBoard(current => ({
      ...current,
      matchStatus: 'live',
      finishedAt: '',
    }));
    appendLog('scoreboard', 'Match reopened from final review mode.');
  };

  const handleStartNewMatch = () => {
    setCoachBoard(current => ({
      ...syncCoachBoardWithTeams(current, teams),
      homeScore: 0,
      awayScore: 0,
      homeSets: 0,
      awaySets: 0,
      possession: 'home',
      matchStatus: 'live',
      finishedAt: '',
      homeRoster: createMatchRosterFromTeam((teams.find(team => team.id === current.homeTeamId) || teams[0] || {players: []}).players),
      awayRoster: createMatchRosterFromTeam((teams.find(team => team.id === current.awayTeamId) || teams[1] || teams[0] || {players: []}).players),
    }));
    appendLog('scoreboard', 'Started a new match and reset live stats.');
  };

  const handleSaveSessionToProfile = profileId => {
    if (!analysisResult) {
      return;
    }

    const profile = profiles.find(item => item.id === profileId);

    if (!profile) {
      return;
    }

    const nextSession = buildSessionSnapshot(analysisResult, selectedVideo);

    setProfiles(current =>
      current.map(item =>
        item.id === profileId
          ? {
              ...item,
              sessions: [nextSession, ...item.sessions],
            }
          : item,
      ),
    );
    setMotionHistory(current => [createProfileHistoryEntry(profile.name, analysisResult, selectedVideo), ...current].slice(0, 120));
    appendLog('profiles', `Saved the current session to ${profile.name}.`, nextSession.summary);
  };

  const handleAddProfile = profileInput => {
    const name = profileInput?.name?.trim();

    if (!name) {
      return false;
    }

    const nextProfile = {
      id: createEntityId('profile', name),
      name,
      role: profileInput?.role?.trim() || 'Athlete',
      focus: profileInput?.focus?.trim() || 'Track progress and coaching notes.',
      sessions: [],
    };

    setProfiles(current => [nextProfile, ...current]);
    appendLog('profiles', `Added profile ${nextProfile.name}.`, nextProfile.role);
    return true;
  };

  const handleDeleteProfile = profileId => {
    const profile = profiles.find(item => item.id === profileId);

    if (!profile) {
      return;
    }

    Alert.alert('Delete Profile', `Remove ${profile.name} and all saved sessions from Profiles?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setProfiles(current => current.filter(item => item.id !== profileId));
          setMotionHistory(current => removeAthleteHistoryEntries(current, profile.name));
          appendLog('profiles', `Deleted profile ${profile.name}.`);
        },
      },
    ]);
  };

  const handleAddTeam = teamInput => {
    const name = teamInput?.name?.trim();

    if (!name) {
      return false;
    }

    const abbreviationSource = teamInput?.abbreviation?.trim() || name;
    const nextTeam = {
      id: createEntityId('team', name),
      name,
      abbreviation: abbreviationSource.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 6) || 'TEAM',
      players: [],
    };

    const nextTeams = [...teams, nextTeam];
    setTeams(nextTeams);
    setCoachBoard(current => syncCoachBoardWithTeams(current, nextTeams));
    appendLog('teams', `Added team ${nextTeam.name}.`, nextTeam.abbreviation);
    return true;
  };

  const handleDeleteTeam = teamId => {
    const team = teams.find(item => item.id === teamId);

    if (!team) {
      return;
    }

    if (teams.length <= 1) {
      Alert.alert('Keep One Team', 'At least one team needs to stay saved in Profiles.');
      return;
    }

    Alert.alert('Delete Team', `Remove ${team.name} and its saved roster?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const nextTeams = teams.filter(item => item.id !== teamId);
          setTeams(nextTeams);
          setCoachBoard(current => {
            const nextBoard = {
              ...current,
              homeTeamId: current.homeTeamId === teamId ? nextTeams[0].id : current.homeTeamId,
              awayTeamId:
                current.awayTeamId === teamId
                  ? (nextTeams.find(item => item.id !== (current.homeTeamId === teamId ? nextTeams[0].id : current.homeTeamId)) || nextTeams[0]).id
                  : current.awayTeamId,
            };

            return syncCoachBoardWithTeams(nextBoard, nextTeams);
          });
          appendLog('teams', `Deleted team ${team.name}.`);
        },
      },
    ]);
  };

  const handleAssignTeamToSide = (teamId, side) => {
    const team = teams.find(item => item.id === teamId);

    if (!team) {
      return;
    }

    setCoachBoard(current =>
      syncCoachBoardWithTeams(
        {
          ...current,
          [`${side}TeamId`]: teamId,
          [`${side}Team`]: team.name,
        },
        teams,
      ),
    );
    appendLog('teams', `Assigned ${team.name} to the ${side} side.`);
  };

  const handleAddPlayerToTeam = (teamId, playerInput) => {
    const team = teams.find(item => item.id === teamId);
    const name = playerInput?.name?.trim();

    if (!team || !name) {
      return false;
    }

    const nextPlayer = {
      id: createEntityId('team-player', `${name}-${playerInput?.jersey || 'jr'}`),
      jersey: playerInput?.jersey?.trim() || '--',
      name,
      role: playerInput?.role?.trim() || 'ATH',
    };

    const nextTeams = teams.map(item =>
      item.id === teamId
        ? {
            ...item,
            players: [...item.players, nextPlayer],
          }
        : item,
    );

    setTeams(nextTeams);
    setCoachBoard(current => syncCoachBoardWithTeams(current, nextTeams));
    appendLog('teams', `Added #${nextPlayer.jersey} ${nextPlayer.name} to ${team.name}.`, nextPlayer.role);
    return true;
  };

  const handleDeletePlayerFromTeam = (teamId, playerId) => {
    const team = teams.find(item => item.id === teamId);
    const player = team?.players.find(item => item.id === playerId);

    if (!team || !player) {
      return;
    }

    Alert.alert('Delete Player', `Remove ${player.name} from ${team.name}?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const nextTeams = teams.map(item =>
            item.id === teamId
              ? {
                  ...item,
                  players: item.players.filter(teamPlayer => teamPlayer.id !== playerId),
                }
              : item,
          );
          setTeams(nextTeams);
          setCoachBoard(current => syncCoachBoardWithTeams(current, nextTeams));
          appendLog('teams', `Removed ${player.name} from ${team.name}.`);
        },
      },
    ]);
  };

  const handleToggleCoachBoardVisibility = key => {
    const nextValue = !normalizeVisibility(coachBoard.visibility)[key];
    const labels = {
      showScoreboard: 'Scoreboard section',
      showStats: 'Stats section',
      showAwayScoreboard: 'Away scoreboard',
      showAwayStats: 'Away stats',
    };

    setCoachBoard(current => ({
      ...current,
      visibility: {
        ...normalizeVisibility(current.visibility),
        [key]: nextValue,
      },
    }));

    appendLog('scoreboard', `${labels[key] || key} ${nextValue ? 'enabled' : 'disabled'}.`);
  };

  const handleCreateSnapshotLog = () => {
    const detail = `${teams.length} teams | ${profiles.length} profiles | ${motionHistory.length} motion entries`;
    appendLog('snapshot', 'Saved a local state snapshot.', detail);
    Alert.alert('Snapshot Saved', 'Current teams, players, logs, and saved state have been stored locally inside the app.');
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
        trackingPrompt={trackingPrompt}
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
        onAdjustPlayerStat={handleAdjustPlayerStat}
        onAdjustScore={handleAdjustScore}
        onAdjustSets={handleAdjustSets}
        onFinishMatch={handleFinishMatch}
        onResumeMatch={handleResumeMatch}
        onSetPossession={handleSetPossession}
        onStartNewMatch={handleStartNewMatch}
        onToggleVisibility={handleToggleCoachBoardVisibility}
        {...sharedScreenProps}
      />
    );
  }

  if (activeScreen === 'player-profiles') {
    screen = (
      <ProfilesScreen
        analysisResult={analysisResult}
        appLogs={appLogs}
        coachBoard={coachBoard}
        onAddPlayerToTeam={handleAddPlayerToTeam}
        onAddProfile={handleAddProfile}
        onAddTeam={handleAddTeam}
        onAssignTeamToSide={handleAssignTeamToSide}
        onCreateSnapshotLog={handleCreateSnapshotLog}
        onDeletePlayerFromTeam={handleDeletePlayerFromTeam}
        onDeleteProfile={handleDeleteProfile}
        onDeleteTeam={handleDeleteTeam}
        onSaveSessionToProfile={handleSaveSessionToProfile}
        profiles={profiles}
        selectedVideo={selectedVideo}
        teams={teams}
        {...sharedScreenProps}
      />
    );
  }

  if (activeScreen === 'about') {
    screen = <AboutScreen {...sharedScreenProps} />;
  }

  return (
    <View style={{flex: 1}}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {screen}
      {showSplash ? <SplashOverlay onFinish={() => setShowSplash(false)} /> : null}
    </View>
  );
}
