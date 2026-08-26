import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MedicineExplanation {
  name: string
  whatItsFor: string | null
  commonSideEffects: string[]
  thingsToRemember: string[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Please use POST.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { medicineNames } = await req.json()
    const names = Array.isArray(medicineNames)
      ? medicineNames.filter((name): name is string => typeof name === 'string' && name.trim().length > 0).map((name) => name.trim())
      : []

    if (names.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Provide at least one extracted medicine name.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const promptText = `You provide concise, general educational medicine information. For each medicine name below, return information only when you can identify that medicine confidently. Preserve each supplied medicine name exactly in the response.

Do not diagnose conditions, recommend whether to take a medicine, prescribe or change doses, determine treatment duration, infer why a specific patient received it, or invent prescription instructions. “whatItsFor” must describe common/general uses only, for example: “Commonly used to reduce fever and relieve mild to moderate pain.”

If a medicine cannot be identified confidently, use null for whatItsFor and empty arrays for commonSideEffects and thingsToRemember. Keep each field concise and general.

Return ONLY a valid JSON object in this exact shape, with no markdown or additional text:
{
  "medicines": [
    {
      "name": string,
      "whatItsFor": string | null,
      "commonSideEffects": string[],
      "thingsToRemember": string[]
    }
  ]
}

Medicine names:
${JSON.stringify(names)}`

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { response_mime_type: 'application/json' },
        }),
      }
    )

    if (!geminiResponse.ok) {
      console.error('Gemini API returned an error:', geminiResponse.status, await geminiResponse.text())
      return new Response(
        JSON.stringify({ error: 'Unable to generate general medicine information.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const geminiResult = await geminiResponse.json()
    const responseText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text
    if (!responseText) {
      return new Response(
        JSON.stringify({ error: 'Unable to generate general medicine information.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let parsedResult: { medicines?: MedicineExplanation[] }
    try {
      parsedResult = JSON.parse(responseText.replace(/^```json\s*([\s\S]*?)\s*```$/, '$1').trim())
    } catch {
      parsedResult = { medicines: [] }
    }

    const medicines = Array.isArray(parsedResult.medicines)
      ? parsedResult.medicines.map((medicine) => ({
          name: typeof medicine.name === 'string' ? medicine.name : '',
          whatItsFor: typeof medicine.whatItsFor === 'string' ? medicine.whatItsFor : null,
          commonSideEffects: Array.isArray(medicine.commonSideEffects)
            ? medicine.commonSideEffects.filter((item): item is string => typeof item === 'string')
            : [],
          thingsToRemember: Array.isArray(medicine.thingsToRemember)
            ? medicine.thingsToRemember.filter((item): item is string => typeof item === 'string')
            : [],
        })).filter((medicine) => medicine.name)
      : []

    return new Response(
      JSON.stringify({ medicines }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Medicine explanation function failed:', error instanceof Error ? error.message : error)
    return new Response(
      JSON.stringify({ error: 'Unable to generate general medicine information.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
