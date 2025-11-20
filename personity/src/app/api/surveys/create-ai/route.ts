import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateAIResponse, AIMessage } from '@/lib/ai/azure-openai';
import { generateMasterPrompt } from '@/lib/ai/master-prompt';
import { generateShortUrl } from '@/lib/utils/short-url';

const SYSTEM_PROMPT = `You are a research survey design assistant. Your job is to help users create effective surveys through conversation.

EXTRACTION RULES:
1. Extract objective when user describes what they want to learn
2. Extract topics when user mentions specific areas to explore
3. Extract context when user provides product/user/issue details
4. Extract settings when user mentions length/tone preferences

CONVERSATION FLOW:
1. Start: Ask what they want to learn
2. After objective: Suggest topics or ask what to explore
3. After topics: Ask about context (product, users, known issues)
4. After context: Ask about survey length and tone
5. After settings: Confirm and create

RESPONSE FORMAT:
Return JSON with:
{
  "aiResponse": "Your conversational response",
  "surveyData": { extracted data },
  "completedSteps": ["objective", "topics", etc],
  "surveyComplete": boolean
}

BE CONVERSATIONAL:
- Don't sound robotic
- Ask one thing at a time
- Acknowledge their input
- Suggest smart defaults

EXAMPLES:

User: "I want to understand why users cancel subscriptions"
Response: {
  "aiResponse": "Got it - you want to understand churn. I've detected this is Feedback & Satisfaction research.\\n\\nWhat specific topics should we explore? For example:\\n• Reasons for cancellation\\n• Experience before canceling\\n• What could have prevented it\\n\\nOr tell me your own topics!",
  "surveyData": {
    "objective": "Understand why users cancel subscriptions",
    "mode": "FEEDBACK_SATISFACTION"
  },
  "completedSteps": ["objective"],
  "surveyComplete": false
}

User: "reasons for leaving, what they tried first, pricing concerns"
Response: {
  "aiResponse": "Perfect! I've added those 3 topics.\\n\\nNow, tell me about your product - what service are users canceling? And who are your typical users?",
  "surveyData": {
    "objective": "Understand why users cancel subscriptions",
    "mode": "FEEDBACK_SATISFACTION",
    "topics": ["Reasons for leaving", "What they tried before canceling", "Pricing concerns"]
  },
  "completedSteps": ["objective", "topics"],
  "surveyComplete": false
}`;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, surveyData, completedSteps } = await request.json();

    // Build conversation history
    const messages: AIMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Current survey data: ${JSON.stringify(surveyData)}\\nCompleted steps: ${completedSteps.join(', ')}\\n\\nUser message: ${message}` },
    ];

    // Get AI response
    const aiResponse = await generateAIResponse(messages, {
      temperature: 0.7,
      maxTokens: 300,
    });

    // Parse AI response (expecting JSON)
    let parsedResponse;
    try {
      // Extract JSON from response (AI might wrap it in markdown)
      const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // Fallback if AI doesn't return JSON
      return NextResponse.json({
        success: true,
        aiResponse: aiResponse.content,
        surveyData,
        completedSteps,
        surveyComplete: false,
      });
    }

    // If survey is complete, create it
    if (parsedResponse.surveyComplete) {
      const finalData = parsedResponse.surveyData;
      
      // Ensure all required fields exist with defaults
      const settings = finalData.settings || {
        length: 'standard',
        tone: 'friendly',
        stopCondition: 'topics_covered',
      };
      
      // Generate short URL
      const shortUrl = generateShortUrl();

      // Generate master prompt
      const masterPrompt = generateMasterPrompt({
        objective: finalData.objective,
        context: finalData.context,
        topics: finalData.topics,
        settings: settings as any,
        mode: finalData.mode,
      });

      // Create survey
      const { data: survey, error } = await supabase
        .from('Survey')
        .insert({
          userId: user.id,
          title: finalData.objective.slice(0, 100),
          objective: finalData.objective,
          context: finalData.context || null,
          topics: finalData.topics,
          settings: finalData.settings,
          mode: finalData.mode || 'EXPLORATORY_GENERAL',
          masterPrompt,
          shortUrl,
          status: 'ACTIVE',
        })
        .select()
        .single();

      if (error || !survey) {
        throw new Error('Failed to create survey');
      }

      return NextResponse.json({
        success: true,
        aiResponse: parsedResponse.aiResponse,
        surveyData: parsedResponse.surveyData,
        completedSteps: parsedResponse.completedSteps,
        surveyComplete: true,
        surveyId: survey.id,
      });
    }

    return NextResponse.json({
      success: true,
      aiResponse: parsedResponse.aiResponse,
      surveyData: parsedResponse.surveyData,
      completedSteps: parsedResponse.completedSteps,
      surveyComplete: false,
    });
  } catch (error) {
    console.error('Error in AI survey creation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
