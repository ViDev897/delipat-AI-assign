# Prompt Engineering Notes

This document explains the reasoning behind the AI prompts used in `lib/ai-service.ts`, since prompt design is a scored part of this assessment.

## 1. Lead Qualification Prompt

### Goal
Turn four raw form fields (industry, company size, budget, project description) into a **structured, actionable** qualification result the sales team can act on immediately — not a vague paragraph.

### Design decisions

**Strict output contract.** The prompt asks for raw JSON only, with an explicit schema (`leadScore`, `temperature`, `confidence`, `reasoning`, `nextAction`). This is critical because the output feeds directly into a database write — free-form text would require fragile parsing. The code also defensively extracts the JSON block with a regex (`/\{[\s\S]*\}/`) in case the model wraps it in markdown fences, and clamps `leadScore`/`confidence` to 0–100 in case the model drifts outside range.

**Explicit scoring rubric, not just a scale.** Rather than saying "score this lead 0–100," the prompt gives four labeled bands (80–100 Hot, 60–79 Warm, 40–59 Cold, 0–39 Cold) with short definitions of what belongs in each band. LLMs are noticeably more consistent when given anchor points instead of an open-ended numeric scale — it turns a vague judgment call into a classification-with-justification task.

**Reasoning is bounded ("2-3 sentences").** Sales reps scanning a dashboard don't want a paragraph per lead. Constraining reasoning length forces the model to prioritize the *one or two* factors that actually drove the score, which is more useful than an exhaustive breakdown.

**`nextAction` is separated from `reasoning`.** These are different jobs: reasoning explains *why*, next action tells the rep *what to do*. Splitting them into separate fields means the UI can show reasoning in a "details" area and next action as a highlighted call-to-box on the lead detail page (see `app/crm/leads/[id]/page.tsx`), rather than forcing the frontend to parse one field for two different purposes.

**Confidence is separate from score.** A lead can get a middling score with high confidence ("clearly a $500 budget hobby project, low fit — I'm sure") or a high score with lower confidence ("promising but the description is thin"). Keeping these independent gives the sales team a second axis to prioritize follow-up calls versus emails.

### Current prompt (from `lib/ai-service.ts`)
```
You are an expert lead qualification specialist. Analyze the following lead
information and provide a structured qualification result.

Lead Information:
- Industry: {industry}
- Company Size: {companySize}
- Estimated Budget: ${estimatedBudget}
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

Be concise and practical in your reasoning and next actions.
```

### Known limitations & next iterations
- The rubric is generic (not tuned to a specific business's actual ICP). In production, this prompt should be seeded with 5–10 real examples of what "Hot" vs "Cold" looks like for *this* company (few-shot examples usually outperform a rubric alone).
- Budget is passed as a raw number with no currency/region normalization — a $50,000 budget means something very different for an enterprise SaaS deal vs. a local retail project. A production version would pass in industry-specific budget bands.
- The model has no memory of past qualified leads, so it can't learn from what your team has actually closed. A future iteration could inject a short "here's what a lead that converted looked like" example, refreshed periodically.

## 2. Personalized Follow-Up Email Prompt (bonus feature)

### Goal
Generate a short, non-templated email that references the lead's actual project — used for the optional "AI-personalized follow-up email" bonus feature.

### Design decisions
- **Explicit length constraint (3–4 sentences)** — prevents the model from writing a full sales pitch, which would feel robotic and reduce reply rates.
- **No subject line or greeting requested** — the email service already owns subject-line logic and salutation formatting (`lib/email-service.ts`), so the prompt is scoped to just the body content it can't easily template. This avoids the model re-deciding formatting decisions that are already handled deterministically elsewhere.
- **Graceful fallback** — if the AI call fails (rate limit, network, malformed response), `generatePersonalizedEmail` returns an empty string rather than throwing, so lead creation and the acknowledgement email still succeed. AI personalization is treated as an enhancement, not a dependency, for the core flow.

## 3. General principles applied across both prompts
1. **Deterministic-shaped output for anything hitting the database.** Free text is fine for a chat UI; it is not fine for a field the frontend renders directly into a colored "Hot/Warm/Cold" badge.
2. **Fail open, not closed.** If AI qualification fails, the lead is still saved and the acknowledgement email still sends (see `app/api/leads/route.ts`) — a broken AI call should never block lead capture.
3. **Constrain length before constraining content.** Telling the model "be concise" is weaker than telling it "2-3 sentences" — specific, checkable constraints produce more consistent output length than vague adjectives.
