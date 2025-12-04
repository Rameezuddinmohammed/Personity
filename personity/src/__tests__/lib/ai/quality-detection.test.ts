import { describe, it, expect, vi } from 'vitest';
import { trackLowQualityResponse } from '@/lib/ai/quality-detection';
import { QUALITY_THRESHOLDS } from '@/lib/constants';

describe('Quality Detection', () => {
  describe('trackLowQualityResponse', () => {
    it('should increment low quality count', () => {
      const currentState = {
        exchangeCount: 5,
        topicsCovered: ['topic1'],
        lowQualityCount: 1,
        hasReEngaged: false,
      };

      const result = trackLowQualityResponse(currentState);

      expect(result.lowQualityCount).toBe(2);
      expect(result.shouldFlag).toBe(false);
    });

    it('should flag session after threshold low-quality responses', () => {
      const currentState = {
        exchangeCount: 5,
        topicsCovered: ['topic1'],
        lowQualityCount: QUALITY_THRESHOLDS.LOW_QUALITY_COUNT_LIMIT - 1,
        hasReEngaged: false,
      };

      const result = trackLowQualityResponse(currentState);

      expect(result.lowQualityCount).toBe(QUALITY_THRESHOLDS.LOW_QUALITY_COUNT_LIMIT);
      expect(result.shouldFlag).toBe(true);
    });

    it('should preserve hasReEngaged state', () => {
      const currentState = {
        exchangeCount: 5,
        topicsCovered: ['topic1'],
        lowQualityCount: 0,
        hasReEngaged: true,
      };

      const result = trackLowQualityResponse(currentState);

      expect(result.hasReEngaged).toBe(true);
    });

    it('should handle undefined lowQualityCount', () => {
      const currentState = {
        exchangeCount: 5,
        topicsCovered: ['topic1'],
      };

      const result = trackLowQualityResponse(currentState);

      expect(result.lowQualityCount).toBe(1);
      expect(result.shouldFlag).toBe(false);
    });
  });
});
