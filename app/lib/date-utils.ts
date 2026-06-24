// Convert any date to ISO 8601 UTC format: 2026-06-17T01:00:00Z
export function toUTC(dateInput: string | Date | null | undefined): string | null {
  if (!dateInput) return null;

  try {
    let date: Date;

    if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      return null;
    }

    if (isNaN(date.getTime())) {
      return null;
    }

    // Return ISO 8601 UTC format: 2026-06-17T01:00:00Z
    return date.toISOString();
  } catch (error) {
    console.error('Error converting date to UTC:', error);
    return null;
  }
}

// Validate if a date string is in ISO 8601 UTC format
export function isISO8601UTC(dateString: string): boolean {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.?\d{0,3})?Z$/;
  return iso8601Regex.test(dateString);
}
