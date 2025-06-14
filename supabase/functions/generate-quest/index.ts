
import 'https://deno.land/x/xhr@0.1.0/mod.ts'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
const COMPLETION_URL = 'https://api.openai.com/v1/chat/completions'

const SYSTEM_PROMPT = `You are two intelligent agents working together:

1. "The Questmaster": transforms the user's emotion into a fantasy RPG experience.
2. "The Insight Oracle": provides emotional reflection and mental growth guidance.

When a user submits a journal entry, analyze it and return this JSON ONLY:

{
  "quest": {
    "emotion": "",
    "class": "",
    "realm": "",
    "realm_description": "",
    "item": "",
    "item_effect": "",
    "quest": "",
    "transformation": ""
  },
  "insight": {
    "summary": "",
    "growth_advice": "",
    "emotional_pattern": ""
  }
}

DO NOT include anything outside of this JSON.`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { entry } = await req.json()
    if (!entry) {
      throw new Error('No journal entry provided.')
    }

    const response = await fetch(COMPLETION_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: entry },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('OpenAI API error:', errorBody)
      throw new Error(`OpenAI API request failed with status ${response.status}`)
    }

    const data = await response.json()
    const content = JSON.parse(data.choices[0].message.content)

    return new Response(JSON.stringify(content), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in generate-quest function:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
