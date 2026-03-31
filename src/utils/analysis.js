const FEET_PER_MPH_SECOND = 1.46667;

function toNumber(value) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function readOptionalNumber(value) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toFixedNumber(value, digits) {
  return Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;
}

function hasRawValue(value) {
  return `${value ?? ''}`.trim().length > 0;
}

function formatFrames(frames) {
  return `${toFixedNumber(frames, 0)} frames`;
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

function createAssessment(label, value, status, note, tone = 'neutral') {
  return {
    id: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    label,
    value,
    status,
    note,
    tone,
  };
}

function clampUnit(value) {
  return Math.min(0.98, Math.max(0.02, value));
}

function normalizeOverlayPoint(point) {
  if (!point) {
    return null;
  }

  if (typeof point.left === 'string' && typeof point.top === 'string') {
    return point;
  }

  const x = clampUnit(toNumber(point.x));
  const y = clampUnit(toNumber(point.y));

  return {
    left: `${toFixedNumber(x * 100, 1)}%`,
    top: `${toFixedNumber(y * 100, 1)}%`,
  };
}

export function runVideoAnalysis(input, tracking = null) {
  const standingReachInches = toNumber(input.standingReachInches);
  const contactReachInches = toNumber(input.contactReachInches);
  const ballTravelFeet = toNumber(input.ballTravelFeet);
  const releaseFrames = toNumber(input.releaseFrames);
  const fps = toNumber(input.fps);
  const trackedHitchFrames = readOptionalNumber(tracking?.hitchFrames);
  const hitchFrames = trackedHitchFrames ?? toNumber(input.hitchFrames);
  const trackingApplied = Array.isArray(tracking?.handTrail) && tracking.handTrail.length > 0;
  const contactPoint = tracking?.contactPoint || input.contactPoint || 'ideal';
  const landingStability = input.landingStability || 'steady';
  const dominantHand = tracking?.dominantHand || 'right';
  const trackingQuality = readOptionalNumber(tracking?.trackingQuality) ?? 0;
  const trackedFrames = readOptionalNumber(tracking?.trackedFrames) ?? 0;
  const processedFrames = readOptionalNumber(tracking?.processedFrames) ?? 0;
  const trackedBallSpeedMph = readOptionalNumber(tracking?.estimatedBallSpeedMph);
  const peakHandSpeedMph = readOptionalNumber(tracking?.peakHandSpeedMph) ?? 0;

  const hasStandingReach = hasRawValue(input.standingReachInches);
  const hasContactReach = hasRawValue(input.contactReachInches);
  const hasBallTravel = hasRawValue(input.ballTravelFeet);
  const hasReleaseFrames = hasRawValue(input.releaseFrames);
  const hasFps = hasRawValue(input.fps);
  const hasHitchFrames = trackingApplied || hasRawValue(input.hitchFrames);

  const verticalLeapInches = Math.max(0, contactReachInches - standingReachInches);
  const timeSeconds = fps > 0 ? releaseFrames / fps : 0;
  const feetPerSecond = timeSeconds > 0 ? ballTravelFeet / timeSeconds : 0;
  const manualBallSpeedMph = feetPerSecond > 0 ? feetPerSecond / FEET_PER_MPH_SECOND : 0;
  const usingTrackedBallSpeed = trackingApplied && trackedBallSpeedMph !== null && trackedBallSpeedMph > 0;
  const ballSpeedMph = usingTrackedBallSpeed ? trackedBallSpeedMph : manualBallSpeedMph;
  const ballSpeedSource = usingTrackedBallSpeed
    ? 'tracked-estimate'
    : manualBallSpeedMph > 0
      ? 'manual-flight'
      : 'pending';

  let hitchSeverity = 'Low';
  if (hitchFrames >= 5) {
    hitchSeverity = 'High';
  } else if (hitchFrames >= 3) {
    hitchSeverity = 'Moderate';
  }

  const advice = [];

  if (trackingApplied && trackingQuality < 0.35) {
    advice.push({
      title: 'Capture a cleaner swing angle',
      body: 'Tracking quality came in light on this clip. A wider side view with the whole arm visible will help lock the hand path more reliably.',
    });
  }

  if (hitchFrames >= 3) {
    advice.push({
      title: 'Smooth the arm path',
      body: trackingApplied
        ? 'The tracked hand path shows a visible pause through the zone. Focus on one continuous acceleration from load to contact.'
        : 'The swing shows a visible pause before or through contact. Focus on one continuous acceleration from load to ball.',
    });
  }

  if (contactPoint === 'behind') {
    advice.push({
      title: 'Meet the ball farther in front',
      body: 'Your contact window looks late. Start the shoulder rotation a fraction earlier and reach tall into the ball.',
    });
  }

  if (contactPoint === 'in-front') {
    advice.push({
      title: 'Stay stacked through contact',
      body: 'You may be getting too far out in front. Hold posture longer and let the hand finish through the line of the swing.',
    });
  }

  if (landingStability === 'off-balance') {
    advice.push({
      title: 'Own the landing',
      body: 'Balance is leaking after contact. Load evenly through the plant and keep the core braced through landing.',
    });
  }

  if (verticalLeapInches < 24) {
    advice.push({
      title: 'Build a stronger load',
      body: 'The jump profile suggests more room in the approach load. Sit into the hips sooner and drive through the full foot.',
    });
  }

  if (ballSpeedMph > 0 && ballSpeedMph < 35) {
    advice.push({
      title: usingTrackedBallSpeed ? 'Speed up the hand through contact' : 'Transfer force through the ball',
      body: usingTrackedBallSpeed
        ? 'The tracked hand-speed model is reading a light strike. Try a faster last-arm turn and a stronger finish through the ball.'
        : 'Ball speed looks modest for this rep. Try matching approach speed with a cleaner arm whip and stronger finish.',
    });
  }

  if (advice.length === 0) {
    advice.push({
      title: 'Keep stacking good reps',
      body: 'This session looks clean overall. Stay on the same contact timing and keep building repeatability.',
    });
  }

  const fallbackHandTrail = contactPoint === 'behind'
    ? [
        {left: '18%', top: '70%'},
        {left: '33%', top: hitchFrames >= 3 ? '62%' : '58%'},
        {left: '46%', top: hitchFrames >= 3 ? '52%' : '46%'},
        {left: '59%', top: '36%'},
      ]
    : contactPoint === 'in-front'
      ? [
          {left: '18%', top: '70%'},
          {left: '35%', top: '55%'},
          {left: '50%', top: hitchFrames >= 3 ? '42%' : '39%'},
          {left: '64%', top: '30%'},
        ]
      : [
          {left: '18%', top: '70%'},
          {left: '34%', top: hitchFrames >= 3 ? '60%' : '56%'},
          {left: '49%', top: '45%'},
          {left: '61%', top: '33%'},
        ];

  const handTrail = trackingApplied
    ? tracking.handTrail.map(normalizeOverlayPoint).filter(Boolean)
    : fallbackHandTrail;

  const ballTrail = contactPoint === 'behind'
    ? [
        {left: '61%', top: '35%'},
        {left: '71%', top: '28%'},
        {left: '81%', top: '22%'},
      ]
    : contactPoint === 'in-front'
      ? [
          {left: '65%', top: '28%'},
          {left: '77%', top: '21%'},
          {left: '88%', top: '17%'},
        ]
      : [
          {left: '62%', top: '31%'},
          {left: '74%', top: '24%'},
          {left: '86%', top: '19%'},
        ];

  const assessments = [
    trackingApplied
      ? createAssessment(
          'Swing Tracking',
          `${dominantHand} hand`,
          trackingQuality >= 0.65 ? 'Locked in' : trackingQuality >= 0.4 ? 'Usable track' : 'Light track',
          processedFrames > 0
            ? `The computer tracked ${trackedFrames}/${processedFrames} sampled video frames and fed the hand path into the current Motion Lab session.`
            : 'The computer tracked the active clip and fed the hand path into the current Motion Lab session.',
          trackingQuality >= 0.65 ? 'good' : trackingQuality >= 0.4 ? 'neutral' : 'warn',
        )
      : createAssessment(
          'Swing Tracking',
          'Manual mode',
          'Waiting on auto-track',
          'Run Auto Track Swing in the recorder to let the app pull the hand path from the active video.',
          'warn',
        ),
    hasStandingReach
      ? createAssessment(
          'Standing Reach',
          `${toFixedNumber(standingReachInches, 1)} in`,
          standingReachInches >= 92 ? 'Strong base' : standingReachInches >= 84 ? 'In range' : 'Needs review',
          standingReachInches >= 92
            ? 'Reach baseline gives the athlete a strong platform before takeoff.'
            : standingReachInches >= 84
              ? 'Standing reach sits in a usable range for comparing jump progress.'
              : 'Baseline reach looks low. Recheck the measurement to keep the jump estimate accurate.',
          standingReachInches >= 92 ? 'good' : standingReachInches >= 84 ? 'neutral' : 'warn',
        )
      : createAssessment('Standing Reach', 'Missing', 'Missing data', 'Enter a standing reach so the jump math has a real baseline.', 'warn'),
    hasContactReach
      ? createAssessment(
          'Contact Reach',
          `${toFixedNumber(contactReachInches, 1)} in`,
          contactReachInches >= 124 ? 'High contact' : contactReachInches >= 116 ? 'Competitive' : 'Developing',
          contactReachInches >= 124
            ? 'Contact height is attacking above the net with strong clearance.'
            : contactReachInches >= 116
              ? 'Contact height is workable and can keep climbing with timing and jump work.'
              : 'Contact point is on the lower side. More jump height and earlier reach can help.',
          contactReachInches >= 124 ? 'good' : contactReachInches >= 116 ? 'neutral' : 'warn',
        )
      : createAssessment('Contact Reach', 'Missing', 'Missing data', 'Enter the max contact reach from the rep to score the jump window.', 'warn'),
    hasStandingReach && hasContactReach
      ? createAssessment(
          'Vertical Leap',
          `${toFixedNumber(verticalLeapInches, 1)} in`,
          verticalLeapInches >= 30 ? 'Explosive' : verticalLeapInches >= 24 ? 'Solid' : 'Growth area',
          verticalLeapInches >= 30
            ? 'This rep shows strong pop through the approach and takeoff.'
            : verticalLeapInches >= 24
              ? 'Jump output is solid and gives the player a playable attacking window.'
              : 'Vertical is modest for an attacking rep. Focus on approach rhythm and full hip load.',
          verticalLeapInches >= 30 ? 'good' : verticalLeapInches >= 24 ? 'neutral' : 'warn',
        )
      : createAssessment('Vertical Leap', 'Pending', 'Needs inputs', 'Standing reach and contact reach are both needed to calculate the jump.', 'warn'),
    hasBallTravel
      ? createAssessment(
          'Ball Travel',
          `${toFixedNumber(ballTravelFeet, 1)} ft`,
          ballTravelFeet >= 35 ? 'Long flight' : ballTravelFeet >= 25 ? 'Usable sample' : 'Short sample',
          ballTravelFeet >= 35
            ? 'Flight distance gives a strong sample for estimating speed.'
            : ballTravelFeet >= 25
              ? 'Distance is enough for a reasonable speed estimate on this rep.'
              : 'Ball path is short. A longer visible flight makes the speed estimate more trustworthy.',
          ballTravelFeet >= 25 ? 'neutral' : 'warn',
        )
      : createAssessment('Ball Travel', 'Missing', 'Missing data', 'Enter the visible flight distance so the speed estimate has context.', 'warn'),
    hasReleaseFrames && hasFps && timeSeconds > 0
      ? createAssessment(
          'Release Timing',
          `${toFixedNumber(timeSeconds, 3)} s`,
          timeSeconds <= 0.08 ? 'Fast release' : timeSeconds <= 0.13 ? 'On pace' : 'Slow release',
          timeSeconds <= 0.08
            ? `The ball exits quickly after contact at ${formatFrames(releaseFrames)} sampled around impact.`
            : timeSeconds <= 0.13
              ? `Release timing is playable at ${formatFrames(releaseFrames)}.`
              : 'The release window is dragging. Trim wasted motion around contact for a cleaner strike.',
          timeSeconds <= 0.13 ? 'good' : 'warn',
        )
      : createAssessment('Release Timing', 'Pending', 'Needs inputs', 'Release frames and FPS are both required to calculate timing.', 'warn'),
    ballSpeedSource !== 'pending'
      ? createAssessment(
          'Ball Speed',
          `${toFixedNumber(ballSpeedMph, 1)} MPH`,
          ballSpeedMph >= 50 ? 'Heavy swing' : ballSpeedMph >= 35 ? 'Playable pace' : 'Needs more force',
          ballSpeedSource === 'tracked-estimate'
            ? ballSpeedMph >= 50
              ? 'The tracked hand-speed model reads a heavy strike coming off the swing.'
              : ballSpeedMph >= 35
                ? 'The tracked hand-speed model reads a playable ball with room for more pace.'
                : 'The tracked hand-speed model reads a light strike. A faster finish should help.'
            : ballSpeedMph >= 50
              ? 'The ball is jumping off the hand with strong pace.'
              : ballSpeedMph >= 35
                ? 'Ball speed is workable and can improve with cleaner sequencing.'
                : 'Speed looks light. More transfer through the torso and hand finish should help.',
          ballSpeedMph >= 50 ? 'good' : ballSpeedMph >= 35 ? 'neutral' : 'warn',
        )
      : createAssessment('Ball Speed', 'Pending', 'Needs inputs', 'Run Auto Track Swing or enter ball travel, release frames, and FPS for the MPH estimate.', 'warn'),
    hasHitchFrames
      ? createAssessment(
          'Hitch Frames',
          formatFrames(hitchFrames),
          hitchFrames >= 5 ? 'Major hitch' : hitchFrames >= 3 ? 'Minor hitch' : 'Clean path',
          trackingApplied
            ? hitchFrames >= 5
              ? 'The tracked hand path shows a clear pause that is likely costing speed and repeatability.'
              : hitchFrames >= 3
                ? 'The tracked hand path shows some interruption through the zone, but it looks correctable.'
                : 'The tracked hand path reads clean with minimal interruption.'
            : hitchFrames >= 5
              ? 'The arm path has a clear pause that likely costs speed and repeatability.'
              : hitchFrames >= 3
                ? 'There is some interruption in the swing path, but it looks correctable.'
                : 'The swing path reads clean with minimal interruption.',
          hitchFrames >= 5 ? 'alert' : hitchFrames >= 3 ? 'warn' : 'good',
        )
      : createAssessment('Hitch Frames', 'Missing', 'Missing data', 'Enter the visible pause frames to score the hand path cleanly.', 'warn'),
    createAssessment(
      'Contact Point',
      formatContactPoint(contactPoint),
      contactPoint === 'ideal' ? 'On time' : 'Timing drift',
      trackingApplied
        ? contactPoint === 'behind'
          ? 'The tracked contact position is reading late. Reach sooner and rotate a touch earlier.'
          : contactPoint === 'in-front'
            ? 'The tracked contact position is drifting too far forward. Hold posture and let the ball arrive.'
            : 'The tracked contact position looks centered for this rep.'
        : contactPoint === 'behind'
          ? 'Contact is late. Reach sooner and rotate a touch earlier.'
          : contactPoint === 'in-front'
            ? 'Contact is drifting too far forward. Hold posture and let the ball arrive.'
            : 'Contact timing looks centered for this rep.',
      contactPoint === 'ideal' ? 'good' : 'warn',
    ),
    createAssessment(
      'Landing Stability',
      formatLandingStability(landingStability),
      landingStability === 'steady' ? 'Controlled' : 'Leaking energy',
      landingStability === 'steady'
        ? 'Landing looks organized, which supports safer repeat reps.'
        : 'Balance is leaking after the hit. Brace through takeoff and finish over the plant.',
      landingStability === 'steady' ? 'good' : 'warn',
    ),
  ];

  return {
    verticalLeapInches: toFixedNumber(verticalLeapInches, 1),
    ballSpeedMph: toFixedNumber(ballSpeedMph, 1),
    peakHandSpeedMph: toFixedNumber(peakHandSpeedMph, 1),
    ballSpeedSource,
    hitchFrames: toFixedNumber(hitchFrames, 0),
    hitchSeverity,
    contactPoint,
    landingStability,
    trackingApplied,
    trackingQuality: toFixedNumber(trackingQuality, 2),
    dominantHand,
    trackedFrames: toFixedNumber(trackedFrames, 0),
    processedFrames: toFixedNumber(processedFrames, 0),
    summary: `Vertical ${toFixedNumber(verticalLeapInches, 1)} in | Ball ${toFixedNumber(ballSpeedMph, 1)} MPH | Hitch ${toFixedNumber(hitchFrames, 0)} frames`,
    advice,
    assessments,
    overlayProfile: {
      handTrail,
      ballTrail,
    },
  };
}
