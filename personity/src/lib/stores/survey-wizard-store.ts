import { create } from 'zustand';

export type SurveyMode = 'PRODUCT_DISCOVERY' | 'FEEDBACK_SATISFACTION' | 'EXPLORATORY_GENERAL';

export interface SurveyWizardState {
  // Current step (1-5)
  currentStep: number;
  
  // Step 1: Objective
  objective: string;
  
  // Detected mode
  mode: SurveyMode;
  modeConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  suggestedContextQuestions: string[];
  
  // Step 2: Context (conditional)
  showContextStep: boolean;
  context: {
    productDescription?: string;
    userInfo?: string;
    knownIssues?: string;
  };
  
  // Step 3: Topics
  topics: string[];
  
  // Step 4: Settings
  settings: {
    length: 'quick' | 'standard' | 'deep';
    tone: 'professional' | 'friendly' | 'casual';
    stopCondition: 'questions' | 'topics_covered';
    maxQuestions?: number;
  };
  
  // Step 5: Review & Test
  testMode: boolean;
  
  // Actions
  setCurrentStep: (step: number) => void;
  setObjective: (objective: string) => void;
  setMode: (mode: SurveyMode, confidence: 'HIGH' | 'MEDIUM' | 'LOW', questions: string[]) => void;
  loadTemplate: (template: { objective: string; topics: string[] }) => void;
  setShowContextStep: (show: boolean) => void;
  setContext: (context: Partial<SurveyWizardState['context']>) => void;
  setTopics: (topics: string[]) => void;
  addTopic: () => void;
  removeTopic: (index: number) => void;
  updateTopic: (index: number, value: string) => void;
  setSettings: (settings: Partial<SurveyWizardState['settings']>) => void;
  setTestMode: (testMode: boolean) => void;
  nextStep: () => void;
  previousStep: () => void;
  reset: () => void;
}

const initialState = {
  currentStep: 1,
  objective: '',
  mode: 'EXPLORATORY_GENERAL' as SurveyMode,
  modeConfidence: 'LOW' as const,
  suggestedContextQuestions: [],
  showContextStep: false,
  context: {},
  topics: ['', ''],
  settings: {
    length: 'standard' as const,
    tone: 'professional' as const,
    stopCondition: 'topics_covered' as const,
  },
  testMode: false,
};

export const useSurveyWizardStore = create<SurveyWizardState>((set) => ({
  ...initialState,
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  setObjective: (objective) => set({ objective }),
  
  setMode: (mode, confidence, questions) =>
    set({ mode, modeConfidence: confidence, suggestedContextQuestions: questions }),
  
  loadTemplate: (template: { objective: string; topics: string[] }) =>
    set({ objective: template.objective, topics: template.topics }),
  
  setShowContextStep: (show) => set({ showContextStep: show }),
  
  setContext: (context) =>
    set((state) => ({
      context: { ...state.context, ...context },
    })),
  
  setTopics: (topics) => set({ topics }),
  
  addTopic: () =>
    set((state) => ({
      topics: [...state.topics, ''],
    })),
  
  removeTopic: (index) =>
    set((state) => ({
      topics: state.topics.filter((_, i) => i !== index),
    })),
  
  updateTopic: (index, value) =>
    set((state) => ({
      topics: state.topics.map((topic, i) => (i === index ? value : topic)),
    })),
  
  setSettings: (settings) =>
    set((state) => ({
      settings: { ...state.settings, ...settings },
    })),
  
  setTestMode: (testMode) => set({ testMode }),
  
  nextStep: () =>
    set((state) => {
      let nextStep = state.currentStep + 1;
      
      // Skip context step if not needed
      if (nextStep === 2 && !state.showContextStep) {
        nextStep = 3;
      }
      
      return { currentStep: Math.min(nextStep, 5) };
    }),
  
  previousStep: () =>
    set((state) => {
      let prevStep = state.currentStep - 1;
      
      // Skip context step if not needed
      if (prevStep === 2 && !state.showContextStep) {
        prevStep = 1;
      }
      
      return { currentStep: Math.max(prevStep, 1) };
    }),
  
  reset: () => set(initialState),
}));
