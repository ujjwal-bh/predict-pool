export function formatMatchDateTime(
  input: string | Date,
  format: 'short' | 'long' = 'short'
): string {
  try {
    let date: Date;

    if (input instanceof Date) {
      date = input;
    } else if (typeof input === 'string') {
      // FIX: normalize non-ISO formats safely
      const normalized = input.includes('T')
        ? input
        : input.replace(' ', 'T') + 'Z';

      date = new Date(normalized);
    } else {
      return 'Invalid date';
    }

    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    if (format === 'short') {
      return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(date);
    }

    return new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);

  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}