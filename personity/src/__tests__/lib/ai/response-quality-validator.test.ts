import { describe, it, expect } from 'vitest';
import { validateResponseQuality } from '@/lib/ai/response-quality-validator';
import { QUALITY_THRESHOLDS } from '@/lib/constants';

describe('Response Quality Validator', () => {
  describe('validateResponseQuality', () => {
    it('should pass for high-quality response with reference', () => {
      const aiResponse = 'You mentioned struggling with lead tracking. How often does that happen?';
      const lastUserResponse = 'I struggle with tracking my leads every day';
      const previousQuestions: string[] = [];
      const mode = 'PRODUCT_DISCOVERY';

      const result = validateResponseQuality(aiResponse, lastUserResponse, previousQuestions, mode);

      expect(result.passed).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.MIN_QUALITY_SCORE);
    });

    it('should fail for response with banned phrases', () => {
      const aiResponse = "That's really interesting! Could you tell me a bit more about that?";
      const lastUserResponse = 'I use spreadsheets for everything';
      const previousQuestions: string[] = [];
      const mode = 'EXPLORATORY_GENERAL';

      const result = validateResponseQuality(aiResponse, lastUserResponse, previousQuestions, mode);

      expect(result.passed).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should fail for response without question mark', () => {
      const aiResponse = 'That sounds like a challenge.';
      const lastUserResponse = 'Managing customer data is really hard';
      const previousQuestions: string[] = [];
      const mode = 'PRODUCT_DISCOVERY';

      const result = validateResponseQuality(aiResponse, lastUserResponse, previousQuestions, mode);

      expect(result.issues).toContain('Not clearly a question');
    });

    it('should fail for repeated questions', () => {
      const aiResponse = 'What challenges do you face with lead management?';
      const lastUserResponse = 'I have many challenges';
      const previousQuestions = ['What challenges do you face with lead management?'];
      const mode = 'PRODUCT_DISCOVERY';

      const result = validateResponseQuality(aiResponse, lastUserResponse, previousQuestions, mode);

      expect(result.issues.some(i => i.includes('similar to previous'))).toBe(true);
    });

    it('should penalize responses that are too long', () => {
      const aiResponse = 'First sentence here. Second sentence here. Third sentence here. Fourth sentence here.';
      const lastUserResponse = 'I mentioned something about my workflow';
      const previousQuestions: string[] = [];
      const mode = 'EXPLORATORY_GENERAL';

      const result = validateResponseQuality(aiResponse, lastUserResponse, previousQuestions, mode);

      expect(result.issues.some(i => i.includes('Too long'))).toBe(true);
    });
  });
});
