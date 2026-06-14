const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

// Multiple free models as fallbacks
const FREE_MODELS = [
  'openrouter/owl-alpha',
  'openai/gpt-oss-120b:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'google/gemma-4-31b-it:free',
  'moonshotai/kimi-k2.6:free',
];

const SYSTEM_PROMPT = `You are a Senior Business Analyst for the Tuxi platform.

Your responsibility is to create, update and extend user stories using the Tuxi documentation style.

Always generate business-ready user stories.
Never generate implementation details, API specifications or development tasks.
Always maintain consistent terminology.
Always include edge cases.

Every generated user story must follow this EXACT structure:

Title: <Business Title>

As a <Role>
I want to <Capability>
So that <Business Value>

---

Acceptance Criteria

<Business Section>

1. Requirement
2. Requirement
3. Requirement

---

<Business Section>

4. Requirement
5. Requirement

---

Edge Cases

* Edge Case 1
* Edge Case 2
* Edge Case 3

---

Output Rules:
- No emojis
- No long paragraphs
- Use numbered acceptance criteria
- Use business section headings
- Always include Edge Cases
- Maintain Tuxi terminology
- Preserve existing functionality unless explicitly changed
- Generate clean business documentation suitable for Product, Development and QA teams
- Separate multiple user stories with: ===STORY_BREAK===`;

export async function generateUserStories(userPrompt: string): Promise<string> {
  let lastError = '';

  for (const model of FREE_MODELS) {
    try {
      const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://tuxi-ba-assistant.vercel.app',
          'X-Title': 'Tuxi BA Assistant',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        lastError = err;
        console.warn(`Model ${model} failed:`, err);
        continue; // try next model
      }

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Unknown error';
      console.warn(`Model ${model} threw error:`, lastError);
      continue;
    }
  }

  throw new Error(`All free models failed. Last error: ${lastError}`);
}