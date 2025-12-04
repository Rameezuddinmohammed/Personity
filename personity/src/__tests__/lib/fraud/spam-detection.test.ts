import { describe, it, expect } from 'vitest';
import { detectIdenticalResponses, isSuspiciousSpeed, calculateAverageExchangeTime } from '@/lib/fraud/spam-detection';
import { FRAUD_THRESHOLDS } from '@/lib/constants';

describe('Spam Detection', () => {
  describe('detectIdenticalResponses', () => {
    it('should detect identical responses exceeding threshold', () => {
      const exchanges = [
        { role: 'user', content: 'hello' },
        { role: 'assistant', content: 'Hi there!' },
        { role: 'user', content: 'hello' },
        { role: 'assistant', content: 'How can I help?' },
      ];
      const newMessage = 'hello';

      const result = detectIdenticalResponses(exchanges, newMessage);

      expect(result).toBe(true);
    });

    it('should not flag unique responses', () => {
      const exchanges = [
        { role: 'user', content: 'hello' },
        { role: 'assistant', content: 'Hi there!' },
        { role: 'user', content: 'how are you' },
        { role: 'assistant', content: 'I am good!' },
      ];
      const newMessage = 'what is your name';

      const result = detectIdenticalResponses(exchanges, newMessage);

      expect(result).toBe(false);
    });

    it('should be case-insensitive', () => {
      const exchanges = [
        { role: 'user', content: 'HELLO' },
        { role: 'assistant', content: 'Hi!' },
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'How are you?' },
      ];
      const newMessage = 'hello';

      const result = detectIdenticalResponses(exchanges, newMessage);

      expect(result).toBe(true);
    });
  });

  describe('isSuspiciousSpeed', () => {
    it('should flag suspiciously fast responses', () => {
      const avgTime = FRAUD_THRESHOLDS.MIN_AVG_RESPONSE_TIME_SECONDS - 1;
      expect(isSuspiciousSpeed(avgTime)).toBe(true);
    });

    it('should not flag normal response times', () => {
      const avgTime = FRAUD_THRESHOLDS.MIN_AVG_RESPONSE_TIME_SECONDS + 5;
      expect(isSuspiciousSpeed(avgTime)).toBe(false);
    });

    it('should not flag zero time (not enough data)', () => {
      expect(isSuspiciousSpeed(0)).toBe(false);
    });
  });

  describe('calculateAverageExchangeTime', () => {
    it('should calculate average time between exchanges', () => {
      const now = Date.now();
      const exchanges = [
        { role: 'user', content: 'hi', timestamp: new Date(now).toISOString() },
        { role: 'assistant', content: 'hello', timestamp: new Date(now + 1000).toISOString() },
        { role: 'user', content: 'how are you', timestamp: new Date(now + 11000).toISOString() },
        { role: 'assistant', content: 'good', timestamp: new Date(now + 12000).toISOString() },
        { role: 'user', content: 'great', timestamp: new Date(now + 22000).toISOString() },
        { role: 'assistant', content: 'yes', timestamp: new Date(now + 23000).toISOString() },
      ];

      const result = calculateAverageExchangeTime(exchanges);

      // Average should be around 10 seconds between user messages
      expect(result).toBeGreaterThan(5);
      expect(result).toBeLessThan(15);
    });

    it('should return 0 for insufficient data', () => {
      const exchanges = [
        { role: 'user', content: 'hi', timestamp: new Date().toISOString() },
        { role: 'assistant', content: 'hello', timestamp: new Date().toISOString() },
      ];

      const result = calculateAverageExchangeTime(exchanges);

      expect(result).toBe(0);
    });
  });
});
