/**
 * Generate a random 6-character alphanumeric short URL
 */
export function generateShortUrl(): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Check if a short URL is valid (6 alphanumeric characters)
 */
export function isValidShortUrl(shortUrl: string): boolean {
  return /^[a-z0-9]{6}$/.test(shortUrl);
}
