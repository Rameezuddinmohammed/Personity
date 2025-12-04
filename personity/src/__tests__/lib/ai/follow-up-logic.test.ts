import { describe, it, expect } from 'vitest';
import { suggestFollowUp } from '@/lib/ai/follow-up-logic';

describe('Follow-Up Logic', () => {
  describe('suggestFollowUp', () => {
    it('should detect emotion and suggest high-priority follow-up', () => {
      const userResponse = 'I am really frustrated with the current process';
      const context = { currentTopic: 'workflow', topicDepth: 1, previousFollowUps: 0 };

      const result = suggestFollowUp(userResponse, context);

      expect(result.shouldFollowUp).toBe(true);
      expect(result.priority).toBe('high');
      expect(result.reason).toContain('frustrated');
    });

    it('should detect pain points and suggest follow-up', () => {
      const userResponse = 'The main problem is that it takes too long';
      const context = { currentTopic: 'efficiency', topicDepth: 1, previousFollowUps: 0 };

      const result = suggestFollowUp(userResponse, context);

      expect(result.shouldFollowUp).toBe(true);
      expect(result.priority).toBe('high');
    });

    it('should detect workarounds and suggest medium-priority follow-up', () => {
      const userResponse = 'I use a spreadsheet to track everything manually';
      const context = { currentTopic: 'tools', topicDepth: 1, previousFollowUps: 0 };

      const result = suggestFollowUp(userResponse, context);

      expect(result.shouldFollowUp).toBe(true);
      expect(result.priority).toBe('medium');
    });

    it('should not suggest follow-up after max follow-ups reached', () => {
      const userResponse = 'I am really frustrated with everything';
      const context = { currentTopic: 'workflow', topicDepth: 2, previousFollowUps: 3 };

      const result = suggestFollowUp(userResponse, context);

      expect(result.shouldFollowUp).toBe(false);
      expect(result.reason).toContain('Max follow-ups');
    });

    it('should not suggest follow-up for neutral short responses', () => {
      const userResponse = 'It works okay for me';
      const context = { currentTopic: 'satisfaction', topicDepth: 2, previousFollowUps: 0 };

      const result = suggestFollowUp(userResponse, context);

      expect(result.shouldFollowUp).toBe(false);
    });
  });
});
