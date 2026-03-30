export const scoreboardSnapshot = {
  matchup: "Jolley Squad vs. Varsity Edge",
  setCount: "2 - 1",
  currentScore: "23 - 19",
  possession: "Jolley Squad ball",
  rotation: "Serve Receive 4",
  momentum: "+12% attack efficiency",
};

export const statHighlights = [
  {
    label: "Vertical Leap",
    value: "31.4 in",
    detail: "Approach load, plant timing, and lift height can be tracked per athlete session.",
  },
  {
    label: "Ball Speed",
    value: "47 MPH",
    detail: "Post-contact speed gives coaches a quick read on power transfer off the swing.",
  },
  {
    label: "Swing Hitch",
    value: "3 frames",
    detail: "Playback can spotlight where the hand path hesitates before or through contact.",
  },
];

export const menuSections = [
  {
    id: "motion-lab",
    label: "Motion Lab",
    eyebrow: "Recorder",
    preview: "Capture approach, jump, and swing sessions.",
    description:
      "Record athletes during reps so Jolley Volley can study timing, body position, and contact sequence from a clean practice workflow.",
    bullets: [
      "Tag the athlete before recording",
      "Capture jumps, approaches, and full swings",
      "Save clips for replay and comparison",
    ],
  },
  {
    id: "neon-playback",
    label: "Neon Playback",
    eyebrow: "Trail View",
    preview: "Show glowing hand and ball trails in replay.",
    description:
      "Playback is designed to trace the hitter's hand path and then the ball path in neon so coaches can spot hitches, drift, or broken acceleration more easily.",
    bullets: [
      "Hand trail before contact",
      "Ball trail after contact",
      "Frame-by-frame hitch spotting",
    ],
  },
  {
    id: "swing-feedback",
    label: "Swing Feedback",
    eyebrow: "AI Review",
    preview: "Return a likely correction cue after the rep.",
    description:
      "The swing engine will compare the rep against healthy timing and sequencing patterns, then surface a plain-language correction when something looks off.",
    bullets: [
      "Find timing or path breakdowns",
      "Estimate likely mechanical cause",
      "Suggest one correction to try next",
    ],
  },
  {
    id: "jump-speed",
    label: "Jump + Speed",
    eyebrow: "Metrics",
    preview: "Estimate vertical leap and ball MPH.",
    description:
      "This module is meant to turn video into athlete feedback by estimating vertical leap, contact timing, and the ball speed coming off the swing.",
    bullets: [
      "Vertical leap estimate",
      "Ball speed estimate in MPH",
      "Session-to-session progress tracking",
    ],
  },
  {
    id: "coach-board",
    label: "Coach Board",
    eyebrow: "Scorecard",
    preview: "Track score, possession, and key volleyball stats.",
    description:
      "The coach board is meant to stay fast and simple during live action, making it easy to log score, possession, and the popular team stats that matter most.",
    bullets: [
      "Score and set tracking",
      "Possession and rotation context",
      "Popular volleyball stat logging",
    ],
  },
];

export const actionChips = [
  "Start recorder",
  "Open scorecard",
  "Review latest swing",
  "Tag athlete session",
];