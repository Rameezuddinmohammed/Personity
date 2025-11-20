export interface SurveyTemplate {
  label: string;
  objective: string;
  topics: string[];
}

export const SURVEY_TEMPLATES: SurveyTemplate[] = [
  {
    label: 'E-commerce Checkout',
    objective:
      'I want to understand why users abandon their shopping carts and what would motivate them to complete their purchase.',
    topics: [
      'Shopping cart abandonment reasons',
      'Payment method preferences',
      'Delivery experience and expectations',
      'Product discovery and search process',
    ],
  },
  {
    label: 'SaaS Onboarding',
    objective:
      'I want to learn about the onboarding experience for new users and identify friction points that prevent them from becoming active users.',
    topics: [
      'First impression and signup experience',
      'Feature discovery and learning curve',
      'Pain points and frustrations',
      'Integration and setup needs',
    ],
  },
  {
    label: 'Mobile App Usage',
    objective:
      'I want to understand how users discover and use our mobile app in their daily routines, and what features they value most.',
    topics: [
      'App discovery and download motivation',
      'Daily usage habits and frequency',
      'Notification preferences and engagement',
      'Feature requests and improvements',
    ],
  },
  {
    label: 'Customer Support',
    objective:
      'I want to gather feedback on our customer support experience and identify areas where we can improve response quality and satisfaction.',
    topics: [
      'Support channel preferences',
      'Response time expectations',
      'Issue resolution satisfaction',
      'Self-service tool effectiveness',
    ],
  },
  {
    label: 'Product Pricing',
    objective:
      'I want to understand how customers perceive our pricing and what factors influence their purchase decisions.',
    topics: [
      'Pricing perception and value',
      'Comparison with competitors',
      'Budget constraints and decision process',
      'Preferred pricing models',
    ],
  },
];
