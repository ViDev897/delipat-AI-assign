import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface QualificationResult {
  leadScore: number
  temperature: 'Hot' | 'Warm' | 'Cold'
  confidence: number
  reasoning: string
  nextAction: string
}

const QUALIFICATION_PROMPT = `You are an expert lead qualification specialist. Analyze the following lead information and provide a structured qualification result.

Lead Information:
- Industry: {industry}
- Company Size: {companySize}
- Estimated Budget: ${'{estimatedBudget}'}
- Project Description: {projectDescription}

Provide your analysis in this exact JSON format (no markdown, just raw JSON):
{
  "leadScore": <number 0-100>,
  "temperature": "<Hot|Warm|Cold>",
  "confidence": <number 0-100>,
  "reasoning": "<2-3 sentences explaining the score>",
  "nextAction": "<specific recommended next step for sales team>"
}

Scoring guidelines:
- 80-100 (Hot): Perfect fit, high budget, clear need, quick timeline
- 60-79 (Warm): Good fit, reasonable budget, interested but some questions
- 40-59 (Cold): Possible fit, low budget, unclear needs, long timeline
- 0-39 (Cold): Poor fit, misaligned industry, unrealistic expectations

Be concise and practical in your reasoning and next actions.`

export async function qualifyLead(
  industry: string,
  companySize: string,
  estimatedBudget: number | null,
  projectDescription: string
): Promise<QualificationResult> {
  try {
    const prompt = QUALIFICATION_PROMPT
      .replace('{industry}', industry)
      .replace('{companySize}', companySize)
      .replace('{estimatedBudget}', estimatedBudget ? `$${estimatedBudget}` : 'Not specified')
      .replace('{projectDescription}', projectDescription)

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Extract the text response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response')
    }

    const result = JSON.parse(jsonMatch[0])

    return {
      leadScore: Math.max(0, Math.min(100, result.leadScore)),
      temperature: result.temperature,
      confidence: Math.max(0, Math.min(100, result.confidence)),
      reasoning: result.reasoning,
      nextAction: result.nextAction,
    }
  } catch (error) {
    console.error('AI qualification error:', error)
    throw new Error('Failed to qualify lead with AI')
  }
}

// Template for personalized follow-up email
export async function generatePersonalizedEmail(
  leadName: string,
  industry: string,
  projectDescription: string,
  leadScore: number
): Promise<string> {
  try {
    const emailPrompt = `Generate a personalized, professional follow-up email for a sales lead.

Lead Details:
- Name: ${leadName}
- Industry: ${industry}
- Project: ${projectDescription}
- Lead Score: ${leadScore}/100

Create a brief, friendly email (3-4 sentences) that:
1. References their specific industry/project
2. Shows genuine interest in their needs
3. Suggests a next step (call, demo, etc.)
4. Keeps professional tone but personable

Return only the email body text, no subject line or greeting.`

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: emailPrompt,
        },
      ],
    })

    const emailBody = message.content[0].type === 'text' ? message.content[0].text : ''
    return emailBody
  } catch (error) {
    console.error('Email generation error:', error)
    return '' // Fallback to template email if AI fails
  }
}
