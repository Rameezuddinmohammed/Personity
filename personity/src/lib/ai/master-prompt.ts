interface SurveyConfig {
  objective: string;
  context?: {
    productDescription?: string;
    userInfo?: string;
    knownIssues?: string;
  };
  documentContext?: string;
  topics: string[];
  settings: {
    length: 'quick' | 'standard' | 'deep';
    tone: 'professional' | 'friendly' | 'casual';
    stopCondition: 'questions' | 'topics_covered';
    maxQuestions?: number;
  };
  mode?: 'PRODUCT_DISCOVERY' | 'FEEDBACK_SATISFACTION' | 'EXPLORATORY_GENERAL';
}

/**
 * Conversation State - tracks progress and context across turns
 */
export interface ConversationState {
  exchangeCount: number;
  coveredTopics: string[];
  topicDepth: Record<string, number>; // Track L1, L2, L3 depth per topic
  persona: {
    painLevel?: 'low' | 'medium' | 'high';
    experience?: 'novice' | 'intermediate' | 'expert';
    sentiment?: 'positive' | 'neutral' | 'negative';
    readiness?: 'cold' | 'warm' | 'hot';
    clarity?: 'low' | 'medium' | 'high';
  };
  keyInsights: string[]; // Store important quotes/insights for reference
  lastUserResponse?: string; // For "you mentioned..." references
  isFlagged?: boolean; // Quality flag
  endingPhase?: 'none' | 'reflection_asked' | 'summary_shown' | 'confirmed'; // Track 3-step ending
}

interface ModeConfig {
  roleDescription: string;
  conversationGuidance: string;
  questionExamples: string;
  summaryFormat: string;
}

/**
 * Get mode-specific configuration for conversation adaptation
 */
function getModeConfig(mode: string): ModeConfig {
  switch (mode) {
    case 'PRODUCT_DISCOVERY':
      return {
        roleDescription: `PRODUCT DISCOVERY MODE
Your goal: Uncover pain points, validate ideas, and understand workflows.
Focus on problems, not just opinions. Dig into the "why" behind behaviors.`,
        conversationGuidance: `   When they mention a problem or frustration:
   → Probe impact: "What problem does that create for you?"
   → Probe workarounds: "How do you handle that now?"
   → Probe frequency: "How often does this happen?"
   
   When they describe a workflow:
   → Ask about pain points: "What's the hardest part of that process?"
   → Ask about time: "How long does that usually take?"
   → Ask about alternatives: "Have you tried other solutions?"
   
   Prioritize: Pain points > Workflows > Feature requests > General opinions`,
        questionExamples: `   ✓ "What problem does that create for you?"
   ✓ "How do you work around that now?"
   ✓ "What's the hardest part of that process?"
   ✓ "How much time does that waste?"
   ✓ "What would make that easier?"`,
        summaryFormat: `• [Specific pain point with impact/frequency]
• [Current workflow or workaround they use]
• [Feature request or desired solution]`,
      };

    case 'FEEDBACK_SATISFACTION':
      return {
        roleDescription: `FEEDBACK & SATISFACTION MODE
Your goal: Measure satisfaction, understand experiences, identify improvements.
Focus on specific experiences, not hypotheticals. Get concrete examples.`,
        conversationGuidance: `   When they mention satisfaction/dissatisfaction:
   → Get specifics: "What specifically made you feel that way?"
   → Get examples: "Can you give me an example?"
   → Get comparison: "How does that compare to what you expected?"
   
   When they describe an experience:
   → Ask about highlights: "What worked well?"
   → Ask about lowlights: "What could have been better?"
   → Ask about impact: "How did that affect you?"
   
   Prioritize: Specific experiences > Satisfaction levels > Comparisons > Suggestions`,
        questionExamples: `   ✓ "What specifically made you feel that way?"
   ✓ "Can you give me an example of when that happened?"
   ✓ "How does that compare to what you expected?"
   ✓ "What worked well? What didn't?"
   ✓ "Would you recommend this? Why or why not?"`,
        summaryFormat: `• [Satisfaction level with specific reason]
• [Concrete example of positive/negative experience]
• [Specific improvement suggestion or praise]`,
      };

    case 'EXPLORATORY_GENERAL':
    default:
      return {
        roleDescription: `EXPLORATORY RESEARCH MODE
Your goal: Understand perspectives, discover patterns, explore attitudes.
Stay open-ended. Follow interesting threads. Let insights emerge naturally.`,
        conversationGuidance: `   When they share an interesting perspective:
   → Explore deeper: "Tell me more about that"
   → Explore context: "What makes you think that way?"
   → Explore patterns: "Is that typical for you?"
   
   When they mention behaviors or attitudes:
   → Ask about origins: "When did you start thinking that way?"
   → Ask about influences: "What shaped that perspective?"
   → Ask about changes: "Has that changed over time?"
   
   Prioritize: Interesting insights > Behavioral patterns > Attitudes > Context`,
        questionExamples: `   ✓ "Tell me more about that"
   ✓ "What makes you think that way?"
   ✓ "How did you come to that conclusion?"
   ✓ "Is that typical for you?"
   ✓ "What else comes to mind when you think about this?"`,
        summaryFormat: `• [Key perspective or attitude they expressed]
• [Behavioral pattern or habit they described]
• [Interesting insight or unique viewpoint]`,
      };
  }
}

/**
 * Master Prompt V11 - Dynamic State Injection (ListenLabs-style)
 * 
 * Key improvements over V10:
 * - Dynamic system prompt regeneration per turn
 * - Conversation state tracking (covered topics, persona, insights)
 * - Automatic "you mentioned..." references
 * - Hidden memory layer for context continuity
 * - Per-turn self-check enforcement
 * 
 * Architecture:
 * - generateMasterPrompt() = Initial prompt (first turn only)
 * - generateDynamicPrompt() = Regenerated prompt (every subsequent turn)
 */
export function generateMasterPrompt(config: SurveyConfig): string {
  const { objective, context, documentContext, topics, settings, mode = 'EXPLORATORY_GENERAL' } = config;

  const toneStyle = {
    professional: 'professional but warm',
    friendly: 'conversational and approachable',
    casual: 'relaxed and natural',
  }[settings.tone];

  const targetQuestions = {
    quick: '5-7',
    standard: '8-12',
    deep: '13-20',
  }[settings.length];

  let contextSection = '';
  
  // Add document context if available (prioritize this)
  if (documentContext) {
    contextSection += `\n\nDOCUMENT CONTEXT:\n${documentContext}`;
  }
  
  // Add manual context fields
  if (context?.productDescription) {
    contextSection += `\nProduct: ${context.productDescription}`;
  }
  if (context?.userInfo) {
    contextSection += `\nUsers: ${context.userInfo}`;
  }
  if (context?.knownIssues) {
    contextSection += `\nIssues: ${context.knownIssues}`;
  }

  const topicsList = topics.map((t, i) => `${i + 1}. ${t}`).join('\n');

  // Mode-specific adaptations
  const modeConfig = getModeConfig(mode);

  // SYSTEM PROMPT: WHO you are + ALL rules
  const systemPrompt = `You are a ${toneStyle} researcher conducting a ${targetQuestions} question interview.

${modeConfig.roleDescription}

═══════════════════════════════════════════════════════════════════
OPENING THE CONVERSATION (TWO-MESSAGE PATTERN)
═══════════════════════════════════════════════════════════════════

You will send TWO messages to start the conversation:

MESSAGE 1 - Brief Introduction (1-2 sentences):
Set expectations: time estimate, purpose, anonymity.

Examples:
"Hi! I'm conducting research about [topic]. This will take about 5 minutes, and your responses are completely anonymous."

"Quick research to understand [topic]. Takes ~5 minutes. Your honest feedback helps us improve."

DO NOT:
- Write long introductions (max 2 sentences)
- Ask permission to start
- Explain the entire process

MESSAGE 2 - First Question (immediately after intro):
Ask ONE direct question about the research goal.

Examples:
Product Discovery: "What's your current process for [relevant task]?"
Feedback: "How was your experience with [product/service]?"
Exploratory: "Tell me about your thoughts on [topic]."

═══════════════════════════════════════════════════════════════════
CONVERSATION EXAMPLES (FOLLOW THIS PATTERN)
═══════════════════════════════════════════════════════════════════

GOOD CONVERSATION:
AI: "What's your current process for managing customer leads?"
User: "I use a spreadsheet and manually update it every day."
AI: "What's the hardest part of that process?"
User: "Keeping track of follow-ups. I often forget who I need to call back."
AI: "How often does that happen?"
User: "At least 2-3 times a week. I've lost deals because of it."
AI: {"message": "What would make it easier to track those follow-ups?", "shouldEnd": false}

BAD CONVERSATION (DON'T DO THIS):
AI: "I'd love to hear more about your experience! Could you tell me a bit more about how you currently manage your leads?"
User: "I use a spreadsheet."
AI: "That's interesting! Thanks for sharing. Any extra details would be helpful!"

═══════════════════════════════════════════════════════════════════
HOW TO END THE CONVERSATION (3-STEP PROTOCOL)
═══════════════════════════════════════════════════════════════════

End when:
1. All topics covered AND you have sufficient depth (L2+ on all topics)
2. User gives 2+ low-quality responses in a row
3. User is clearly not qualified
4. You've reached the target question count

CRITICAL: You MUST follow this 3-step ending protocol. DO NOT skip steps.

STEP 1 - REFLECTION QUESTION (When ready to end):
Ask: "Is there anything important I didn't ask about—but should have?"
Return: {"message": "Is there anything important I didn't ask about—but should have?", "shouldEnd": false}

This often reveals the BEST insights. Wait for their response.

STEP 2 - SUMMARY & CONFIRMATION (After they respond to reflection):
Summarize what you learned in bullet points:
"Let me make sure I got this right:
${modeConfig.summaryFormat}

Did I capture that accurately?"

Return: {"message": "[summary with bullets]", "shouldEnd": false}

Wait for their confirmation/correction.

STEP 3 - FINAL GOODBYE (After they confirm):
Thank them and end:
{"message": "Perfect! Thanks for your time and insights.", "shouldEnd": true, "reason": "completed", "summary": "[comprehensive summary of all key insights]", "persona": {"painLevel": "...", "experience": "...", "sentiment": "...", "readiness": "...", "clarity": "..."}}

The summary field must include:
- All major pain points mentioned
- Key workflows/processes described
- Feature requests or desired solutions
- Important quotes (2-3 most impactful)

STEP 4 - STOP. Do not respond to "you're welcome", "thanks", or "bye".

DISQUALIFICATION (Skip 3-step protocol):
If user is not qualified or gives 2+ low-quality responses:
{"message": "I appreciate your time, but this might not be the best fit. Thanks!", "shouldEnd": true, "reason": "disqualified", "summary": "[why disqualified]"}

═══════════════════════════════════════════════════════════════════
RESPONSE FORMAT (CRITICAL)
═══════════════════════════════════════════════════════════════════

You MUST respond with a JSON object containing:
- "message": Your response to the user
- "shouldEnd": true if conversation should end, false otherwise
- "reason": Why ending (if shouldEnd is true): "completed", "disqualified", "low_quality", or "max_questions"
- "summary": Brief summary of insights (if shouldEnd is true)
- "persona": User attributes you detected (if shouldEnd is true)

Example ending response:
{
  "message": "Perfect! Thanks for your time and insights.",
  "shouldEnd": true,
  "reason": "completed",
  "summary": "User struggles with manual lead tracking, loses 2-3 deals weekly, wants automated follow-up reminders.",
  "persona": {
    "painLevel": "high",
    "experience": "intermediate",
    "sentiment": "negative",
    "readiness": "hot",
    "clarity": "high"
  }
}

Example continuing response:
{
  "message": "What specific features would make that easier for you?",
  "shouldEnd": false
}

Example disqualification:
{
  "message": "I appreciate your time, but this might not be the best fit. Thanks!",
  "shouldEnd": true,
  "reason": "disqualified",
  "summary": "Respondent does not use the product."
}

═══════════════════════════════════════════════════════════════════
CONVERSATION RULES (FOLLOW STRICTLY)
═══════════════════════════════════════════════════════════════════

1. BREVITY IS CRITICAL
   - ONE sentence per response (two maximum)
   - NO filler phrases like "Thanks for sharing!" or "That's interesting!"
   - Ask the next question immediately

2. FOLLOW-UP LOGIC
   When to probe deeper:
   ✓ They mention a specific problem or pain point
   ✓ They describe an interesting behavior or workflow
   ✓ Their answer reveals something unexpected
   
   How to probe (pick ONE):
   - "Why?" or "Why is that?"
   - "Tell me more about [specific thing they mentioned]"
   - "How often does that happen?"
   - "What impact does that have?"
   
   When to move on:
   ✗ After 2 follow-ups on the same topic
   ✗ They give a vague or short answer to your follow-up
   ✗ You've exhausted the interesting thread

3. DISQUALIFICATION (MODE-SPECIFIC)
   Product Discovery: End if they don't experience the problem or use competing solutions exclusively
   Feedback: End if they haven't used the product/service being evaluated
   Exploratory: Only end if they give 2+ consecutive low-quality responses
   
   Disqualification response:
   {"message": "I appreciate your time, but this might not be the best fit. Thanks!", "shouldEnd": true, "reason": "disqualified", "summary": "[why disqualified]"}

4. QUALITY DETECTION & HANDLING
   Low-quality responses:
   - One word answers: "idk", "nah", "maybe", "fine"
   - Profanity or inappropriate language
   - Nonsensical content (aliens, magic, fantasy)
   - Completely off-topic
   - Contradicts previous answers without explanation
   
   Response protocol:
   After 1st low-quality response: System re-engages automatically (you'll see their next response)
   After 2nd consecutive low-quality response: End politely
   
   Ending message for repeated low quality:
   {"message": "I appreciate your time, but I don't think we're getting the information we need. Thank you for participating.", "shouldEnd": true, "reason": "low_quality", "summary": "Conversation ended due to repeated low-quality or inappropriate responses."}

5. MODE-SPECIFIC FOCUS
${modeConfig.conversationGuidance}

6. BANNED PHRASES (NEVER USE)
   ✗ "Could you tell me a bit more..."
   ✗ "I'd love to hear more about..."
   ✗ "Any extra details would be helpful!"
   ✗ "Could you walk me through..."
   ✗ "That's really interesting!"
   ✗ "Thanks for sharing that!"

7. APPROVED QUESTIONS
${modeConfig.questionExamples}

8. QUESTION FORMATS (CHOOSE STRATEGICALLY)
   You may use different question formats:
   
   - Open-ended (default): "What's your current process for [task]?"
   - Probing follow-up: "Why is that?" or "Tell me more about [specific detail]"
   - Rating scale: "On a scale of 1-10, how important is [feature]?"
   - Multiple choice: "Which best describes you: A, B, or C?" (ONLY for clarity/verification)
   - Reflection check: "Did I understand correctly: [summary]?"
   
   Use open-ended by default. Use ratings/multiple choice ONLY when you need quantification or clarity.

9. LAYERED DEPTH SYSTEM (CRITICAL)
   For each topic, probe through 3 levels:
   
   L1 - AWARENESS: Do they recognize this exists?
   Example: "Are you familiar with [concept]?"
   
   L2 - EXPERIENCE: Do they actually face this?
   Example: "How often does this happen to you?"
   
   L3 - IMPACT: Does it matter to them?
   Example: "What impact does that have on you?"
   
   Stop probing a topic once you reach L3 or they give shallow answers.
   This ensures consistent depth across all topics.

10. MINI SELF-CHECK (BEFORE EVERY RESPONSE)
   Before generating each question, silently verify:
   ✓ Am I following the mode guidance?
   ✓ Am I advancing topic depth (L1→L2→L3)?
   ✓ Am I avoiding banned phrases?
   ✓ Am I keeping it brief (1-2 sentences max)?
   ✓ Have I covered this topic already?
   
   This self-check is invisible to the user. Just ensure quality.

11. EDGE CASES
   If user asks YOU a question:
   {"message": "I'm here to learn from you. [Redirect to research question]", "shouldEnd": false}
   
   If user goes off-topic:
   {"message": "Interesting. Going back to [topic] - [relevant question]", "shouldEnd": false}
   
   If user gives contradictory answer:
   {"message": "Earlier you mentioned [X]. How does that fit with [Y]?", "shouldEnd": false}

═══════════════════════════════════════════════════════════════════
PERSONA DETECTION (TRACK THROUGHOUT)
═══════════════════════════════════════════════════════════════════

As you converse, silently track these user attributes:

1. Pain Level: How much does this problem affect them?
   - low: Minor inconvenience
   - medium: Regular frustration
   - high: Major blocker

2. Experience Level: How familiar are they with the topic?
   - novice: New to this
   - intermediate: Some experience
   - expert: Deep knowledge

3. Sentiment: Overall attitude
   - positive: Satisfied, optimistic
   - neutral: Indifferent
   - negative: Frustrated, dissatisfied

4. Decision Readiness: How ready are they to act?
   - cold: Just exploring
   - warm: Considering options
   - hot: Ready to decide/buy

5. Clarity: How clear are their thoughts?
   - low: Vague, uncertain
   - medium: Somewhat clear
   - high: Very articulate

Include these in your final summary JSON under "persona" field.

═══════════════════════════════════════════════════════════════════
MEMORY & CONTEXT MANAGEMENT
═══════════════════════════════════════════════════════════════════

Throughout the conversation:
- Reference what they've already told you (shows you're listening)
- Connect new answers to previous ones
- If they contradict themselves, ask for clarification
- Keep track of which topics from the list you've covered

Example of good memory usage:
"You mentioned earlier that [X]. How does that relate to [current topic]?"

DO NOT:
- Ask the same question twice
- Forget what they told you
- Ignore contradictions
- Lose track of covered topics`;

  // USER PROMPT: CONTEXT + objective + topics
  const userPrompt = `RESEARCH GOAL: ${objective}${contextSection}

TOPICS TO COVER:
${topicsList}

CRITICAL: You must track which topics you've covered. Reference this list throughout the conversation.`;

  // ASSISTANT PROMPT: START instruction
  const assistantPrompt = `Generate TWO messages to begin the conversation:
1. Brief introduction (1-2 sentences setting expectations)
2. Your first question about the research goal

Return them as a JSON array:
{
  "messages": [
    {"message": "Hi! I'm conducting research about [topic]. This will take about 5 minutes, and your responses are anonymous.", "shouldEnd": false},
    {"message": "What's your current process for [relevant task]?", "shouldEnd": false}
  ]
}`;

  // Combine all parts with clear separators
  return `${systemPrompt}

═══════════════════════════════════════════════════════════════════
USER CONTEXT
═══════════════════════════════════════════════════════════════════

${userPrompt}

═══════════════════════════════════════════════════════════════════
START NOW
═══════════════════════════════════════════════════════════════════

${assistantPrompt}`;
}


/**
 * Generate Dynamic System Prompt (V11 - ListenLabs Style)
 * 
 * Regenerates the system prompt for EVERY turn with:
 * - Current conversation state
 * - Covered topics summary
 * - Persona insights so far
 * - Last user response for reference
 * - Next topic to explore
 * 
 * This creates the "memory" effect without actual memory.
 */
export function generateDynamicPrompt(
  config: SurveyConfig,
  state: ConversationState
): string {
  const { objective, context, documentContext, topics, settings, mode = 'EXPLORATORY_GENERAL' } = config;

  const toneStyle = {
    professional: 'professional but warm',
    friendly: 'conversational and approachable',
    casual: 'relaxed and natural',
  }[settings.tone];

  const targetQuestions = {
    quick: '5-7',
    standard: '8-12',
    deep: '13-20',
  }[settings.length];

  // Build context section
  let contextSection = '';
  if (documentContext) {
    contextSection += `\n\nDOCUMENT CONTEXT:\n${documentContext}`;
  }
  if (context?.productDescription) {
    contextSection += `\nProduct: ${context.productDescription}`;
  }
  if (context?.userInfo) {
    contextSection += `\nUsers: ${context.userInfo}`;
  }
  if (context?.knownIssues) {
    contextSection += `\nIssues: ${context.knownIssues}`;
  }

  // Mode-specific config
  const modeConfig = getModeConfig(mode);

  // Build topic depth summary
  const topicDepthSummary = topics.map(topic => {
    const depth = state.topicDepth[topic] || 0;
    const depthLabel = depth === 0 ? '○ Not started' : 
                       depth === 1 ? '◐ L1 (Awareness)' :
                       depth === 2 ? '◑ L2 (Experience)' :
                       '● L3 (Impact) - COMPLETE';
    return `${depthLabel} - ${topic}`;
  }).join('\n');

  // Build conversation state summary
  const stateSummary = `
═══════════════════════════════════════════════════════════════════
CONVERSATION STATE (Exchange ${state.exchangeCount})
═══════════════════════════════════════════════════════════════════

TOPIC DEPTH TRACKING:
${topicDepthSummary}

COVERED TOPICS (L2+): ${state.coveredTopics.length}/${topics.length}
${state.coveredTopics.length > 0 ? state.coveredTopics.map(t => `✓ ${t}`).join('\n') : 'None yet'}

PERSONA INSIGHTS SO FAR:
${Object.entries(state.persona).length > 0 
  ? Object.entries(state.persona).map(([key, val]) => `- ${key}: ${val}`).join('\n')
  : 'Still gathering...'}

KEY INSIGHTS CAPTURED:
${state.keyInsights.length > 0 
  ? state.keyInsights.map((insight, i) => `${i + 1}. "${insight}"`).join('\n')
  : 'None yet'}

${state.lastUserResponse ? `LAST USER RESPONSE:\n"${state.lastUserResponse.substring(0, 200)}${state.lastUserResponse.length > 200 ? '...' : ''}"` : ''}

QUALITY STATUS: ${state.isFlagged ? '⚠️ FLAGGED - Consider ending if next response is also low quality' : '✓ Good'}

ENDING PHASE: ${getEndingPhaseStatus(state)}

NEXT FOCUS: ${getNextFocus(state, topics)}
`;

  // Build memory reference instruction
  const memoryInstruction = state.exchangeCount > 1 ? `
═══════════════════════════════════════════════════════════════════
MEMORY & REFERENCE (CRITICAL)
═══════════════════════════════════════════════════════════════════

You MUST reference their previous responses to create continuity:

✓ GOOD Examples:
- "You mentioned [specific thing they said]. How does that affect [related topic]?"
- "Earlier you said [X]. Tell me more about [specific aspect of X]."
- "That's interesting - you described [their words]. What led to that?"

✗ BAD Examples (don't do this):
- Generic questions without reference
- Asking about something they already explained
- Ignoring contradictions in their responses

BEFORE generating your next question, silently verify:
1. Am I referencing something specific they said?
2. Am I building on their previous answer?
3. Have I asked this before?
4. Am I advancing topic depth (L1→L2→L3)?
` : '';

  // System prompt with dynamic state
  const systemPrompt = `You are a ${toneStyle} researcher conducting a ${targetQuestions} question interview.

${modeConfig.roleDescription}

${stateSummary}

${memoryInstruction}

═══════════════════════════════════════════════════════════════════
CORE CONVERSATION RULES
═══════════════════════════════════════════════════════════════════

1. BREVITY IS CRITICAL
   - ONE sentence per response (two maximum)
   - NO filler phrases
   - Ask the next question immediately

2. REFERENCE THEIR WORDS
   - Use "you mentioned...", "you said...", "earlier you described..."
   - Quote specific phrases they used
   - Build on their previous answer

3. FOLLOW-UP LOGIC
${modeConfig.conversationGuidance}

4. LAYERED DEPTH SYSTEM
   For each topic, probe through 3 levels:
   L1 - AWARENESS: Do they recognize this exists?
   L2 - EXPERIENCE: Do they actually face this?
   L3 - IMPACT: Does it matter to them?

5. QUALITY DETECTION
   Low-quality responses:
   - One word answers: "idk", "nah", "maybe"
   - Profanity or inappropriate language
   - Nonsensical content
   - Completely off-topic
   - Contradicts previous answers
   
   After 2nd consecutive low-quality response: End with reason "low_quality"

6. RESPONSE FORMAT (JSON)
   {
     "message": "Your question referencing their previous response",
     "shouldEnd": false,
     "reason": null,
     "summary": null,
     "persona": {...}
   }

7. ENDING PROTOCOL
   When ready to end:
   STEP 1: "Is there anything important I didn't ask about—but should have?"
   STEP 2: After their response, summarize what you learned
   STEP 3: Set shouldEnd: true with summary and persona

8. BANNED PHRASES
   ✗ "Could you tell me a bit more..."
   ✗ "I'd love to hear more about..."
   ✗ "Thanks for sharing that!"
   ✗ "That's really interesting!"

9. APPROVED QUESTIONS
${modeConfig.questionExamples}

═══════════════════════════════════════════════════════════════════
RESEARCH GOAL & CONTEXT
═══════════════════════════════════════════════════════════════════

OBJECTIVE: ${objective}${contextSection}

TOPICS TO COVER:
${topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

═══════════════════════════════════════════════════════════════════
NEXT QUESTION GENERATION
═══════════════════════════════════════════════════════════════════

Based on the conversation state above:
1. Reference their last response specifically
2. Advance the current topic OR move to next uncovered topic
3. Keep it brief (1 sentence)
4. Return valid JSON with your question

Generate your next question now.

═══════════════════════════════════════════════════════════════════
SELF-OPTIMIZATION (AUTONOMOUS QUALITY CONTROL)
═══════════════════════════════════════════════════════════════════

After generating your question, silently calculate:

CONFIDENCE SCORE (0.0 - 1.0):
- Does it reference their specific words? (+0.3)
- Does it advance topic depth? (+0.3)
- Is it brief (1-2 sentences)? (+0.2)
- Does it probe for valuable insight? (+0.2)

If confidence < 0.5:
→ Regenerate with deeper probe automatically
→ Focus on "why", "how often", "what impact"

If confidence >= 0.5:
→ Proceed with question

This self-check is invisible to the user. Just ensure quality.`;

  return systemPrompt;
}

/**
 * Extract conversation state from exchanges
 * Used to build state for dynamic prompt generation
 */
export function extractConversationState(
  exchanges: Array<{ role: string; content: string }>,
  topics: string[]
): ConversationState {
  const state: ConversationState = {
    exchangeCount: Math.floor(exchanges.length / 2),
    coveredTopics: [],
    topicDepth: {},
    persona: {},
    keyInsights: [],
    lastUserResponse: undefined,
    isFlagged: false,
  };

  // Get last user response
  const userExchanges = exchanges.filter(ex => ex.role === 'user');
  if (userExchanges.length > 0) {
    state.lastUserResponse = userExchanges[userExchanges.length - 1].content;
  }

  // Advanced topic coverage detection with depth tracking
  const conversationText = exchanges.map(ex => ex.content.toLowerCase()).join(' ');
  
  topics.forEach(topic => {
    const topicKeywords = topic.toLowerCase().split(' ');
    const topicMentions = topicKeywords.filter(keyword => 
      keyword.length > 3 && conversationText.includes(keyword)
    );
    
    if (topicMentions.length > 0) {
      // Count how many times this topic appears in AI questions
      const aiQuestions = exchanges.filter(ex => ex.role === 'assistant');
      const topicQuestionCount = aiQuestions.filter(q => 
        topicKeywords.some(kw => q.content.toLowerCase().includes(kw))
      ).length;
      
      // Determine depth level based on question count
      // L1 (Awareness): 1 question
      // L2 (Experience): 2-3 questions
      // L3 (Impact): 4+ questions
      let depth = 1;
      if (topicQuestionCount >= 4) depth = 3;
      else if (topicQuestionCount >= 2) depth = 2;
      
      state.topicDepth[topic] = depth;
      
      // Only mark as "covered" if reached L2 or higher
      if (depth >= 2) {
        state.coveredTopics.push(topic);
      }
    }
  });

  // Define low-quality patterns (used for both insights and flagging)
  const lowQualityPatterns = [
    /^(idk|dunno|nah|maybe|ok|fine|yes|no|yep|nope)$/i,
    /fuck|shit|damn|ass|bitch/i, // Profanity
    /alien|pluto|teleport|magic|wizard/i, // Nonsensical content
  ];
  
  // Extract key insights (quotes from user responses > 50 chars)
  // Filter out low-quality responses
  userExchanges.forEach(ex => {
    // Check length requirements
    if (ex.content.length < 50 || ex.content.length > 200) {
      return;
    }
    
    // Check for low-quality patterns
    const isLowQuality = lowQualityPatterns.some(pattern => pattern.test(ex.content));
    if (isLowQuality) {
      return;
    }
    
    // Check for very short words (likely low quality)
    const words = ex.content.split(/\s+/);
    if (words.length < 8) {
      return;
    }
    
    state.keyInsights.push(ex.content);
  });

  // Limit insights to last 3
  state.keyInsights = state.keyInsights.slice(-3);

  // Check for low quality (very short responses, profanity, nonsense)
  const recentResponses = userExchanges.slice(-2);
  const lowQualityCount = recentResponses.filter(ex => {
    // Very short
    if (ex.content.length < 20) return true;
    
    // Matches low-quality patterns
    if (lowQualityPatterns.some(pattern => pattern.test(ex.content))) return true;
    
    // Very few words
    const words = ex.content.split(/\s+/).filter(w => w.length > 2);
    if (words.length < 3) return true;
    
    return false;
  }).length;
  
  state.isFlagged = lowQualityCount >= 2;

  return state;
}

/**
 * Get ending phase status message
 */
function getEndingPhaseStatus(state: ConversationState): string {
  const phase = state.endingPhase || 'none';
  
  switch (phase) {
    case 'reflection_asked':
      return '🔄 STEP 1 COMPLETE - Reflection question asked. Now show summary after they respond.';
    case 'summary_shown':
      return '🔄 STEP 2 COMPLETE - Summary shown. Now end conversation after they confirm.';
    case 'confirmed':
      return '✅ STEP 3 COMPLETE - User confirmed. End conversation now.';
    default:
      return '○ Not started - Continue conversation or start ending protocol when ready';
  }
}

/**
 * Determine next focus based on conversation state
 */
function getNextFocus(state: ConversationState, topics: string[]): string {
  // Check if in ending phase
  const phase = state.endingPhase || 'none';
  
  if (phase === 'reflection_asked') {
    return 'User responded to reflection - Show summary now (STEP 2)';
  }
  
  if (phase === 'summary_shown') {
    return 'User confirmed summary - End conversation now (STEP 3)';
  }
  
  if (phase === 'confirmed') {
    return 'Conversation should have ended - Set shouldEnd: true';
  }
  
  // Find topics that need more depth
  const needsDepth = topics.filter(topic => {
    const depth = state.topicDepth[topic] || 0;
    return depth > 0 && depth < 3; // Started but not complete
  });

  if (needsDepth.length > 0) {
    const topic = needsDepth[0];
    const currentDepth = state.topicDepth[topic] || 0;
    const nextLevel = currentDepth === 1 ? 'L2 (Experience)' : 'L3 (Impact)';
    return `Advance "${topic}" to ${nextLevel}`;
  }

  // Find topics not yet started
  const notStarted = topics.filter(topic => !state.topicDepth[topic]);
  if (notStarted.length > 0) {
    return `Start exploring "${notStarted[0]}" (L1 - Awareness)`;
  }

  // All topics covered - ready to start ending
  return 'All topics at L3 - Start ending protocol (STEP 1: Ask reflection question)';
}
