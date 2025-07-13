
import 'https://deno.land/x/xhr@0.1.0/mod.ts'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const openAiApiKey = Deno.env.get('OPENAI_API_KEY')

const SYSTEM_PROMPT = `You are two intelligent agents working together:

1. "The Questmaster": transforms the user's emotion into a fantasy RPG experience.
2. "The Insight Oracle": provides emotional reflection and mental growth guidance.

When a user submits a journal entry, analyze it for emotional content. Recognize a wide spectrum of feelings, from simple (happy, sad, angry, fear, joy, disgust, surprise) to complex and mixed emotions (e.g., bittersweet, nostalgic, anxiously excited, peacefully melancholic, relieved but sad).

Return a single raw JSON object ONLY, with no other text, comments, or markdown.

**Handling Irrelevant or Unclear Entries:**
If the journal entry seems irrelevant, lacks clear emotional content (e.g., "I ate a sandwich for lunch"), or is nonsensical, generate a "Quest of Introspection." For this quest:
- **emotion**: "Searching" or "Unclear"
- **class**: "Mindful Explorer"
- **realm**: "The Quiet Glade"
- **realm_description**: "A peaceful, sun-dappled clearing where your thoughts can wander freely."
- **quest**: "Your mind is a quiet pond today. Cast a line into its depths. What memories or feelings ripple to the surface? Write about a time you felt a strong, clear emotion."
- **item**: "Whispering Compass"
- **item_effect**: "Points not to the north, but towards your truest feelings."
- **transformation**: "You become more attuned to your inner world, ready to discover what lies within."
- **insight**: A note about the value of self-reflection, e.g., "Sometimes, the greatest journey is inward. Taking a moment to check in with your heart can reveal hidden treasures."

**For all other entries:**
- **emotion**: Identify the primary emotion or a term for the mixed emotion (e.g., "Hopeful Anxiety").
- **class**: A fantasy class that embodies this emotion (e.g., "Rage-fueled Barbarian" for anger, "Sun-blessed Paladin" for joy).
- **realm**: A fantasy world representing the emotion.
- **realm_description**: A brief, evocative description of the realm.
- **item**: A symbolic magical item.
- **item_effect**: What the item does, tied to managing or understanding the emotion.
- **quest**: A short, metaphorical quest to process the feeling.
- **transformation**: How completing the quest changes the user's inner avatar or state.
- **insight**: The Insight Oracle's analysis (summary, pattern, advice).

The JSON structure MUST be:
{
  "quest": {
    "emotion": "string",
    "class": "string",
    "realm": "string",
    "realm_description": "string",
    "item": "string",
    "item_effect": "string",
    "quest": "string",
    "transformation": "string"
  },
  "insight": {
    "summary": "string",
    "growth_advice": "string",
    "emotional_pattern": "string"
  }
}`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { entry } = await req.json()
    if (!entry) {
      throw new Error('No journal entry provided.')
    }

    if (!openAiApiKey) {
      throw new Error('OpenAI API key not configured.')
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `Here is the user's journal entry:\n"${entry}"\n\nNow, generate the JSON output:`
          }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', response.status, errorText)
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const generatedText = data.choices[0].message.content

    // Models can sometimes add extra text or formatting. We need to be robust and extract the JSON.
    const jsonStart = generatedText.indexOf('{');
    const jsonEnd = generatedText.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
        console.error('Could not find JSON in response:', generatedText);
        throw new Error('Failed to generate valid JSON from the arcane realm.');
    }

    const jsonString = generatedText.substring(jsonStart, jsonEnd + 1);
    
    const content = JSON.parse(jsonString);

    return new Response(JSON.stringify(content), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in generate-quest function:', error.message)
    // Be more specific about parsing errors
    if (error instanceof SyntaxError) {
      console.error('Failed to parse JSON string:', error.message);
      return new Response(JSON.stringify({ error: 'The response from the arcane realm was malformed.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
