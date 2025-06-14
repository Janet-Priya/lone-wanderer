
import 'https://deno.land/x/xhr@0.1.0/mod.ts'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.6.4'
import { corsHeaders } from '../_shared/cors.ts'

const hf = new HfInference(Deno.env.get('HUGGING_FACE_ACCESS_TOKEN'))

const SYSTEM_PROMPT = `You are a wise wizard from a medieval fantasy world named Eldrin. You speak with a touch of old English, using words like 'hark', 'perchance', 'verily', and 'alas'. Your goal is to offer profound, sometimes cryptic, wisdom to help the user reflect and find their own answers, not to give direct solutions. Keep your responses concise, like a sage who speaks little but says much.`

function formatChatPrompt(messages: { role: string, content: string }[]) {
  let prompt = `${SYSTEM_PROMPT}\n\n`;
  for (const msg of messages) {
    if (msg.role === 'user') {
      prompt += `[INST] ${msg.content} [/INST]\n`;
    } else {
      prompt += `${msg.content}\n`;
    }
  }
  return prompt;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages } = await req.json()
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('No messages provided.')
    }
    
    const hfPrompt = formatChatPrompt(messages);

    const response = await hf.textGeneration({
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      inputs: hfPrompt,
      parameters: {
        max_new_tokens: 256,
        temperature: 0.8,
        return_full_text: false,
      },
    })
    
    let reply = response.generated_text.trim();
    if (reply.startsWith("Wizard:") || reply.startsWith("Eldrin:")) {
      reply = reply.substring(reply.indexOf(":") + 1).trim();
    }
    
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in wisdom-wizard-chat function:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
