/**
 * Running OCR Service
 * Parses raw text from fitness app screenshots (Strava, Apple, Huawei)
 * Extracts distance, duration, and pace using Regex.
 */

export function parseOCRText(rawText) {
  const normalized = rawText.toLowerCase().replace(/\s+/g, ' ');
  
  // Regex patterns
  const distRegex = /(\d+[.,]\d+)\s*(km|kilometers|公里)/i;
  const timeRegex = /(\d{1,2}:\d{2}(:\d{2})?)/;
  const paceRegex = /(\d{1,2}:\d{2})\s*(min\/km|pace|min\/公里)/i;

  const distMatch = rawText.match(distRegex);
  const timeMatch = rawText.match(timeRegex);
  const paceMatch = rawText.match(paceRegex);

  let distance = distMatch ? parseFloat(distMatch[1].replace(',', '.')) : null;
  let duration = timeMatch ? timeMatch[1] : null;
  let pace = paceMatch ? paceMatch[1] : null;

  // Fallback: Calculate pace if missing
  if (distance && duration && !pace) {
    const parts = duration.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    else seconds = parts[0] * 60 + parts[1];
    
    const paceSecs = Math.round(seconds / distance);
    const pMin = Math.floor(paceSecs / 60);
    const pSec = paceSecs % 60;
    pace = `${pMin}:${pSec.toString().padStart(2, '0')}`;
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
 * In a real app, this would be a Supabase Edge Function or an API route
 */
export async function performOCR(imageFile) {
  // Simulating network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // For demonstration, we'll return some mock text based on common Strava patterns
  // In reality, you'd send the image to OpenAI Vision or Google Vision here
  return `
    Morning Run
    12.50 km
    Distance
    1:05:24
    Time
    5:14 /km
    Pace
  `;
}
