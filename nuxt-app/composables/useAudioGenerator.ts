import { ref } from 'vue';
import { 
  TOTAL_CHIMES, 
  CHIME_INTERVAL,
  bassFrequencies,
  hiHatPattern,
  snareTimes,
  kickPattern,
  clapTimes,
  classicalProgression,
  stringVoices,
  woodwindMelody
} from '~/utils/constants';

export function useAudioGenerator() {
  let audioContext: AudioContext | null = null;
  let hasPlayedChime = ref<boolean>(false);
  let chimePlaying = ref<boolean>(false);
  let chimeSequenceCount = 0;

  function create808Bass(audioContext: AudioContext, masterGain: GainNode, freq: number, startTime: number, slideIntensity: number = 1.0): void {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const distortion = audioContext.createWaveShaper();
    const filter = audioContext.createBiquadFilter();
    const compressor = audioContext.createDynamicsCompressor();
    
    oscillator.connect(gainNode);
    gainNode.connect(distortion);
    distortion.connect(filter);
    filter.connect(compressor);
    compressor.connect(masterGain);
    
    oscillator.frequency.setValueAtTime(freq, startTime);
    
    const pitchDecayTime = 1.2;
    const pitchDecayAmount = freq * 0.2 * slideIntensity;
    oscillator.frequency.exponentialRampToValueAtTime(freq - pitchDecayAmount, startTime + pitchDecayTime);
    
    const attackTime = 0.1;
    const decayTime = 4.0;
    const sustainLevel = 0.5;
    const releaseTime = 3.0;
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + attackTime);
    gainNode.gain.exponentialRampToValueAtTime(sustainLevel, startTime + attackTime + decayTime);
    gainNode.gain.setValueAtTime(sustainLevel, startTime + 20 - releaseTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 20);
    
    const curve = new Float32Array(44100);
    for (let i = 0; i < 44100; i++) {
      curve[i] = Math.tanh(i / 44100 * 2 - 1) * 0.3;
    }
    distortion.curve = curve;
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, startTime);
    filter.Q.setValueAtTime(1, startTime);
    
    compressor.threshold.setValueAtTime(-15, startTime);
    compressor.knee.setValueAtTime(30, startTime);
    compressor.ratio.setValueAtTime(2, startTime);
    compressor.attack.setValueAtTime(0.05, startTime);
    compressor.release.setValueAtTime(0.2, startTime);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 20);
  }

  function createHiHat(audioContext: AudioContext, masterGain: GainNode, startTime: number, velocity: number = 1.0, type: 'open' | 'closed' = 'closed'): void {
    const bufferSize = audioContext.sampleRate * (type === 'open' ? 0.4 : 0.08);
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const decay = type === 'open' ? 0.5 : 0.2;
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * decay)) * 0.7;
    }
    
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(filter);
    filter.connect(masterGain);
    
    const attackTime = 0.02;
    const decayTime = type === 'open' ? 0.3 : 0.1;
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.08 * velocity, startTime + attackTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + attackTime + decayTime);
    
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(8000, startTime);
    filter.Q.setValueAtTime(1, startTime);
    
    source.start(startTime);
    source.stop(startTime + decayTime);
  }

  function createSnare(audioContext: AudioContext, masterGain: GainNode, startTime: number, velocity: number = 1.0): void {
    const bufferSize = audioContext.sampleRate * 0.4;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const noise = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.08)) * 0.5;
      const pitch = Math.sin(i * 0.1) * Math.exp(-i / (bufferSize * 0.15)) * 0.3;
      const clap = Math.sin(i * 0.2) * Math.exp(-i / (bufferSize * 0.05)) * 0.2;
      output[i] = (noise + pitch + clap) * 0.4;
    }
    
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    const compressor = audioContext.createDynamicsCompressor();
    
    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(filter);
    filter.connect(compressor);
    compressor.connect(masterGain);
    
    const attackTime = 0.02;
    const decayTime = 0.6;
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.15 * velocity, startTime + attackTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + attackTime + decayTime);
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(700, startTime);
    filter.Q.setValueAtTime(2, startTime);
    
    compressor.threshold.setValueAtTime(-10, startTime);
    compressor.knee.setValueAtTime(40, startTime);
    compressor.ratio.setValueAtTime(2, startTime);
    compressor.attack.setValueAtTime(0.02, startTime);
    compressor.release.setValueAtTime(0.1, startTime);
    
    source.start(startTime);
    source.stop(startTime + decayTime);
  }

  function createAtmosphericPad(audioContext: AudioContext, masterGain: GainNode, now: number, duration: number): void {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    const delay = audioContext.createDelay();
    const delayGain = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(filter);
    filter.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(masterGain);
    
    oscillator.frequency.setValueAtTime(110.00, now);
    oscillator.type = 'sine';
    
    const attackTime = 2.0;
    const decayTime = 5.0;
    const sustainLevel = 0.3;
    const releaseTime = 4.0;
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.03, now + attackTime);
    gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
    gainNode.gain.setValueAtTime(sustainLevel, now + duration - releaseTime);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, now);
    filter.Q.setValueAtTime(1, now);
    
    delay.delayTime.setValueAtTime(0.6, now);
    delayGain.gain.setValueAtTime(0.3, now);
    delayGain.gain.linearRampToValueAtTime(0, now + duration);
    
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  function createKick(audioContext: AudioContext, masterGain: GainNode, startTime: number, velocity: number = 1.0): void {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    const compressor = audioContext.createDynamicsCompressor();
    
    oscillator.connect(gainNode);
    gainNode.connect(filter);
    filter.connect(compressor);
    compressor.connect(masterGain);
    
    oscillator.frequency.setValueAtTime(60, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(40, startTime + 0.2);
    oscillator.type = 'sine';
    
    const attackTime = 0.02;
    const decayTime = 0.4;
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.25 * velocity, startTime + attackTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + attackTime + decayTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, startTime);
    filter.Q.setValueAtTime(1, startTime);
    
    compressor.threshold.setValueAtTime(-5, startTime);
    compressor.knee.setValueAtTime(30, startTime);
    compressor.ratio.setValueAtTime(3, startTime);
    compressor.attack.setValueAtTime(0.005, startTime);
    compressor.release.setValueAtTime(0.05, startTime);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + decayTime);
  }

  function createClap(audioContext: AudioContext, masterGain: GainNode, startTime: number): void {
    const bufferSize = audioContext.sampleRate * 0.15;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const clap = Math.sin(i * 0.3) * Math.exp(-i / (bufferSize * 0.02)) * 0.5;
      output[i] = clap * 0.4;
    }
    
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(filter);
    filter.connect(masterGain);
    
    const attackTime = 0.005;
    const decayTime = 0.2;
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.12, startTime + attackTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + attackTime + decayTime);
    
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1500, startTime);
    filter.Q.setValueAtTime(1.5, startTime);
    
    source.start(startTime);
    source.stop(startTime + decayTime);
  }

  function createClassicalMelody(audioContext: AudioContext, masterGain: GainNode, now: number): void {
    classicalProgression.forEach(({ time, chord }) => {
      chord.forEach(({ freq, type, gain, voice }) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        const delay = audioContext.createDelay();
        const delayGain = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(filter);
        filter.connect(delay);
        delay.connect(delayGain);
        delayGain.connect(masterGain);
        
        oscillator.frequency.setValueAtTime(freq, now + time);
        oscillator.type = type as OscillatorType;
        
        const attackTime = 0.6;
        const decayTime = 1.2;
        const sustainLevel = 0.8;
        const releaseTime = 1.0;
        
        gainNode.gain.setValueAtTime(0, now + time);
        gainNode.gain.linearRampToValueAtTime(gain, now + time + attackTime);
        gainNode.gain.linearRampToValueAtTime(gain * sustainLevel, now + time + attackTime + decayTime);
        gainNode.gain.setValueAtTime(gain * sustainLevel, now + time + 2.5 - releaseTime);
        gainNode.gain.linearRampToValueAtTime(0, now + time + 2.5);
        
        const vibrato = audioContext.createOscillator();
        const vibratoGain = audioContext.createGain();
        vibrato.connect(vibratoGain);
        vibratoGain.connect(oscillator.frequency);
        vibrato.frequency.setValueAtTime(5.5, now + time);
        vibratoGain.gain.setValueAtTime(freq * 0.003, now + time);
        vibrato.start(now + time);
        vibrato.stop(now + time + 2.5);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2500, now + time);
        filter.Q.setValueAtTime(1.2, now + time);
        
        delay.delayTime.setValueAtTime(0.5, now + time);
        delayGain.gain.setValueAtTime(0.25, now + time);
        delayGain.gain.linearRampToValueAtTime(0, now + time + 2.5);
        
        oscillator.start(now + time);
        oscillator.stop(now + time + 2.5);
      });
    });
  }

  function createStringSection(audioContext: AudioContext, masterGain: GainNode, now: number, duration: number): void {
    stringVoices.forEach(({ freq, type, gain, voice }) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      const delay = audioContext.createDelay();
      const delayGain = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(filter);
      filter.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(masterGain);
      
      oscillator.frequency.setValueAtTime(freq, now);
      oscillator.type = type as OscillatorType;
      
      const attackTime = 1.5;
      const decayTime = 2.5;
      const sustainLevel = 0.9;
      const releaseTime = 2.0;
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(gain, now + attackTime);
      gainNode.gain.linearRampToValueAtTime(gain * sustainLevel, now + attackTime + decayTime);
      gainNode.gain.setValueAtTime(gain * sustainLevel, now + duration - releaseTime);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);
      
      const vibrato = audioContext.createOscillator();
      const vibratoGain = audioContext.createGain();
      vibrato.connect(vibratoGain);
      vibratoGain.connect(oscillator.frequency);
      vibrato.frequency.setValueAtTime(6.0, now);
      vibratoGain.gain.setValueAtTime(freq * 0.004, now);
      vibrato.start(now);
      vibrato.stop(now + duration);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.Q.setValueAtTime(1, now);
      
      delay.delayTime.setValueAtTime(0.7, now);
      delayGain.gain.setValueAtTime(0.2, now);
      delayGain.gain.linearRampToValueAtTime(0, now + duration);
      
      oscillator.start(now);
      oscillator.stop(now + duration);
    });
  }

  function createWoodwindMelody(audioContext: AudioContext, masterGain: GainNode, now: number): void {
    woodwindMelody.forEach(({ freq, time, duration: noteDuration }) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      oscillator.connect(gainNode);
      gainNode.connect(filter);
      filter.connect(masterGain);
      
      oscillator.frequency.setValueAtTime(freq, now + time);
      oscillator.type = 'triangle';
      
      const attackTime = 0.08;
      const decayTime = 0.4;
      const sustainLevel = 0.7;
      const releaseTime = 0.5;
      
      gainNode.gain.setValueAtTime(0, now + time);
      gainNode.gain.linearRampToValueAtTime(0.12, now + time + attackTime);
      gainNode.gain.linearRampToValueAtTime(sustainLevel * 0.12, now + time + attackTime + decayTime);
      gainNode.gain.setValueAtTime(sustainLevel * 0.12, now + time + noteDuration - releaseTime);
      gainNode.gain.linearRampToValueAtTime(0, now + time + noteDuration);
      
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, now + time);
      filter.Q.setValueAtTime(2.5, now + time);
      
      oscillator.start(now + time);
      oscillator.stop(now + time + noteDuration);
    });
  }

  function playChime(isTest: boolean = false, chimeEnabled: boolean): void {
    if (!chimeEnabled) return;
    
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    const duration = 20.0;
    const now = audioContext.currentTime;
    const bpm = 135;
    const beatDuration = 60 / bpm;
    
    const masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.6, now + 0.5);
    masterGain.gain.setValueAtTime(0.6, now + duration - 0.8);
    masterGain.gain.linearRampToValueAtTime(0, now + duration);
    
    bassFrequencies.forEach(({ freq, time, slide }) => {
      create808Bass(audioContext!, masterGain, freq, now + time, slide);
    });
    
    hiHatPattern.forEach(({ time, vel, type }) => {
      createHiHat(audioContext!, masterGain, now + time, vel, type as 'open' | 'closed');
    });
    
    snareTimes.forEach(time => {
      createSnare(audioContext!, masterGain, now + time, 0.8);
    });
    
    createAtmosphericPad(audioContext!, masterGain, now, duration);
    
    kickPattern.forEach(({ time, vel }) => {
      createKick(audioContext!, masterGain, now + time, vel);
    });
    
    clapTimes.forEach(time => {
      createClap(audioContext!, masterGain, now + time);
    });
    
    createClassicalMelody(audioContext!, masterGain, now);
    createStringSection(audioContext!, masterGain, now, duration);
    createWoodwindMelody(audioContext!, masterGain, now);
    
    chimePlaying.value = true;
    setTimeout(() => {
      chimePlaying.value = false;
    }, duration * 1000);
    
    if (!isTest) {
      chimeSequenceCount++;
      if (chimeSequenceCount < TOTAL_CHIMES) {
        setTimeout(() => {
          playChime(false, chimeEnabled);
        }, CHIME_INTERVAL);
      } else {
        chimeSequenceCount = 0;
        hasPlayedChime.value = true;
      }
    }
  }

  function testChime(chimeEnabled: boolean): void {
    if (chimeEnabled) {
      playChime(true, chimeEnabled);
    }
  }

  function resetChimeState(): void {
    hasPlayedChime.value = false;
    chimeSequenceCount = 0;
  }

  return {
    hasPlayedChime,
    chimePlaying,
    playChime,
    testChime,
    resetChimeState
  };
} 