
import 'https://deno.land/x/xhr@0.1.0/mod.ts'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.6.4'
import { corsHeaders } from '../_shared/cors.ts'

const hf = new HfInference(Deno.env.get('HUGGING_FACE_ACCESS_TOKEN'))

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
    
    // Construct a prompt that is clear for an instruction-following model
    const hfPrompt = `${SYSTEM_PROMPT}\n\nHere is the user's journal entry:\n"${entry}"\n\nNow, generate the JSON output:`

    const response = await hf.textGeneration({
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      inputs: hfPrompt,
      parameters: {
        max_new_tokens: 1024,
        temperature: 0.7,
        return_full_text: false, // We only want the generated part
      },
    })

    const generatedText = response.generated_text;

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
