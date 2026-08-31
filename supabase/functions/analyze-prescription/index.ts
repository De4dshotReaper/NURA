import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const languageNames = {
  en: 'English',
  hi: 'Hindi',
  mr: 'Marathi',
} as const

const resolveLanguage = (value: unknown) => {
  const code = value === 'hi' || value === 'mr' ? value : 'en'
  return { code, name: languageNames[code] }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Please use POST.' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return new Response(
        JSON.stringify({ error: 'Content type must be multipart/form-data containing the prescription image file.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') || formData.get('image')
    const language = resolveLanguage(formData.get('language'))

    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: 'No image file provided under form field "file" or "image".' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const mimeType = file.type
    if (mimeType !== 'image/jpeg' && mimeType !== 'image/jpg' && mimeType !== 'image/png') {
      return new Response(
        JSON.stringify({ error: `Unsupported file type: "${mimeType}". Only JPG, JPEG, and PNG images are supported.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: GEMINI_API_KEY is not configured.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    let binaryString = ''
    const chunkSize = 8192
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize)
      binaryString += String.fromCharCode.apply(null, chunk as unknown as number[])
    }
    const base64Image = btoa(binaryString)

    // Call Gemini API (gemin-2.5-flash or gemini-1.5-flash)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${geminiApiKey}`

    const promptText = `You are a medical prescription text extractor. Analyze the attached prescription image and extract ONLY the information clearly visible in the prescription. 
The requested interface language is ${language.name}. This extraction must remain faithful to the source document: do not translate or rewrite medicine names, dosage, frequency, instructions, diagnosis text, doctor name, date, or raw text. This response has no generated explanatory prose.
Do not invent missing medicine names, dosages, frequencies, or instructions. 
If text is unclear, return null or mark it as unclear rather than guessing.
Do not generate medicine explanations, side effects, or medical advice.

Return ONLY a valid JSON object in this exact shape without any markdown wrapping or extra text:
{
  "medicines": [
    {
      "name": string | null,
      "dosage": string | null,
      "frequency": string | null,
      "instructions": string | null,
      "confidence": "high" | "medium" | "low"
    }
  ],
  "rawText": string | null
}`

    const geminiPayload = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image
              }
            }
          ]
        }
      ],
      generationConfig: {
        response_mime_type: "application/json"
      }
    }

    let geminiResponse
    try {
      geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(geminiPayload)
      })
    } catch (err) {
      console.error('Gemini fetch failure:', err instanceof Error ? err.message : err, err instanceof Error ? err.stack : '')
      return new Response(
        JSON.stringify({
          error: 'Gemini API request failed',
          details: err instanceof Error ? err.message : 'Unknown network error'
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text()
      console.error('Gemini API returned error:', {
        status: geminiResponse.status,
        statusText: geminiResponse.statusText,
        body: errText
      })
      return new Response(
        JSON.stringify({
          error: "Gemini API request failed",
          upstreamStatus: geminiResponse.status,
          upstreamStatusText: geminiResponse.statusText,
          upstreamBody: errText
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const geminiResult = await geminiResponse.json()
    const responseText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text

    if (!responseText) {
      return new Response(
        JSON.stringify({ error: 'Received empty response from Gemini model.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let parsedResult
    try {
      // Clean potential markdown code blocks if any
      const cleanedText = responseText.replace(/^```json\s*([\s\S]*?)\s*```$/, '$1').trim()
      parsedResult = JSON.parse(cleanedText)
    } catch (_e) {
      parsedResult = {
        medicines: [],
        rawText: responseText
      }
    }

    return new Response(
      JSON.stringify(parsedResult),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
