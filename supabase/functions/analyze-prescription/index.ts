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

const responseHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json',
}

const nullableString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value : null

const allowedConfidence = new Set(['high', 'medium', 'low'])

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
        JSON.stringify({ error: 'Content type must be multipart/form-data containing the prescription file.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') || formData.get('image')
    const language = resolveLanguage(formData.get('language'))

    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: 'No prescription file provided under form field "file" or "image".' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const suppliedMimeType = file.type.toLowerCase()
    const lowerFileName = file.name.toLowerCase()
    const mimeType = suppliedMimeType || (
      lowerFileName.endsWith('.pdf') ? 'application/pdf'
        : lowerFileName.endsWith('.png') ? 'image/png'
          : lowerFileName.endsWith('.jpg') || lowerFileName.endsWith('.jpeg') ? 'image/jpeg'
            : ''
    )
    if (!['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(mimeType)) {
      return new Response(
        JSON.stringify({ error: `Unsupported file type: "${file.type}". Only PDF, JPG, JPEG, and PNG files are supported.` }),
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

    // Gemini accepts both prescription images and PDFs as inline document data.
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    let binaryString = ''
    const chunkSize = 8192
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize)
      binaryString += String.fromCharCode.apply(null, chunk as unknown as number[])
    }
    const base64Document = btoa(binaryString)

    // Call Gemini API (gemin-2.5-flash or gemini-1.5-flash)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${geminiApiKey}`

    const promptText = `You are a conservative medical prescription text extractor. Analyze the attached prescription document and extract ONLY the information clearly visible in the prescription.
The requested interface language is ${language.name}. This extraction must remain faithful to the source document: do not translate or rewrite medicine names, dosage, frequency, instructions, diagnosis text, doctor name, date, or raw text. This response has no generated explanatory prose.
Do not invent missing medicine names, dosages, frequencies, or instructions. 
If text is unclear, return null or mark it as unclear rather than guessing.
Do not generate medicine explanations, side effects, or medical advice.
If the document is unrelated, unreadable, malformed, or is not a prescription containing at least one clearly identifiable medicine, return an empty medicines array and null rawText.

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
                data: base64Document
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

    let parsedResult: Record<string, unknown>
    try {
      // Clean potential markdown code blocks if any
      const cleanedText = responseText.replace(/^```json\s*([\s\S]*?)\s*```$/, '$1').trim()
      parsedResult = JSON.parse(cleanedText)
    } catch {
      return new Response(
        JSON.stringify({ error: 'Gemini returned invalid JSON.' }),
        { status: 502, headers: responseHeaders }
      )
    }

    const sourceMedicines = Array.isArray(parsedResult.medicines) ? parsedResult.medicines : []
    const medicines = sourceMedicines.map((medicine) => {
      const source = medicine && typeof medicine === 'object'
        ? medicine as Record<string, unknown>
        : {}
      const confidence = typeof source.confidence === 'string' && allowedConfidence.has(source.confidence)
        ? source.confidence
        : null

      return {
        name: nullableString(source.name),
        dosage: nullableString(source.dosage),
        frequency: nullableString(source.frequency),
        instructions: nullableString(source.instructions),
        confidence,
      }
    }).filter((medicine) => medicine.name)

    if (medicines.length === 0) {
      return new Response(
        JSON.stringify({ error: 'The uploaded document could not be identified as a readable prescription.' }),
        { status: 422, headers: responseHeaders }
      )
    }

    return new Response(
      JSON.stringify({
        medicines,
        rawText: nullableString(parsedResult.rawText),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
