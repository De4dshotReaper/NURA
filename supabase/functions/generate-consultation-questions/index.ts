import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const responseHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json',
}

interface ConsultationQuestionsResponse {
  questions?: unknown
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Please use POST.' }),
      { status: 405, headers: responseHeaders },
    )
  }

  try {
    const body = await req.json()
    const symptoms = typeof body?.symptoms === 'string' ? body.symptoms.trim() : ''
    const severity = typeof body?.severity === 'number' && Number.isFinite(body.severity)
      ? body.severity
      : null
    const duration = typeof body?.duration === 'string' && body.duration.trim()
      ? body.duration.trim()
      : null

    if (!symptoms) {
      return new Response(
        JSON.stringify({ error: 'Symptoms must be a non-empty string.' }),
        { status: 400, headers: responseHeaders },
      )
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: GEMINI_API_KEY is not configured.' }),
        { status: 500, headers: responseHeaders },
      )
    }

    const promptText = `You help a patient prepare concise questions to ask a clinician during a first consultation.

Create approximately 5 directly usable questions based only on the supplied symptom context. Questions may help the patient discuss symptom history, useful information to mention, changes to monitor, understanding the clinician's assessment, possible next steps in a neutral way, and when or how to follow up.

Do not diagnose, claim a likely disease, recommend starting, stopping, or changing medicines, direct the patient to obtain a particular test or treatment, replace professional medical advice, or invent facts not supplied below. Phrase possible next steps as neutral questions for the clinician. Keep every question concise and understandable. Do not include markdown, bullets, or numbering in individual question strings.

Return ONLY a valid JSON object in this exact shape:
{
  "questions": [string]
}

Symptom context:
${JSON.stringify({ symptoms, severity, duration })}`

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            response_mime_type: 'application/json',
            response_schema: {
              type: 'OBJECT',
              properties: {
                questions: {
                  type: 'ARRAY',
                  items: { type: 'STRING' },
                  minItems: 1,
                  maxItems: 5,
                },
              },
              required: ['questions'],
            },
          },
        }),
      },
    )

    if (!geminiResponse.ok) {
      const upstreamBody = await geminiResponse.text()
      console.error('Gemini API returned an error while generating consultation questions:', {
        status: geminiResponse.status,
        statusText: geminiResponse.statusText,
        body: upstreamBody,
      })
      return new Response(
        JSON.stringify({ error: 'Unable to generate consultation questions.' }),
        { status: 502, headers: responseHeaders },
      )
    }

    const geminiResult = await geminiResponse.json()
    const responseText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text
    if (typeof responseText !== 'string' || !responseText.trim()) {
      return new Response(
        JSON.stringify({ error: 'Received empty response from Gemini model.' }),
        { status: 502, headers: responseHeaders },
      )
    }

    let parsedResult: ConsultationQuestionsResponse
    try {
      const cleanedText = responseText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim()
      parsedResult = JSON.parse(cleanedText)
    } catch {
      return new Response(
        JSON.stringify({ error: 'Gemini returned invalid JSON.' }),
        { status: 502, headers: responseHeaders },
      )
    }

    const questions = Array.isArray(parsedResult.questions)
      ? parsedResult.questions
          .filter((question): question is string => typeof question === 'string')
          .map((question) => question.trim())
          .filter(Boolean)
          .slice(0, 5)
      : []

    if (questions.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Gemini returned an invalid questions response.' }),
        { status: 502, headers: responseHeaders },
      )
    }

    return new Response(
      JSON.stringify({ questions }),
      { status: 200, headers: responseHeaders },
    )
  } catch (error) {
    console.error('Consultation question generation failed:', error instanceof Error ? error.message : error)
    return new Response(
      JSON.stringify({ error: 'Unable to generate consultation questions.' }),
      { status: 500, headers: responseHeaders },
    )
  }
})
