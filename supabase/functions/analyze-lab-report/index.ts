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

const unsupportedReport = {
  analysis_type: 'unsupported',
  reportFormat: 'unsupported',
  reportType: null,
  laboratory: null,
  reportDate: null,
  parameters: [],
  rawText: null,
}

const allowedStatuses = new Set([
  'Normal',
  'Below Range',
  'Above Range',
  'Outside Range',
  'Unknown',
])

const nullableString = (value: unknown): string | null =>
  typeof value === 'string' ? value : null

const explainedItems = (value: unknown, labelKey: 'finding' | 'term') =>
  Array.isArray(value) ? value.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const source = item as Record<string, unknown>
    const label = nullableString(source[labelKey])
    const explanation = nullableString(source.explanation)
    return label && explanation ? [{ [labelKey]: label, explanation }] : []
  }) : []

const responseHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Please use POST.' }),
        { status: 405, headers: responseHeaders },
      )
    }

    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return new Response(
        JSON.stringify({ error: 'Content type must be multipart/form-data containing the lab report file.' }),
        { status: 400, headers: responseHeaders },
      )
    }

    const formData = await req.formData()
    const file = formData.get('file')
    const language = resolveLanguage(formData.get('language'))
    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: 'No lab report file provided under form field "file".' }),
        { status: 400, headers: responseHeaders },
      )
    }

    const mimeType = file.type.toLowerCase()
    if (!['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(mimeType)) {
      return new Response(
        JSON.stringify({ error: `Unsupported file type: "${file.type}". Only PDF, JPG, JPEG, and PNG files are supported.` }),
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

    const bytes = new Uint8Array(await file.arrayBuffer())
    let binary = ''
    const chunkSize = 8192
    for (let index = 0; index < bytes.length; index += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
    }
    const base64Document = btoa(binary)

    const promptText = `You are a conservative medical-report extractor for Nura. Analyze only the attached document.

Classify the document from its content as exactly one analysis_type:
- "structured": primarily a genuine laboratory panel with clearly identifiable measurable test parameters, measured values, and printed reference ranges (for example CBC, lipid, liver, renal, thyroid, glucose/HbA1c, vitamin, or mineral panels).
- "narrative": primarily a supported diagnostic imaging report (X-ray, ultrasound, CT, or MRI) whose findings, observations, or impression are prose rather than a numerical parameter table.
- "unsupported": anything else, including unrelated or unreadable documents and documents that cannot confidently be classified. Do not treat arbitrary pathology or histopathology as narrative.

For structured reports, preserve the existing extraction behavior below. Never invent or infer test names, values, units, reference ranges, laboratory names, dates, or text. Use null when an item is absent or unreadable. Extract every clearly identifiable measurable parameter, not only abnormal ones. Use the report's printed reference range to determine status; never substitute generic ranges. If a reliable comparison is not possible, use "Unknown".

For narrative reports, explain only what the report says, simplify terminology, summarize documented findings, and simplify an explicit Impression, Conclusion, Opinion, or Summary section if present. Set impression to null if no such explicit section exists; never generate a diagnostic impression. Extract only meaningful findings actually present and only terms present in the report. Do not generate questions for the user. Do not diagnose, infer an unstated diagnosis, recommend treatment or medication changes, characterize danger, add severity not explicitly stated, invent findings, or contradict the source. Use source-grounded phrasing such as "The report notes..." and "The impression section states..."; do not say "You have..." or "This confirms..." except as a clearly attributed statement from the report.

Explanations are educational and conservative. simpleExplanation explains what the test generally measures in plain language. meaningOfResult only states how the extracted value compares with the reference range printed on this report. Do not diagnose, claim conditions, infer patient-specific causes, recommend treatment, or advise medication changes.

Write only generated explanatory values in clear, natural ${language.name}${language.code === 'en' ? '' : ' using Devanagari script'}. For structured reports these are subtitle, shortExplanation, simpleExplanation, and meaningOfResult. For narrative reports these are summary, key_findings[].explanation, and terms_explained[].explanation. Keep source facts and identifiers faithful: do not translate or rewrite report/test names, laboratory, dates, parameter names, values, units, reference ranges, rawText, medicine names, or anatomical names where translation would change the medical identifier. Keep structured status enum values exactly as specified. Do not translate JSON property names.

Return ONLY valid JSON with no markdown or extra text. For structured reports return exactly this shape:
{
  "analysis_type": "structured",
  "reportFormat": "structured" | "unsupported",
  "reportType": string | null,
  "laboratory": string | null,
  "reportDate": string | null,
  "parameters": [
    {
      "id": "1",
      "name": string,
      "subtitle": string | null,
      "value": string | null,
      "unit": string | null,
      "referenceRange": string | null,
      "status": "Normal" | "Below Range" | "Above Range" | "Outside Range" | "Unknown",
      "shortExplanation": string | null,
      "simpleExplanation": string | null,
      "meaningOfResult": string | null
    }
  ],
  "rawText": string | null
}

For narrative reports return exactly:
{
  "analysis_type": "narrative",
  "report_type": string | null,
  "body_part_or_test": string | null,
  "report_date": string | null,
  "laboratory": string | null,
  "summary": string,
  "key_findings": [{ "finding": string, "explanation": string }],
  "impression": string | null,
  "terms_explained": [{ "term": string, "explanation": string }]
}

For unsupported documents, return exactly:
{
  "analysis_type": "unsupported",
  "reportFormat": "unsupported",
  "reportType": null,
  "laboratory": null,
  "reportDate": null,
  "parameters": [],
  "rawText": null
}`

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: promptText },
              { inline_data: { mime_type: mimeType, data: base64Document } },
            ],
          }],
          generationConfig: { response_mime_type: 'application/json' },
        }),
      },
    )

    if (!geminiResponse.ok) {
      const upstreamBody = await geminiResponse.text()
      console.error('Gemini API returned error:', {
        status: geminiResponse.status,
        statusText: geminiResponse.statusText,
        body: upstreamBody,
      })
      return new Response(
        JSON.stringify({
          error: 'Gemini API request failed',
          upstreamStatus: geminiResponse.status,
          upstreamStatusText: geminiResponse.statusText,
          upstreamBody,
        }),
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

    let parsedResult: Record<string, unknown>
    try {
      const cleanedText = responseText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim()
      parsedResult = JSON.parse(cleanedText)
    } catch {
      return new Response(
        JSON.stringify({ error: 'Gemini returned invalid JSON.', upstreamBody: responseText }),
        { status: 502, headers: responseHeaders },
      )
    }

    if (parsedResult.analysis_type === 'narrative') {
      const summary = nullableString(parsedResult.summary)
      if (!summary) {
        return new Response(JSON.stringify(unsupportedReport), { status: 200, headers: responseHeaders })
      }

      return new Response(JSON.stringify({
        analysis_type: 'narrative',
        report_type: nullableString(parsedResult.report_type),
        body_part_or_test: nullableString(parsedResult.body_part_or_test),
        report_date: nullableString(parsedResult.report_date),
        laboratory: nullableString(parsedResult.laboratory),
        summary,
        key_findings: explainedItems(parsedResult.key_findings, 'finding'),
        impression: nullableString(parsedResult.impression),
        terms_explained: explainedItems(parsedResult.terms_explained, 'term'),
      }), { status: 200, headers: responseHeaders })
    }

    if (parsedResult.analysis_type !== 'structured' && parsedResult.reportFormat !== 'structured') {
      return new Response(JSON.stringify(unsupportedReport), { status: 200, headers: responseHeaders })
    }

    if (!Array.isArray(parsedResult.parameters) || parsedResult.parameters.length === 0) {
      return new Response(JSON.stringify(unsupportedReport), { status: 200, headers: responseHeaders })
    }

    const parameters = parsedResult.parameters.map((parameter, index) => {
      const source = parameter && typeof parameter === 'object'
        ? parameter as Record<string, unknown>
        : {}
      const status = typeof source.status === 'string' && allowedStatuses.has(source.status)
        ? source.status
        : 'Unknown'

      return {
        id: String(index + 1),
        name: nullableString(source.name) ?? '',
        subtitle: nullableString(source.subtitle),
        value: nullableString(source.value),
        unit: nullableString(source.unit),
        referenceRange: nullableString(source.referenceRange),
        status,
        shortExplanation: nullableString(source.shortExplanation),
        simpleExplanation: nullableString(source.simpleExplanation),
        meaningOfResult: nullableString(source.meaningOfResult),
      }
    }).filter((parameter) => parameter.name)

    if (parameters.length === 0) {
      return new Response(JSON.stringify(unsupportedReport), { status: 200, headers: responseHeaders })
    }

    return new Response(
      JSON.stringify({
        analysis_type: 'structured',
        reportFormat: 'structured',
        reportType: nullableString(parsedResult.reportType),
        laboratory: nullableString(parsedResult.laboratory),
        reportDate: nullableString(parsedResult.reportDate),
        parameters,
        rawText: nullableString(parsedResult.rawText),
      }),
      { status: 200, headers: responseHeaders },
    )
  } catch (error) {
    console.error('Lab report analysis failed:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown internal server error' }),
      { status: 500, headers: responseHeaders },
    )
  }
})
