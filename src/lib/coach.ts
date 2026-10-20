import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

import type { Cue } from './engine';

let tick: AudioPlayer | null = null;
let go: AudioPlayer | null = null;
let audioReady = false;

function ensureAudio() {
  if (audioReady) return;
  audioReady = true;
  setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers' }).catch(() => {});
  tick = createAudioPlayer(require('../../assets/sounds/tick.wav'));
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
      ensureAudio();
      play(cue.final ? go : tick);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(
          cue.final ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light,
        ).catch(() => {});
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
  tick?.remove();
  go?.remove();
  tick = null;
  go = null;
  audioReady = false;
}
