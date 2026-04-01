# Jolley Volley

Jolley Volley is a standalone React Native volleyball app framework focused on:

- coach-friendly score and possession tracking
- popular volleyball stat logging
- player recording, playback, and motion review
- AI/ML-ready swing and jump analysis workflows

## Current scaffold

- bare React Native Android app structure for standalone device testing
- neon hot-pink branded home screen with fixed top icon and fading logo
- motion lab section for recording, playback trail ideas, vertical leap, ball speed, and correction cues
- coach scorecard section for score, possession, and stat tracking

## Local start

```bash
npm install
npm run start
npm run android
```

## Clone This Framework For Another Sport

Use the scaffold command to clone this app into a new sport-branded project while preserving the same shell, local persistence, Motion Lab flow, profiles, and logging structure.

GreenSense golf example in your shared `SportsSense` folder:

```bash
npm run scaffold:sport -- -TargetDir "C:\Projects\SportsSense\GreenSense" -AppName GreenSense -DisplayName "Green Sense" -Sport golf -AndroidPackage com.matthewelijahlogan.greensense
```

More examples:

```bash
npm run scaffold:sport -- -TargetDir "C:\Projects\SportsSense\PitchSense" -AppName PitchSense -DisplayName "Pitch Sense" -Sport baseball -AndroidPackage com.matthewelijahlogan.pitchsense
npm run scaffold:sport -- -TargetDir "C:\Projects\SportsSense\BoxSense" -AppName BoxSense -DisplayName "Box Sense" -Sport boxing -AndroidPackage com.matthewelijahlogan.boxsense
```

What the command does:

- copies this repo into a new project folder
- renames the app display name, component name, package id, and sport wording
- keeps the same React Native Android shell, Motion Lab flow, profiles, and local logging structure

What you still customize after scaffolding:

- sport-specific analysis rules and metrics
- sport-specific advice/correction language
- whether the scoreboard flow stays, changes, or gets removed for that sport

Note:

- the target directory needs to be outside this repo so the scaffold does not copy into itself
