/**
 * Running OCR Service
 * Parses raw text from fitness app screenshots (Strava, Apple, Huawei)
 * Extracts distance, duration, and pace using Regex.
 */

export function parseOCRText(rawText) {
  const normalized = rawText.toLowerCase().replace(/\s+/g, ' ');
  
  // Regex patterns
  // Distance: 2,56 KM or 12.50 km
  const distRegex = /(\d+[,.]\d+)\s*(km|kilometers|公里)/i;
  // Duration: 0:27:20 or 25:30
  const timeRegex = /(\d{1,2}:\d{2}(:\d{2})?)/;
  // Pace: 10'38"/km or 5:14 /km
  const paceRegex = /(\d{1,2})'(\d{2})"?\/km|(\d{1,2}:\d{2})\s*(min\/km|pace|min\/公里)/i;

  const distMatch = rawText.match(distRegex);
  const timeMatch = rawText.match(timeRegex);
  const paceMatch = rawText.match(paceRegex);

  let distance = distMatch ? parseFloat(distMatch[1].replace(',', '.')) : null;
  let duration = timeMatch ? timeMatch[1] : null;
  let pace = null;

  if (paceMatch) {
    if (paceMatch[1] && paceMatch[2]) {
      // Apple Fitness format: 10'38"
      pace = `${paceMatch[1]}:${paceMatch[2]}`;
    } else {
      pace = paceMatch[3];
    }
  }

  // Fallback: Calculate pace if missing
  if (distance && duration && !pace) {
    const parts = duration.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    else if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
    
    if (distance > 0) {
      const paceSecs = Math.round(seconds / distance);
      const pMin = Math.floor(paceSecs / 60);
      const pSec = paceSecs % 60;
      pace = `${pMin}:${pSec.toString().padStart(2, '0')}`;
    }
  }

  // Calculate confidence
  let confidence = 0;
  if (distance) confidence += 40;
  if (duration) confidence += 30;
  if (pace) confidence += 30;

  let level = 'low';
  if (confidence > 80) level = 'high';
  else if (confidence > 50) level = 'medium';

  return {
    distance,
    duration,
    pace,
    confidence: { score: confidence, level },
    raw: rawText
  };
}

/**
 * Mock Server-Side OCR Call
 */
export async function performOCR(imageFile) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Returning data that matches the user's provided Apple Fitness screenshot
  return `
    Saturday, Apr 25
    Outdoor Run
    Workout Time: 0:27:20
    Distance: 2,56 KM
    Active Kilocalories: 53 KCAL
    Avg. Pace: 10'38"/KM
  `;
}
