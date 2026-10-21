# 7 Minute Workout

An Android app for the classic 7-minute high-intensity circuit, built with React Native and Expo (SDK 58). Its features are modelled on the popular *7 Minute Workout* app on Google Play, with a new orange and blue design and original stick-figure animations.

## Features

- **Classic 7-minute circuit**: 13 bodyweight exercises (jumping jacks, wall sit, push-ups, crunches, step-ups, squats, triceps dips, plank, high knees, lunges, push-up & rotation, and a side plank on each side).
- **Workout player**
  - A get-ready countdown, then a circular timer with exercise and rest phases and a progress bar for the circuit.
  - Previous, pause and next controls, with a pause screen that offers resume or quit.
  - Spoken coaching through text-to-speech: the exercise name, "half time", a countdown, and the next exercise during rests.
  - Beeps and vibration. The screen stays on during a workout.
- **Animated exercise figures** drawn in SVG, plus step-by-step instructions and a tip for each exercise.
- **30-day full-body challenge**
  - Built from the classic circuit. Exercise time goes up and rest time goes down each week.
  - The circuit is doubled in weeks 3 and 4 and tripled on the last two days.
  - Days 7, 14, 21 and 28 are rest days. You can mark days done or undone.
- **Custom workouts**: choose and reorder exercises, and set exercise time, rest time and number of circuits.
- **Report**
  - Totals: workouts, minutes, estimated calories and current streak.
  - A month calendar with a dot for each workout. Tapping a day shows its sessions, with time, calories, pauses and how much of the workout was completed.
- **Weight and BMI**: log your weight (kg or lbs), see a trend chart, and get your BMI once your height is set.
- **Daily reminders**: local notifications at a chosen time on chosen weekdays.
- **Settings**: number of circuits, exercise, rest and countdown lengths, sound, voice, units, height, and options to restart the challenge or clear history.

All data stays on the device (AsyncStorage). There is no account, no network use and no Google Fit or Health Connect sync.

## Running it

```bash
npm install
npm start          # then press "a" for an Android emulator, or scan the QR code with Expo Go
```

Every native module used is bundled in Expo Go, so no development build is needed. Local reminder notifications also work in Expo Go.

GitHub Actions can build an installable APK on demand (see below). To build one locally you need the Android SDK: `npx expo run:android --variant release`.

`npm run web` starts a browser preview, which is handy for checking layouts quickly.

## Releasing

GitHub Actions builds the app with Gradle (no Expo account needed):

- Pull requests and pushes to `main` run only the fast checks (typecheck, lint, tests, JS bundle). No Android build runs automatically.
- **Actions → APK → Run workflow** builds an **APK** for manual install on phones (arm64 and 32-bit ARM, not x86 emulators) from any branch; download it from the run's artifacts. It never runs automatically, and nothing goes to Google Play.
- Tags `v1.2` or `v1.2.3` build a signed AAB and publish it to the Google Play **production** track.
- **Actions → Release → Run workflow** builds a signed AAB from any branch as a downloadable artifact, without publishing it.

For the one-time Play Console, signing key and secrets setup, see [docs/RELEASING.md](docs/RELEASING.md).

`package.json` excludes `react-native-reanimated`, `react-native-gesture-handler` and `react-native-worklets` from native autolinking. npm installs them only because expo-router's Drawer navigator needs them; the app doesn't use them, and compiling their C++ made every Android build much slower. If you add something that needs them (Reanimated animations, a drawer, gesture-based components), remove them from `expo.autolinking.exclude`.

## Checks

```bash
npm run typecheck
npm run lint
npm test
```

## Project layout

```
src/
  app/                 Expo Router screens
    (tabs)/            Workouts, Report and Settings tabs
    player/[id].tsx    Workout player
    workout/[id].tsx   Workout details
    exercise/[id].tsx  Exercise instructions
    challenge.tsx      30-day challenge plan
    custom/[id].tsx    Custom workout editor
    complete.tsx       Post-workout summary
    weight.tsx         Weight log
  components/          Stick-figure animation, weight chart, shared UI
  data/                Exercises, animation keyframes, challenge plan
  lib/                 Timer engine, player hook, voice/sound coach, reminders, units and dates
  state/               Persisted app store and types
plugins/               Expo config plugin for release signing
.github/workflows/     CI checks, APK builds and Play Store release
```

The timer engine (`src/lib/engine.ts`) is a set of pure functions. It turns a workout plan into a timeline of ready, work and rest phases, works out where the skip buttons go, and decides which voice cues to fire. `usePlayer` runs that timeline against wall-clock deadlines, so the timer stays accurate even when JS timers are throttled.

Calories are a rough estimate: each exercise's MET value × your latest logged weight (70 kg if none) × time spent.

## Disclaimer

This app is for general fitness. Check with a doctor before starting a new exercise programme.
