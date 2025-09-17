/**
 * Input validation utilities for onboarding forms
 */

export function isSalutation(message: string): boolean {
  const salutations = [
    'hello',
    'hi',
    'hey',
    'hiya',
    'howdy',
    'how are you',
    'how r you',
    'how r u',
    'how are u',
    'whats up',
    "what's up",
    'sup',
    'wassup',
    'good morning',
    'good afternoon',
    'good evening',
    'nice to meet you',
    'pleased to meet you',
  ];

  const lowerMessage = message.toLowerCase().trim();
  return salutations.some(
    (greeting) =>
      lowerMessage === greeting ||
      lowerMessage.startsWith(greeting + ' ') ||
      lowerMessage.endsWith(' ' + greeting) ||
      (greeting.includes(' ') && lowerMessage.includes(greeting))
  );
}

export function isValidName(message: string): boolean {
  const trimmed = message.trim();
  // Must be at least 2 characters, contain letters, and can include spaces, hyphens, apostrophes
  const namePattern = /^[a-zA-Z\s\-']{2,50}$/;

  // Check pattern and ensure it's not just spaces or special characters
  return (
    namePattern.test(trimmed) &&
    trimmed.length >= 2 &&
    /[a-zA-Z]/.test(trimmed) && // Must contain at least one letter
    !/^\s+$/.test(trimmed)
  ); // Not just spaces
}

export function isDateFormat(message: string): boolean {
  // Normalize spaces: trim and replace multiple spaces with single spaces
  const normalized = message.trim().replace(/\s+/g, ' ');

  // Check for common date formats - flexible with spacing and commas
  const datePatterns = [
    /^\d{1,2}\/\d{1,2}\/\d{4}$/, // MM/DD/YYYY or M/D/YYYY
    /^\d{1,2}-\d{1,2}-\d{4}$/, // MM-DD-YYYY or M-D-YYYY
    /^\d{4}-\d{1,2}-\d{1,2}$/, // YYYY-MM-DD or YYYY-M-D
    /^(january|february|march|april|may|june|july|august|september|october|november|december) \d{1,2} ?,? ?\d{4}$/i,
    /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec) \d{1,2} ?,? ?\d{4}$/i,
    /^\d{1,2} (january|february|march|april|may|june|july|august|september|october|november|december) ?,? ?\d{4}$/i,
    /^\d{1,2} (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec) ?,? ?\d{4}$/i,
  ];

  const patternResults = datePatterns.map((pattern, index) => {
    const result = pattern.test(normalized);
    return result;
  });

  const passesRegex = patternResults.some((result) => result);

  if (!passesRegex) {
    return false;
  }

  // Additional validation: try to parse as actual date
  try {
    // Try multiple parsing approaches
    let date = new Date(normalized);

    // If first attempt fails, try different formats
    if (isNaN(date.getTime())) {
      // Try converting "March 15, 1995" to "March 15 1995" (remove comma)
      const withoutComma = normalized.replace(',', '');
      date = new Date(withoutComma);

      // If still fails, try MM/DD/YYYY format
      if (isNaN(date.getTime())) {
        // Convert "March 15, 1995" to "03/15/1995"
        const monthNames = [
          'january',
          'february',
          'march',
          'april',
          'may',
          'june',
          'july',
          'august',
          'september',
          'october',
          'november',
          'december',
        ];
        const shortMonthNames = [
          'jan',
          'feb',
          'mar',
          'apr',
          'may',
          'jun',
          'jul',
          'aug',
          'sep',
          'oct',
          'nov',
          'dec',
        ];

        const lowerNormalized = normalized.toLowerCase();
        let monthIndex = -1;

        // Find month index
        for (let i = 0; i < monthNames.length; i++) {
          if (
            lowerNormalized.includes(monthNames[i]) ||
            lowerNormalized.includes(shortMonthNames[i])
          ) {
            monthIndex = i;
            break;
          }
        }

        if (monthIndex >= 0) {
          // Extract day and year using regex
          const dayYearMatch = normalized.match(/(\d{1,2}).*?(\d{4})/);
          if (dayYearMatch) {
            const day = parseInt(dayYearMatch[1]);
            const year = parseInt(dayYearMatch[2]);
            const month = monthIndex; // 0-based for Date constructor

            date = new Date(year, month, day);

            // Also try ISO format as backup
            if (isNaN(date.getTime())) {
              const isoFormat = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                day
              ).padStart(2, '0')}`;
              date = new Date(isoFormat);
            }
          }
        }
      }
    }

    const now = new Date();
    const hundredYearsAgo = new Date(now.getFullYear() - 100, 0, 1);

    const result = !isNaN(date.getTime()) && date <= now && date >= hundredYearsAgo;

    // Must be a valid date, not in the future, and not more than 100 years ago
    return result;
  } catch (error) {
    return false;
  }
}

export function isValidHeight(message: string, units: 'metric' | 'imperial' = 'metric'): boolean {
  const trimmed = message.trim().toLowerCase();

  if (units === 'metric') {
    // Accept formats like: 165, 165cm, 1.65, 1.65m
    const metricPattern = /^(\d{1,3}(?:\.\d{1,2})?)\s*(cm|m)?$/;
    const match = trimmed.match(metricPattern);

    if (!match) return false;

    const value = parseFloat(match[1]);
    const unit = match[2];

    if (unit === 'm') {
      // Meters: 1.0 to 2.5
      return value >= 1.0 && value <= 2.5;
    } else {
      // Centimeters (default): 100 to 250
      return value >= 100 && value <= 250;
    }
  } else {
    // Imperial: 4'0" to 8'0" or 48" to 96"
    const feetInchPattern = /^(\d{1})['']?\s*(\d{1,2})(?:["'']|in)?$/;
    const inchesPattern = /^(\d{1,3})(?:["'']|in)?$/;

    const feetMatch = trimmed.match(feetInchPattern);
    const inchMatch = trimmed.match(inchesPattern);

    if (feetMatch) {
      const feet = parseInt(feetMatch[1]);
      const inches = parseInt(feetMatch[2]);
      const totalInches = feet * 12 + inches;
      return totalInches >= 48 && totalInches <= 96 && inches < 12;
    } else if (inchMatch) {
      const totalInches = parseInt(inchMatch[1]);
      return totalInches >= 48 && totalInches <= 96;
    }

    return false;
  }
}

export function isValidWeight(message: string, units: 'metric' | 'imperial' = 'metric'): boolean {
  const trimmed = message.trim().toLowerCase();

  if (units === 'metric') {
    // Accept formats like: 65, 65kg, 65.5, 65.5kg
    const metricPattern = /^(\d{1,3}(?:\.\d{1})?)\s*(kg)?$/;
    const match = trimmed.match(metricPattern);

    if (!match) return false;

    const value = parseFloat(match[1]);
    // Reasonable weight range: 30kg to 300kg
    return value >= 30 && value <= 300;
  } else {
    // Imperial: Accept formats like: 140, 140lbs, 140.5, 140.5lbs
    const imperialPattern = /^(\d{1,3}(?:\.\d{1})?)\s*(lbs?|pounds?)?$/;
    const match = trimmed.match(imperialPattern);

    if (!match) return false;

    const value = parseFloat(match[1]);
    // Reasonable weight range: 66lbs to 660lbs (30kg to 300kg equivalent)
    return value >= 66 && value <= 660;
  }
}
