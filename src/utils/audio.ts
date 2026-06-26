// Web Audio API Sound Synthesizer for CSS Academy (Duolingo Style)
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export const playSound = (type: "success" | "failure" | "heart_lost" | "achievement" | "click") => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    switch (type) {
      case "click": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case "success": {
        // Arpeggio sound: C4 -> E4 -> G4 -> C5
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0.12, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.3);
        });
        break;
      }
      case "failure": {
        // Sad buzzing sound: C3 -> G#2
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = "sawtooth";
        osc2.type = "sawtooth";
        
        osc1.frequency.setValueAtTime(130.81, now); // C3
        osc1.frequency.linearRampToValueAtTime(103.83, now + 0.35); // G#2
        
        osc2.frequency.setValueAtTime(132.81, now); // slightly detuned for chorus
        osc2.frequency.linearRampToValueAtTime(105.83, now + 0.35);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.35);
        osc2.stop(now + 0.35);
        break;
      }
      case "heart_lost": {
        // Downward beep sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(330, now); // E4
        osc.frequency.linearRampToValueAtTime(220, now + 0.25); // A3
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case "achievement": {
        // Fanfare sound
        const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 523.25];
        const timing = [0, 0.1, 0.2, 0.3, 0.45, 0.6];
        const duration = [0.15, 0.15, 0.15, 0.2, 0.15, 0.5];

        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(freq, now + timing[i]);
          gain.gain.setValueAtTime(0.08, now + timing[i]);
          gain.gain.exponentialRampToValueAtTime(0.01, now + timing[i] + duration[i]);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + timing[i]);
          osc.stop(now + timing[i] + duration[i]);
        });
        break;
      }
    }
  } catch (e) {
    console.warn("Audio synthesis was blocked or is not supported in this browser environment.", e);
  }
};
