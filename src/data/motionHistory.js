const HITCH_FRAMES_BY_SEVERITY = {
  High: 5,
  Moderate: 3,
  Low: 2,
};

export const motionHistoryMetrics = [
  {
    id: 'verticalLeapInches',
    label: 'Vertical Leap',
    historyTitle: 'Vertical Leap History',
    emptyMessage: 'No jump history has been saved yet.',
  },
  {
    id: 'ballSpeedMph',
    label: 'Ball Speed',
    historyTitle: 'Ball Speed History',
    emptyMessage: 'No ball-speed history has been saved yet.',
  },
  {
    id: 'peakHandSpeedMph',
    label: 'Peak Hand',
    historyTitle: 'Peak Hand History',
    emptyMessage: 'No hand-speed history has been saved yet.',
  },
  {
    id: 'hitchFrames',
    label: 'Hitch Frames',
    historyTitle: 'Hitch Frame History',
    emptyMessage: 'No hitch history has been saved yet.',
  },
  {
    id: 'contactPoint',
    label: 'Contact Point',
    historyTitle: 'Contact Point History',
    emptyMessage: 'No contact-point history has been saved yet.',
  },
  {
    id: 'landingStability',
    label: 'Landing',
    historyTitle: 'Landing History',
    emptyMessage: 'No landing history has been saved yet.',
  },
];

function toNumberOrNull(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatOneDecimal(value, suffix) {
  return `${Number(value).toFixed(1)} ${suffix}`;
}

function formatContactPoint(value) {
  if (value === 'in-front') {
    return 'In Front';
  }

  if (value === 'behind') {
    return 'Behind';
  }

  return 'Ideal';
}

function formatLandingStability(value) {
  return value === 'off-balance' ? 'Off Balance' : 'Steady';
}

export function getMotionHistoryMetric(metricId) {
  return motionHistoryMetrics.find(metric => metric.id === metricId) || motionHistoryMetrics[0];
}

export function hasMotionHistoryValue(metricId, value) {
  if (metricId === 'contactPoint' || metricId === 'landingStability') {
    return typeof value === 'string' && value.trim().length > 0;
  }

  return Number.isFinite(Number(value));
}

export function formatMotionHistoryValue(metricId, value) {
  if (!hasMotionHistoryValue(metricId, value)) {
    return 'Awaiting AI';
  }

  switch (metricId) {
    case 'verticalLeapInches':
      return formatOneDecimal(value, 'in');
    case 'ballSpeedMph':
      return formatOneDecimal(value, 'MPH');
    case 'peakHandSpeedMph':
      return formatOneDecimal(value, 'MPH');
    case 'hitchFrames':
      return `${Math.round(Number(value))} frames`;
    case 'contactPoint':
      return formatContactPoint(value);
    case 'landingStability':
      return formatLandingStability(value);
    default:
      return `${value}`;
  }
}

function createSeedEntry(profile, session, index) {
  return {
    id: `${profile.id}-${session.id}-${index}`,
    athleteName: profile.name,
    clipName: session.clipName || 'Saved session',
    date: session.date,
    summary: session.summary,
    verticalLeapInches: toNumberOrNull(session.verticalLeapInches),
    ballSpeedMph: toNumberOrNull(session.ballSpeedMph),
    peakHandSpeedMph: toNumberOrNull(session.peakHandSpeedMph),
    hitchFrames:
      toNumberOrNull(session.hitchFrames) ??
      HITCH_FRAMES_BY_SEVERITY[session.hitchSeverity] ??
      null,
    contactPoint: session.contactPoint || '',
    landingStability: session.landingStability || '',
  };
}

export function createMotionHistoryFromProfiles(profiles = []) {
  return profiles.flatMap(profile =>
    (profile.sessions || []).map((session, index) => createSeedEntry(profile, session, index)),
  );
}

export function createMotionHistoryEntry(analysisResult, selectedVideo) {
  return {
    id: `motion-${Date.now()}`,
    athleteName: 'Motion Lab',
    clipName: selectedVideo?.fileName || 'Current rep',
    date: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    summary: analysisResult?.summary || 'Motion Lab session',
    verticalLeapInches: toNumberOrNull(analysisResult?.verticalLeapInches),
    ballSpeedMph: toNumberOrNull(analysisResult?.ballSpeedMph),
    peakHandSpeedMph: toNumberOrNull(analysisResult?.peakHandSpeedMph),
    hitchFrames: toNumberOrNull(analysisResult?.hitchFrames),
    contactPoint: analysisResult?.contactPoint || '',
    landingStability: analysisResult?.landingStability || '',
  };
}
