import {MenuHub} from '../components/MenuHub';
import {motionLabSections} from '../data/dashboard';

export function MotionLabMenuScreen({onGoHome, onOpenScreen}) {
  return (
    <MenuHub
      introCopy="Open the recorder, playback, feedback, or metrics from here so the analysis tools stay grouped together."
      introTitle="Motion Lab"
      items={motionLabSections}
      onGoHome={onGoHome}
      onOpenScreen={onOpenScreen}
    />
  );
}
