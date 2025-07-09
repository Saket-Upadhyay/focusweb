export const DEFAULT_MINUTES = 5;
export const COUNTDOWN_THRESHOLD = 10;
export const FLUSH_DURATION = 600;
export const TIMER_INTERVAL = 1000;

export const TOTAL_CHIMES = 3;
export const CHIME_INTERVAL = 2000;

export const numberWords = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
  'twenty-one', 'twenty-two', 'twenty-three', 'twenty-four', 'twenty-five', 'twenty-six', 'twenty-seven', 'twenty-eight', 'twenty-nine', 'thirty',
  'thirty-one', 'thirty-two', 'thirty-three', 'thirty-four', 'thirty-five', 'thirty-six', 'thirty-seven', 'thirty-eight', 'thirty-nine', 'forty',
  'forty-one', 'forty-two', 'forty-three', 'forty-four', 'forty-five', 'forty-six', 'forty-seven', 'forty-eight', 'forty-nine', 'fifty',
  'fifty-one', 'fifty-two', 'fifty-three', 'fifty-four', 'fifty-five', 'fifty-six', 'fifty-seven', 'fifty-eight', 'fifty-nine', 'sixty'
];

export const bassFrequencies = [
  { freq: 65.41, time: 0, slide: 0.5 },
  { freq: 82.41, time: 1.0, slide: 0.4 },
  { freq: 65.41, time: 2.0, slide: 0.5 },
  { freq: 98.00, time: 3.0, slide: 0.3 },
  { freq: 65.41, time: 4.0, slide: 0.5 },
  { freq: 82.41, time: 5.0, slide: 0.4 },
  { freq: 65.41, time: 6.0, slide: 0.5 },
  { freq: 98.00, time: 7.0, slide: 0.3 },
  { freq: 65.41, time: 8.0, slide: 0.5 },
  { freq: 82.41, time: 9.0, slide: 0.4 },
  { freq: 87.31, time: 10.0, slide: 0.5 },
  { freq: 110.00, time: 11.0, slide: 0.4 },
  { freq: 87.31, time: 12.0, slide: 0.5 },
  { freq: 130.81, time: 13.0, slide: 0.3 },
  { freq: 87.31, time: 14.0, slide: 0.5 },
  { freq: 110.00, time: 15.0, slide: 0.4 },
  { freq: 87.31, time: 16.0, slide: 0.5 },
  { freq: 130.81, time: 17.0, slide: 0.3 },
  { freq: 87.31, time: 18.0, slide: 0.5 },
  { freq: 110.00, time: 19.0, slide: 0.4 }
];

export const hiHatPattern = [
  { time: 0, vel: 0.6, type: 'closed' },
  { time: 0.5, vel: 0.4, type: 'closed' },
  { time: 1.0, vel: 0.6, type: 'closed' },
  { time: 1.5, vel: 0.4, type: 'closed' },
  { time: 2.0, vel: 0.6, type: 'closed' },
  { time: 2.5, vel: 0.4, type: 'closed' },
  { time: 3.0, vel: 0.6, type: 'closed' },
  { time: 3.5, vel: 0.4, type: 'closed' },
  { time: 4.0, vel: 0.6, type: 'closed' },
  { time: 4.5, vel: 0.4, type: 'closed' },
  { time: 5.0, vel: 0.6, type: 'closed' },
  { time: 5.5, vel: 0.4, type: 'closed' },
  { time: 6.0, vel: 0.6, type: 'closed' },
  { time: 6.5, vel: 0.4, type: 'closed' },
  { time: 7.0, vel: 0.6, type: 'closed' },
  { time: 7.5, vel: 0.4, type: 'closed' },
  { time: 8.0, vel: 0.6, type: 'closed' },
  { time: 8.5, vel: 0.4, type: 'closed' },
  { time: 9.0, vel: 0.6, type: 'closed' },
  { time: 9.5, vel: 0.4, type: 'closed' },
  { time: 10.0, vel: 0.6, type: 'closed' },
  { time: 10.5, vel: 0.4, type: 'closed' },
  { time: 11.0, vel: 0.6, type: 'closed' },
  { time: 11.5, vel: 0.4, type: 'closed' },
  { time: 12.0, vel: 0.6, type: 'closed' },
  { time: 12.5, vel: 0.4, type: 'closed' },
  { time: 13.0, vel: 0.6, type: 'closed' },
  { time: 13.5, vel: 0.4, type: 'closed' },
  { time: 14.0, vel: 0.6, type: 'closed' },
  { time: 14.5, vel: 0.4, type: 'closed' },
  { time: 15.0, vel: 0.6, type: 'closed' },
  { time: 15.5, vel: 0.4, type: 'closed' },
  { time: 16.0, vel: 0.6, type: 'closed' },
  { time: 16.5, vel: 0.4, type: 'closed' },
  { time: 17.0, vel: 0.6, type: 'closed' },
  { time: 17.5, vel: 0.4, type: 'closed' },
  { time: 18.0, vel: 0.6, type: 'closed' },
  { time: 18.5, vel: 0.4, type: 'closed' },
  { time: 19.0, vel: 0.6, type: 'closed' },
  { time: 19.5, vel: 0.4, type: 'closed' }
];

export const snareTimes = [1.0, 3.0, 5.0, 7.0, 9.0, 11.0, 13.0, 15.0, 17.0, 19.0];

export const kickPattern = [
  { time: 0, vel: 0.8 },
  { time: 2.0, vel: 0.7 },
  { time: 4.0, vel: 0.8 },
  { time: 6.0, vel: 0.7 },
  { time: 8.0, vel: 0.8 },
  { time: 10.0, vel: 0.7 },
  { time: 12.0, vel: 0.8 },
  { time: 14.0, vel: 0.7 },
  { time: 16.0, vel: 0.8 },
  { time: 18.0, vel: 0.7 }
];

export const clapTimes = [1.5, 3.5, 5.5, 7.5, 9.5, 11.5, 13.5, 15.5, 17.5, 19.5];

export const classicalProgression = [
  { time: 0, chord: [
    { freq: 146.83, type: 'sine', gain: 0.25, voice: 'bass' },
    { freq: 293.66, type: 'sine', gain: 0.22, voice: 'tenor' },
    { freq: 349.23, type: 'sine', gain: 0.20, voice: 'alto' },
    { freq: 440.00, type: 'triangle', gain: 0.18, voice: 'soprano' }
  ]},
  { time: 2.5, chord: [
    { freq: 110.00, type: 'sine', gain: 0.25, voice: 'bass' },
    { freq: 220.00, type: 'sine', gain: 0.22, voice: 'tenor' },
    { freq: 261.63, type: 'sine', gain: 0.20, voice: 'alto' },
    { freq: 329.63, type: 'triangle', gain: 0.18, voice: 'soprano' }
  ]},
  { time: 5, chord: [
    { freq: 98.00, type: 'sine', gain: 0.25, voice: 'bass' },
    { freq: 196.00, type: 'sine', gain: 0.22, voice: 'tenor' },
    { freq: 246.94, type: 'sine', gain: 0.20, voice: 'alto' },
    { freq: 329.63, type: 'triangle', gain: 0.18, voice: 'soprano' }
  ]},
  { time: 7.5, chord: [
    { freq: 146.83, type: 'sine', gain: 0.25, voice: 'bass' },
    { freq: 293.66, type: 'sine', gain: 0.22, voice: 'tenor' },
    { freq: 349.23, type: 'sine', gain: 0.20, voice: 'alto' },
    { freq: 440.00, type: 'triangle', gain: 0.18, voice: 'soprano' }
  ]},
  { time: 10, chord: [
    { freq: 174.61, type: 'sine', gain: 0.25, voice: 'bass' },
    { freq: 349.23, type: 'sine', gain: 0.22, voice: 'tenor' },
    { freq: 440.00, type: 'sine', gain: 0.20, voice: 'alto' },
    { freq: 523.25, type: 'triangle', gain: 0.18, voice: 'soprano' }
  ]},
  { time: 12.5, chord: [
    { freq: 110.00, type: 'sine', gain: 0.25, voice: 'bass' },
    { freq: 220.00, type: 'sine', gain: 0.22, voice: 'tenor' },
    { freq: 261.63, type: 'sine', gain: 0.20, voice: 'alto' },
    { freq: 329.63, type: 'triangle', gain: 0.18, voice: 'soprano' }
  ]},
  { time: 15, chord: [
    { freq: 98.00, type: 'sine', gain: 0.25, voice: 'bass' },
    { freq: 196.00, type: 'sine', gain: 0.22, voice: 'tenor' },
    { freq: 246.94, type: 'sine', gain: 0.20, voice: 'alto' },
    { freq: 329.63, type: 'triangle', gain: 0.18, voice: 'soprano' }
  ]},
  { time: 17.5, chord: [
    { freq: 146.83, type: 'sine', gain: 0.25, voice: 'bass' },
    { freq: 293.66, type: 'sine', gain: 0.22, voice: 'tenor' },
    { freq: 349.23, type: 'sine', gain: 0.20, voice: 'alto' },
    { freq: 440.00, type: 'triangle', gain: 0.18, voice: 'soprano' }
  ]}
];

export const stringVoices = [
  { freq: 293.66, type: 'sine', gain: 0.15, voice: 'violin1' },
  { freq: 220.00, type: 'sine', gain: 0.18, voice: 'violin2' },
  { freq: 146.83, type: 'sine', gain: 0.20, voice: 'viola' },
  { freq: 110.00, type: 'sine', gain: 0.22, voice: 'cello' }
];

export const woodwindMelody = [
  { freq: 440.00, time: 0.5, duration: 1.0 },
  { freq: 493.88, time: 1.5, duration: 0.5 },
  { freq: 523.25, time: 2.0, duration: 1.0 },
  { freq: 493.88, time: 3.0, duration: 0.5 },
  { freq: 440.00, time: 3.5, duration: 1.0 },
  { freq: 392.00, time: 5.5, duration: 0.5 },
  { freq: 440.00, time: 6.0, duration: 1.0 },
  { freq: 493.88, time: 7.0, duration: 0.5 },
  { freq: 523.25, time: 7.5, duration: 1.0 },
  { freq: 587.33, time: 8.5, duration: 0.5 },
  { freq: 523.25, time: 9.0, duration: 1.0 },
  { freq: 493.88, time: 10.5, duration: 0.5 },
  { freq: 440.00, time: 11.0, duration: 1.0 },
  { freq: 392.00, time: 12.0, duration: 0.5 },
  { freq: 349.23, time: 12.5, duration: 1.0 },
  { freq: 392.00, time: 13.5, duration: 0.5 },
  { freq: 440.00, time: 14.0, duration: 1.0 },
  { freq: 493.88, time: 15.5, duration: 0.5 },
  { freq: 523.25, time: 16.0, duration: 1.0 },
  { freq: 587.33, time: 17.0, duration: 0.5 },
  { freq: 659.25, time: 17.5, duration: 1.0 },
  { freq: 587.33, time: 18.5, duration: 0.5 },
  { freq: 523.25, time: 19.0, duration: 1.0 },
  { freq: 493.88, time: 19.5, duration: 0.5 }
]; 