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

export const analyzerModules = [
  {
    title: "Recorder + Neon Trail",
    eyebrow: "Live Motion Capture",
    description:
      "Record athletes through approach, jump, and arm swing while rendering a neon motion trail from the hands into the ball path.",
    bullets: ["Hand trail overlay", "Ball trail after contact", "Frame-by-frame playback"],
  },
  {
    title: "Correction Engine",
    eyebrow: "AI Swing Review",
    description:
      "Analyze mechanics, estimate likely causes of hitches or timing issues, and return a simple correction cue the player can test next rep.",
    bullets: ["Potential fault callout", "Suggested correction cue", "Confidence trend by session"],
  },
];

export const actionChips = [
  "Start recorder",
  "Review playback",
  "Log score + stats",
  "Tag athlete session",
];