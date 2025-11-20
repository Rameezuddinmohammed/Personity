import { z } from 'zod';

export const createSurveySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  objective: z.string().min(20, 'Objective must be at least 20 characters').max(1000),
  context: z
    .object({
      productDescription: z.string().max(500).optional(),
      userInfo: z.string().max(500).optional(),
      knownIssues: z.string().max(500).optional(),
    })
    .optional(),
  topics: z
    .array(z.string().min(1))
    .min(2, 'At least 2 topics are required')
    .max(10, 'Maximum 10 topics allowed'),
  settings: z.object({
    length: z.enum(['quick', 'standard', 'deep']),
    tone: z.enum(['professional', 'friendly', 'casual']),
    stopCondition: z.enum(['questions', 'topics_covered']),
    maxQuestions: z.number().min(5).max(30).optional(),
  }),
});

export type CreateSurveyInput = z.infer<typeof createSurveySchema>;
