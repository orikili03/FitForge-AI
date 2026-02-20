import { useRef, useCallback } from 'react';
import type { TimerPhase } from './timerTypes';

export function useAudioFeedback() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext | null => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      if (audioCtxRef.current.state === 'suspended') {
        void audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }, []);

  const beep = useCallback(
    (frequency = 880, duration = 0.15, volume = 0.25) => {
      const ctx = getCtx();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration + 0.05);
      } catch {
        // Web Audio unavailable in this environment
      }
    },
    [getCtx],
  );

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.1;
      u.volume = 0.8;
      window.speechSynthesis.speak(u);
    } catch {
      // SpeechSynthesis unavailable
    }
  }, []);

  /** Beep on work/rest interval transitions — distinct tones, clearly audible */
  const onPhaseChange = useCallback(
    (phase: TimerPhase, round: number, totalRounds: number) => {
      if (phase === 'WORK') {
        beep(880, 0.22, 0.35);
        setTimeout(() => beep(880, 0.12, 0.2), 120);
        setTimeout(
          () => speak(totalRounds > 0 ? `Round ${round}. Work!` : 'Work!'),
          180,
        );
      } else {
        beep(440, 0.25, 0.35);
        setTimeout(() => speak('Rest!'), 150);
      }
    },
    [beep, speak],
  );

  const onComplete = useCallback(() => {
    beep(660, 0.35);
    setTimeout(() => beep(880, 0.45), 180);
    setTimeout(() => speak('Workout complete!'), 350);
  }, [beep, speak]);

  /** Countdown tick — pass 0 for "GO!" */
  const onCountdownTick = useCallback(
    (num: number) => {
      if (num === 0) {
        beep(1100, 0.3, 0.35);
      } else {
        beep(660, 0.1, 0.2);
      }
    },
    [beep],
  );

  return { beep, speak, onPhaseChange, onComplete, onCountdownTick };
}
