import { useRef, useEffect } from 'react';

export function useAudioEngine(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (enabled) {
      if (!ctxRef.current) {
        ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      // Create a low drone oscillator
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 55; // Low hum
      
      const gain = ctx.createGain();
      gain.gain.value = 0.02; // very quiet

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      // Random telemetry beeps
      const interval = setInterval(() => {
        if (Math.random() > 0.6 && ctx.state === 'running') {
          const beepOsc = ctx.createOscillator();
          const beepGain = ctx.createGain();
          beepOsc.type = 'sine';
          beepOsc.frequency.value = 1000 + Math.random() * 500;
          
          beepGain.gain.setValueAtTime(0, ctx.currentTime);
          beepGain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.02);
          beepGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          
          beepOsc.connect(beepGain);
          beepGain.connect(ctx.destination);
          
          beepOsc.start();
          beepOsc.stop(ctx.currentTime + 0.2);
        }
      }, 1500);

      return () => {
        osc.stop();
        osc.disconnect();
        clearInterval(interval);
      };
    } else {
      if (ctxRef.current && ctxRef.current.state === 'running') {
        ctxRef.current.suspend();
      }
    }
  }, [enabled]);
}
