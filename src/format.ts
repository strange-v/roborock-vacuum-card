export function formatTime(seconds: number): string {
    if (seconds === 0) return '0s';
  
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
  
    const hoursString = hours > 0 ? `${hours}h ` : '';
    const minutesString = minutes > 0 ? `${minutes}min` : '';
  
    return hoursString + minutesString.trim();
  }