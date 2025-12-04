import { describe, it, expect } from 'vitest';
import { isOffTopic, isAskingAIQuestion, generateAIQuestionResponse } from '@/lib/ai/topic-detector';

describe('Topic Detector', () => {
  describe('isOffTopic', () => {
    it('should detect off-topic responses about unrelated subjects', () => {
      const userMessage = 'What is your favorite color?';
      const surveyObjective = 'Understand customer pain points with lead management';
      const topics = ['lead tracking', 'CRM usage', 'sales process'];

      const result = isOffTopic(userMessage, surveyObjective, topics);

      expect(result.isOffTopic).toBe(true);
      expect(result.redirectMessage).toBeDefined();
    });

    it('should not flag on-topic responses', () => {
      const userMessage = 'I struggle with tracking my leads in the CRM system';
      const surveyObjective = 'Understand customer pain points with lead management';
      const topics = ['lead tracking', 'CRM usage', 'sales process'];

      const result = isOffTopic(userMessage, surveyObjective, topics);

      expect(result.isOffTopic).toBe(false);
    });

    it('should skip check for very short responses', () => {
      const userMessage = 'yes';
      const surveyObjective = 'Understand customer satisfaction';
      const topics = ['satisfaction', 'experience'];

      const result = isOffTopic(userMessage, surveyObjective, topics);

      expect(result.isOffTopic).toBe(false);
    });
  });

  describe('isAskingAIQuestion', () => {
    it('should detect when user asks AI a question', () => {
      expect(isAskingAIQuestion('What do you think about this?')).toBe(true);
      expect(isAskingAIQuestion('Can you help me with something?')).toBe(true);
      expect(isAskingAIQuestion('What about you?')).toBe(true);
    });

    it('should not flag normal responses', () => {
      expect(isAskingAIQuestion('I think the product is great')).toBe(false);
      expect(isAskingAIQuestion('My experience has been positive')).toBe(false);
    });
  });

  describe('generateAIQuestionResponse', () => {
    it('should generate redirect response', () => {
      const lastQuestion = 'What challenges do you face?';
      const response = generateAIQuestionResponse(lastQuestion);

      expect(response).toContain('learn from you');
    });

    it('should work without last question', () => {
      const response = generateAIQuestionResponse();

      expect(response.length).toBeGreaterThan(0);
    });
  });
});
