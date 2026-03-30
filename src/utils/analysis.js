const FEET_PER_MPH_SECOND = 1.46667;

function toNumber(value) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toFixedNumber(value, digits) {
  return Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;
}

export function runVideoAnalysis(input) {
  const standingReachInches = toNumber(input.standingReachInches);
  const contactReachInches = toNumber(input.contactReachInches);
  const ballTravelFeet = toNumber(input.ballTravelFeet);
  const releaseFrames = toNumber(input.releaseFrames);
  const fps = toNumber(input.fps);
  const hitchFrames = toNumber(input.hitchFrames);
  const contactPoint = input.contactPoint || 'ideal';
  const landingStability = input.landingStability || 'steady';

  const verticalLeapInches = Math.max(0, contactReachInches - standingReachInches);
  const timeSeconds = fps > 0 ? releaseFrames / fps : 0;
  const feetPerSecond = timeSeconds > 0 ? ballTravelFeet / timeSeconds : 0;
  const ballSpeedMph = feetPerSecond > 0 ? feetPerSecond / FEET_PER_MPH_SECOND : 0;

  let hitchSeverity = 'Low';
  if (hitchFrames >= 5) {
    hitchSeverity = 'High';
  } else if (hitchFrames >= 3) {
    hitchSeverity = 'Moderate';
  }

  const advice = [];

  if (hitchFrames >= 3) {
    advice.push({
      title: 'Smooth the arm path',
      body: 'The swing shows a visible pause before or through contact. Focus on one continuous acceleration from load to ball.',
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

  if (ballSpeedMph < 35) {
    advice.push({
      title: 'Transfer force through the ball',
      body: 'Ball speed looks modest for this rep. Try matching approach speed with a cleaner arm whip and stronger finish.',
    });
  }

  if (advice.length === 0) {
    advice.push({
      title: 'Keep stacking good reps',
      body: 'This session looks clean overall. Stay on the same contact timing and keep building repeatability.',
    });
  }

  const handTrail = contactPoint === 'behind'
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

  return {
    verticalLeapInches: toFixedNumber(verticalLeapInches, 1),
    ballSpeedMph: toFixedNumber(ballSpeedMph, 1),
    hitchFrames: toFixedNumber(hitchFrames, 0),
    hitchSeverity,
    contactPoint,
    landingStability,
    summary: `Vertical ${toFixedNumber(verticalLeapInches, 1)} in | Ball ${toFixedNumber(ballSpeedMph, 1)} MPH | Hitch ${toFixedNumber(hitchFrames, 0)} frames`,
    advice,
    overlayProfile: {
      handTrail,
      ballTrail,
    },
  };
}