export const mainMenuSections = [
  {
    id: 'motion-lab-menu',
    label: 'Motion Lab',
    eyebrow: 'Analysis Suite',
    preview: 'Open the video analysis area for recording, playback, feedback, and jump-speed metrics.',
    description:
      'Motion Lab is the training hub. It groups the recorder, neon playback, swing correction feedback, and the jump plus speed metric breakdown in one place.',
    bullets: [
      'Record or import a player rep',
      'Open neon playback and motion trails',
      'Review AI-style correction cues and metric assessments',
    ],
    openLabel: 'Open Motion Lab',
  },
  {
    id: 'scoreboard',
    label: 'Scoreboard',
    eyebrow: 'Match Control',
    preview: 'Track the score, possession, sets, and common volleyball stats from the sideline.',
    description:
      'The scoreboard page keeps match flow simple for a coach, with fast score controls, possession toggles, and live stat counters for the most-used volleyball actions.',
    bullets: [
      'Keep score and set totals live',
      'Flip possession in one tap',
      'Track kills, aces, blocks, digs, and assists',
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
    preview: 'Record or import a rep and enter the session markers that drive the analysis.',
    description:
      'Capture the athlete clip, set the main motion markers, and let the app score the rep from the current session data.',
    bullets: [
      'Open camera or video library',
      'Enter jump and release markers',
      'Run the current session analysis',
    ],
    openLabel: 'Open Recorder',
  },
  {
    id: 'neon-playback',
    label: 'Neon Playback',
    eyebrow: 'Replay',
    preview: 'Watch the rep with the glowing hand and ball trail overlay.',
    description:
      'Replay the active clip with the current neon swing path so hitch points and ball release feel easier to spot visually.',
    bullets: [
      'Show the hand trail before contact',
      'Show the ball trail after contact',
      'Review the rep in a clean playback space',
    ],
    openLabel: 'Open Playback',
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
  {
    id: 'jump-speed',
    label: 'Jump + Speed',
    eyebrow: 'Metrics',
    preview: 'Return the stat-by-stat assessment for the current rep.',
    description:
      'Jump plus Speed gives the user every calculated stat from the rep, including vertical, release timing, ball speed, hitch severity, contact timing, and landing control.',
    bullets: [
      'Score every entered motion marker',
      'Return a readable assessment card for each stat',
      'Keep the current clip and inputs tied to the output',
    ],
    openLabel: 'Open Metrics',
  },
];

export const initialAnalysisInput = {
  standingReachInches: '90',
  contactReachInches: '121.4',
  ballTravelFeet: '32',
  releaseFrames: '15',
  fps: '240',
  hitchFrames: '3',
  contactPoint: 'behind',
  landingStability: 'off-balance',
};

export const initialCoachBoard = {
  homeTeam: 'Jolley Squad',
  awayTeam: 'Varsity Edge',
  homeScore: 23,
  awayScore: 19,
  homeSets: 2,
  awaySets: 1,
  possession: 'home',
  stats: {
    kills: 18,
    aces: 5,
    blocks: 7,
    digs: 14,
    assists: 21,
  },
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
