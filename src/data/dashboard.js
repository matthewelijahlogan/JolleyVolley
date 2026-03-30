export const scoreboardSnapshot = {
  matchup: 'Jolley Squad vs. Varsity Edge',
  setCount: '2 - 1',
  currentScore: '23 - 19',
  possession: 'Jolley Squad ball',
  rotation: 'Serve Receive 4',
  momentum: '+12% attack efficiency',
};

export const menuSections = [
  {
    id: 'motion-lab',
    label: 'Motion Lab',
    eyebrow: 'Recorder',
    preview: 'Capture approach, jump, and swing sessions.',
    description:
      'Record or import a player clip, mark a few key motion details, and run Jolley Volley analysis on the rep.',
    bullets: [
      'Record video or import from the phone',
      'Track jump and swing session details',
      'Launch the analysis workflow from the clip',
    ],
    openLabel: 'Open Motion Lab',
  },
  {
    id: 'neon-playback',
    label: 'Neon Playback',
    eyebrow: 'Trail View',
    preview: 'Replay the clip with glowing overlays.',
    description:
      'Review the current clip in a playback view with a neon hand path and ball path overlay shaped by the analysis session.',
    bullets: [
      'Hand trail before contact',
      'Ball trail after contact',
      'Visual hitch spotting during replay',
    ],
    openLabel: 'Open Playback',
  },
  {
    id: 'swing-feedback',
    label: 'Swing Feedback',
    eyebrow: 'AI Advice',
    preview: 'Read correction cues and rep notes.',
    description:
      'Turn the session data into simple correction cues a player can actually try on the next ball.',
    bullets: [
      'Spot timing breakdowns',
      'Show the likely mechanical issue',
      'Return a clear next-step cue',
    ],
    openLabel: 'Open Feedback',
  },
  {
    id: 'jump-speed',
    label: 'Jump + Speed',
    eyebrow: 'Metrics',
    preview: 'Estimate vertical leap and ball MPH.',
    description:
      'Surface the athlete metrics tied to the current clip, including vertical leap, hitch severity, and ball speed estimate.',
    bullets: [
      'Vertical leap estimate',
      'Ball speed estimate in MPH',
      'Session metric breakdown',
    ],
    openLabel: 'Open Metrics',
  },
  {
    id: 'coach-board',
    label: 'Coach Board',
    eyebrow: 'Scorecard',
    preview: 'Track score, possession, and team stats.',
    description:
      'Keep a clean courtside scoreboard with possession, set totals, and the most common volleyball stat counters.',
    bullets: [
      'Track live score and sets',
      'Toggle possession quickly',
      'Count kills, aces, blocks, digs, and assists',
    ],
    openLabel: 'Open Coach Board',
  },
];

export const homeQuickActions = [
  {label: 'Motion Lab', screen: 'motion-lab'},
  {label: 'Coach Board', screen: 'coach-board'},
  {label: 'Playback', screen: 'neon-playback'},
  {label: 'Feedback', screen: 'swing-feedback'},
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