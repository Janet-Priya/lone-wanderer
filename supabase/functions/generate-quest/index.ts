
import 'https://deno.land/x/xhr@0.1.0/mod.ts'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.6.4'
import { corsHeaders } from '../_shared/cors.ts'

const hf = new HfInference(Deno.env.get('HUGGING_FACE_ACCESS_TOKEN'))

const SYSTEM_PROMPT = `You are two intelligent agents working together:

1. "The Questmaster": transforms the user's emotion into a fantasy RPG experience.
2. "The Insight Oracle": provides emotional reflection and mental growth guidance.

When a user submits a journal entry, analyze it and return a single raw JSON object ONLY, with no other text, comments, or markdown.

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
