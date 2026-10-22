import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

import type { Cue } from './engine';

let go: AudioPlayer | null = null;

// Loads the start beep ahead of time so its first play doesn't stall the
// voice cue spoken right after it.
export function prepareAudio() {
  if (go) return;
  setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers' }).catch(() => {});
  go = createAudioPlayer(require('../../assets/sounds/go.wav'));
}

function play(player: AudioPlayer | null) {
  if (!player) return;
  player
    .seekTo(0)
    .then(() => player.play())
    .catch(() => {});
}

export type CoachOptions = { sound: boolean; voice: boolean };

export function say(text: string) {
  Speech.stop();
  Speech.speak(text, { language: 'en-US', rate: 1.0 });
}

export function runCues(cues: Cue[], options: CoachOptions) {
  for (const cue of cues) {
    if (cue.type === 'beep') {
      if (!options.sound) continue;
      prepareAudio();
      play(go);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      }
    } else if (options.voice) {
      say(cue.text);
    }
  }
}

export function silence() {
  Speech.stop();
}

export function releaseAudio() {
  go?.remove();
  go = null;
}
