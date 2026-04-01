export const mainMenuSections = [
  {
    id: 'motion-lab',
    label: 'Motion Lab',
    eyebrow: 'Analysis Suite',
    preview: 'Record or import one rep and get the swing, ball, jump, and correction readouts together on one screen.',
    description:
      'Motion Lab is the all-in-one training hub. Capture one rep, run one analysis pass, and get the swing trail, ball speed, jump numbers, and correction cues together.',
    bullets: [
      'Record or import a player rep',
      'Run one full Motion Lab analysis pass',
      'Review the swing, ball, jump, and coaching readout together',
    ],
    openLabel: 'Open Motion Lab',
  },
  {
    id: 'scoreboard',
    label: 'Scoreboard',
    eyebrow: 'Match Control',
    preview: 'Run a big live score up top, swipe through jersey-based stat panels below, and finish into a full player-stat review.',
    description:
      'The scoreboard is built for live match control first. Keep the score huge, flip serve quickly, swipe through stat categories, and log kills, digs, and more directly to a jersey number.',
    bullets: [
      'Keep score and set totals live on a dedicated board',
      'Swipe stat-entry panels by category',
      'Finish the match into an individual player-stat review',
    ],
    openLabel: 'Open Scoreboard',
  },
  {
    id: 'player-profiles',
    label: 'Profiles',
    eyebrow: 'Athlete Tracking',
    preview: 'Build player cards and save motion sessions so progress is easy to follow over time.',
    description:
      'Profiles let the coach group current athletes, review recent saved sessions, and keep an eye on jump height, ball speed, hitch severity, and trend notes.',
    bullets: [
      'Store athletes in one place',
      'Save the current session to a player',
      'Track progress from rep to rep',
    ],
    openLabel: 'Open Profiles',
  },
  {
    id: 'about',
    label: 'About',
    eyebrow: 'Jolley Volley',
    preview: 'Read what the app is built to do and where the analysis pipeline is heading next.',
    description:
      'The about page explains the product direction, current working features, and the roadmap for deeper automated computer-vision analysis inside Jolley Volley.',
    bullets: [
      'Product purpose and direction',
      'Current live features in the app',
      'Planned AI and ML analysis expansion',
    ],
    openLabel: 'Open About',
  },
];

export const motionLabSections = [
  {
    id: 'motion-lab',
    label: 'Recorder',
    eyebrow: 'Capture',
    preview: 'Record or import one rep, run one pass, and review the current motion snapshot in one tighter screen.',
    description:
      'Capture one athlete clip, run one analysis pass, and keep the video, playback read, metric links, and advice together on a single Motion Lab page.',
    bullets: [
      'Record or import one rep',
      'Run one Motion Lab analysis pass',
      'Open stat history directly from the metric tiles',
    ],
    openLabel: 'Open Recorder',
  },
  {
    id: 'swing-tracker',
    label: 'Swing Tracker',
    eyebrow: 'Visual Tool',
    preview: 'Show the hand moving through the hitting zone and call out hitch points in the swing.',
    description:
      'Swing Tracker focuses on the motion path itself. It shows the hand path through the zone, flags the current hitch severity, and keeps the visual tied to the active rep.',
    bullets: [
      'Highlight the hand path through the zone',
      'Flag visible hitch severity',
      'Keep the overlay linked to the active clip',
    ],
    openLabel: 'Open Swing Tracker',
  },
  {
    id: 'ball-speed-tool',
    label: 'Ball Speed',
    eyebrow: 'MPH Tool',
    preview: 'Focus only on the current MPH estimate, release timing, and sample values.',
    description:
      'Ball Speed isolates the velocity side of the rep so the coach can work directly with MPH, release timing, distance sample, and FPS.',
    bullets: [
      'Show the current MPH estimate',
      'Break out release timing in seconds',
      'Tie the output to the active clip sample',
    ],
    openLabel: 'Open Ball Speed',
  },
  {
    id: 'motion-stats',
    label: 'Stat History',
    eyebrow: 'Tabulated Figures',
    preview: 'Open a clean history grid for one tracked metric at a time.',
    description:
      'Stat History opens one tracked category at a time so the coach can review the saved history for that metric in a cleaner grid.',
    bullets: [
      'Open one metric history grid at a time',
      'Review saved Motion Lab sessions by category',
      'Keep the current reading tied to the history list',
    ],
    openLabel: 'Open Stat History',
  },
  {
    id: 'swing-feedback',
    label: 'Swing Feedback',
    eyebrow: 'Corrections',
    preview: 'Read the coaching cues generated from the current rep analysis.',
    description:
      'The feedback page translates the active motion session into correction language a player can use on the next ball.',
    bullets: [
      'Flag timing and hitch issues',
      'Explain the likely swing breakdown',
      'Suggest a cleaner next rep cue',
    ],
    openLabel: 'Open Feedback',
  },
];

export const scoreboardStatCategories = [
  {
    id: 'kills',
    label: 'Kills',
    shortLabel: 'K',
    hint: 'Tap the jersey that finished the point.',
  },
  {
    id: 'digs',
    label: 'Digs',
    shortLabel: 'D',
    hint: 'Track the defender who kept the ball alive.',
  },
  {
    id: 'assists',
    label: 'Assists',
    shortLabel: 'A',
    hint: 'Add the setter or helper that created the swing.',
  },
  {
    id: 'blocks',
    label: 'Blocks',
    shortLabel: 'B',
    hint: 'Mark the blocker that closed the attack.',
  },
  {
    id: 'aces',
    label: 'Aces',
    shortLabel: 'ACE',
    hint: 'Keep service pressure tied to a jersey number.',
  },
  {
    id: 'errors',
    label: 'Errors',
    shortLabel: 'E',
    hint: 'Log service, hitting, or handling errors by player.',
  },
];

export function createEmptyScoreboardStats() {
  return scoreboardStatCategories.reduce((stats, category) => {
    stats[category.id] = 0;
    return stats;
  }, {});
}

export function createTeamPlayer(id, jersey, name, role) {
  return {
    id,
    jersey,
    name,
    role,
  };
}

export function createMatchRosterFromTeam(players = []) {
  return players.map(player => ({
    ...player,
    stats: createEmptyScoreboardStats(),
  }));
}

export const defaultScoreboardVisibility = {
  showScoreboard: true,
  showStats: true,
  showAwayScoreboard: true,
  showAwayStats: true,
};

export const initialTeams = [
  {
    id: 'jolley-squad',
    name: 'Jolley Squad',
    abbreviation: 'JVSQ',
    players: [
      createTeamPlayer('ava-rivera', '12', 'Ava Rivera', 'OH'),
      createTeamPlayer('mila-chen', '9', 'Mila Chen', 'RS'),
      createTeamPlayer('zoe-banks', '5', 'Zoe Banks', 'MB'),
      createTeamPlayer('tori-james', '3', 'Tori James', 'S'),
      createTeamPlayer('kira-hall', '14', 'Kira Hall', 'DS'),
      createTeamPlayer('lena-ortiz', '18', 'Lena Ortiz', 'OH'),
    ],
  },
  {
    id: 'varsity-edge',
    name: 'Varsity Edge',
    abbreviation: 'EDGE',
    players: [
      createTeamPlayer('maya-ford', '2', 'Maya Ford', 'OH'),
      createTeamPlayer('nova-byrd', '6', 'Nova Byrd', 'MB'),
      createTeamPlayer('ella-hughes', '8', 'Ella Hughes', 'S'),
      createTeamPlayer('sloane-carter', '11', 'Sloane Carter', 'RS'),
      createTeamPlayer('riley-price', '15', 'Riley Price', 'DS'),
      createTeamPlayer('jade-kim', '21', 'Jade Kim', 'OH'),
    ],
  },
];

export const initialAnalysisInput = {
  standingReachInches: '',
  contactReachInches: '',
  ballTravelFeet: '',
  releaseFrames: '',
  fps: '',
  hitchFrames: '',
  contactPoint: 'ideal',
  landingStability: 'steady',
};

export const initialCoachBoard = {
  homeTeamId: initialTeams[0].id,
  awayTeamId: initialTeams[1].id,
  homeTeam: initialTeams[0].name,
  awayTeam: initialTeams[1].name,
  homeScore: 0,
  awayScore: 0,
  homeSets: 0,
  awaySets: 0,
  possession: 'home',
  matchStatus: 'live',
  finishedAt: '',
  visibility: defaultScoreboardVisibility,
  homeRoster: createMatchRosterFromTeam(initialTeams[0].players),
  awayRoster: createMatchRosterFromTeam(initialTeams[1].players),
};

export const initialProfiles = [
  {
    id: 'ava-rivera',
    name: 'Ava Rivera',
    role: 'Outside Hitter',
    focus: 'Earlier contact and stronger landing control.',
    sessions: [
      {
        id: 'ava-session-1',
        date: 'Mar 22, 2026',
        verticalLeapInches: 27.8,
        ballSpeedMph: 42.6,
        hitchSeverity: 'Moderate',
        summary: 'Vertical 27.8 in | Ball 42.6 MPH | Hitch 3 frames',
        clipName: 'ava_line_shot.mp4',
      },
      {
        id: 'ava-session-2',
        date: 'Mar 27, 2026',
        verticalLeapInches: 28.9,
        ballSpeedMph: 44.1,
        hitchSeverity: 'Low',
        summary: 'Vertical 28.9 in | Ball 44.1 MPH | Hitch 2 frames',
        clipName: 'ava_cross_court.mp4',
      },
    ],
  },
  {
    id: 'mila-chen',
    name: 'Mila Chen',
    role: 'Right Side',
    focus: 'Cleaner hand path through contact.',
    sessions: [
      {
        id: 'mila-session-1',
        date: 'Mar 18, 2026',
        verticalLeapInches: 25.4,
        ballSpeedMph: 38.9,
        hitchSeverity: 'High',
        summary: 'Vertical 25.4 in | Ball 38.9 MPH | Hitch 5 frames',
        clipName: 'mila_tool_ball.mp4',
      },
    ],
  },
  {
    id: 'zoe-banks',
    name: 'Zoe Banks',
    role: 'Middle Blocker',
    focus: 'Drive more force from the approach into the swing.',
    sessions: [],
  },
];
