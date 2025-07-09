import { numberWords } from './constants';

export function numberToWords(n: number): string {
  if (n >= 0 && n <= 60) return numberWords[n];
  return n.toString();
}

export function formatTimeInWords(minutes: number, seconds: number): string {
  if (minutes >= 1) {
    const displayMinutes = seconds > 30 ? minutes + 1 : minutes;
    
    if (displayMinutes > 1) {
      return `${displayMinutes} minutes left.`;
    } else {
      return `~1 minute left!`;
    }
  }
  
  if (minutes === 0) {
    if (seconds > 0) {
      if (seconds < 10) {
        return `${seconds}`;
      } else {
        return `${seconds} seconds left.`;
      }
    } else {
      return '---';
    }
  }
  
  return '---';
} 