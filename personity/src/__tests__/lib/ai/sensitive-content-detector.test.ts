import { describe, it, expect } from 'vitest';
import { detectSensitiveContent, detectCrisisIndicators } from '@/lib/ai/sensitive-content-detector';

describe('Sensitive Content Detector', () => {
  describe('detectSensitiveContent', () => {
    it('should detect mental health topics', () => {
      const message = 'I have been feeling really depressed lately';
      const objective = 'Understand user experience';

      const result = detectSensitiveContent(message, objective);

      expect(result.isSensitive).toBe(true);
      expect(result.category).toBe('mentalHealth');
      expect(result.gentleResponse).toBeDefined();
    });

    it('should detect trauma-related content', () => {
      const message = 'I experienced abuse in my childhood';
      const objective = 'Understand user background';

      const result = detectSensitiveContent(message, objective);

      expect(result.isSensitive).toBe(true);
      expect(result.category).toBe('trauma');
    });

    it('should not flag normal content', () => {
      const message = 'I really enjoy using this product for my daily tasks';
      const objective = 'Understand product satisfaction';

      const result = detectSensitiveContent(message, objective);

      expect(result.isSensitive).toBe(false);
    });
  });

  describe('detectCrisisIndicators', () => {
    it('should detect crisis keywords', () => {
      const message = 'I want to die';

      const result = detectCrisisIndicators(message);

      expect(result.isCrisis).toBe(true);
      expect(result.message).toContain('crisis');
      expect(result.message).toContain('988'); // US helpline
    });

    it('should include international helplines', () => {
      const message = 'I feel like ending my life';

      const result = detectCrisisIndicators(message);

      expect(result.isCrisis).toBe(true);
      expect(result.message).toContain('United Kingdom');
      expect(result.message).toContain('India');
    });

    it('should not flag normal negative sentiment', () => {
      const message = 'I hate this product, it is terrible';

      const result = detectCrisisIndicators(message);

      expect(result.isCrisis).toBe(false);
    });
  });
});
