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

const optionalString = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : null

const optionalBoolean = (value: unknown) =>
  typeof value === 'boolean' ? value : null

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
    const mode = body?.mode === 'next-appointment'
      ? 'next-appointment'
      : body?.mode === 'first-appointment'
        ? 'first-appointment'
        : null
    const symptoms = typeof body?.symptoms === 'string' ? body.symptoms.trim() : ''
    const severity = typeof body?.severity === 'number' && Number.isFinite(body.severity)
      ? body.severity
      : null
    const duration = typeof body?.duration === 'string' && body.duration.trim()
      ? body.duration.trim()
      : null

    if (!mode) {
      return new Response(
        JSON.stringify({ error: 'Mode must be first-appointment or next-appointment.' }),
        { status: 400, headers: responseHeaders },
      )
    }

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

    let promptText: string

    if (mode === 'first-appointment') {
      promptText = `You help a patient prepare concise questions to ask a clinician during a first consultation.

Create approximately 5 directly usable questions based only on the supplied symptom context. Questions may help the patient discuss symptom history, useful information to mention, changes to monitor, understanding the clinician's assessment, possible next steps in a neutral way, and when or how to follow up.

Do not diagnose, claim a likely disease, recommend starting, stopping, or changing medicines, direct the patient to obtain a particular test or treatment, replace professional medical advice, or invent facts not supplied below. Phrase possible next steps as neutral questions for the clinician. Keep every question concise and understandable. Do not include markdown, bullets, or numbering in individual question strings.

Return ONLY a valid JSON object in this exact shape:
{
  "questions": [string]
}

Symptom context:
${JSON.stringify({ symptoms, severity, duration })}`
    } else {
      const previousConsultationValue = body?.previousConsultation
      if (!previousConsultationValue || typeof previousConsultationValue !== 'object' || Array.isArray(previousConsultationValue)) {
        return new Response(
          JSON.stringify({ error: 'Previous consultation context is required for next-appointment mode.' }),
          { status: 400, headers: responseHeaders },
        )
      }

      const previousConsultation = {
        notes: optionalString(previousConsultationValue.notes),
        doctorName: optionalString(previousConsultationValue.doctorName),
        clinicName: optionalString(previousConsultationValue.clinicName),
        followUpRecommended: optionalBoolean(previousConsultationValue.followUpRecommended),
        followUpNotes: optionalString(previousConsultationValue.followUpNotes),
        consultationAt: optionalString(previousConsultationValue.consultationAt),
      }

      const followUpValue = body?.latestFollowUp
      const latestFollowUp = followUpValue && typeof followUpValue === 'object' && !Array.isArray(followUpValue)
        ? {
            progress: optionalString(followUpValue.progress),
            currentSymptoms: optionalString(followUpValue.currentSymptoms),
            medicineCompliance: optionalString(followUpValue.medicineCompliance),
            medicineReason: optionalString(followUpValue.medicineReason),
            hasSideEffects: optionalBoolean(followUpValue.hasSideEffects),
            sideEffectsText: optionalString(followUpValue.sideEffectsText),
            questions: optionalString(followUpValue.questions),
            createdAt: optionalString(followUpValue.createdAt),
          }
        : null

      const linkedMedicines = Array.isArray(body?.linkedMedicines)
        ? body.linkedMedicines.flatMap((medicine: unknown) => {
            if (!medicine || typeof medicine !== 'object' || Array.isArray(medicine)) return []
            const value = medicine as Record<string, unknown>
            const item = {
              name: optionalString(value.name),
              dosage: optionalString(value.dosage),
              frequency: optionalString(value.frequency),
              instructions: optionalString(value.instructions),
            }
            return Object.values(item).some(Boolean) ? [item] : []
          })
        : []

      const linkedLabParameters = Array.isArray(body?.linkedLabParameters)
        ? body.linkedLabParameters.flatMap((parameter: unknown) => {
            if (!parameter || typeof parameter !== 'object' || Array.isArray(parameter)) return []
            const value = parameter as Record<string, unknown>
            const item = {
              reportType: optionalString(value.reportType),
              name: optionalString(value.name),
              value: optionalString(value.value),
              unit: optionalString(value.unit),
              referenceRange: optionalString(value.referenceRange),
              status: optionalString(value.status),
            }
            return Object.values(item).some(Boolean) ? [item] : []
          })
        : []

      const longitudinalContext = {
        symptoms,
        severity,
        duration,
        previousConsultation,
        latestFollowUp,
        linkedMedicines,
        linkedLabParameters,
      }

      promptText = `You help a patient prepare concise follow-up questions for their next clinician appointment.

Create approximately 5 directly usable, appointment-ready questions based only on the supplied longitudinal context. Use persisted facts; do not independently interpret them. When meaningful previous-visit context exists, avoid producing only generic first-visit questions. Prefer questions that connect the patient's current situation to the previous consultation and its explicitly linked records.

Prioritize the most relevant available context: changes in symptoms since the previous consultation, whether the previous plan still fits, medicine experience when linked medicines are present, report findings when linked lab data is present, unresolved follow-up concerns, what the clinician wants the patient to monitor, and follow-up timing or next steps. Do not mechanically force every category into the output.

Linked prescription facts are valid context and should not be ignored merely because they are medical information. You may repeat supplied medicine names, dosage, frequency, and instructions in neutral clarification questions. For example, when supported by the context, ask whether ongoing symptoms while taking a named medicine as instructed should be reassessed, what the patient should monitor while taking it, or how long to continue the plan previously discussed. Never instruct the patient to start, stop, change, or adjust medication, and never invent side effects, risks, or instructions.

Linked lab facts are valid context and should be used when relevant. You may repeat supplied parameter names, values, units, printed reference ranges, and report-provided statuses such as high, low, abnormal, normal, or outside range. Treat every status as a persisted fact supplied by the report, not as your own interpretation. If a status is supplied, you may ask what that reported status means for the prior plan or current visit. If no status is supplied, you may neutrally quote the persisted numeric result and printed reference range and ask the clinician to explain it. Never independently label a value high, low, abnormal, normal, or clinically significant.

You may also use persisted consultation notes and follow-up details to form specific clarification questions. Do not diagnose, claim or infer that a disease is present, independently decide clinical significance, recommend a treatment, independently recommend a specific test, invent facts, or invent relationships between symptoms, medicines, and test results. Phrase possible implications and next steps only as questions for the clinician.

Keep every question concise. Do not include markdown, bullets, or numbering in individual question strings.

Return ONLY a valid JSON object in this exact shape:
{
  "questions": [string]
}

Longitudinal context:
${JSON.stringify(longitudinalContext)}`
    }

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
