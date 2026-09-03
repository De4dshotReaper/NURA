import type {
  LabParameter,
  LabReportAnalysis,
  NarrativeAnalysisPayload,
  PersistedLabReportRow,
} from '../types';

const nullableString = (value: unknown): string | null =>
  typeof value === 'string' ? value : null;

const parseExplainedItems = <K extends 'finding' | 'term'>(value: unknown, key: K) => {
  if (!Array.isArray(value)) return null;
  const parsed: Array<Record<K, string> & { explanation: string }> = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') return null;
    const source = item as Record<string, unknown>;
    if (typeof source[key] !== 'string' || typeof source.explanation !== 'string') return null;
    parsed.push({ [key]: source[key], explanation: source.explanation } as Record<K, string> & { explanation: string });
  }
  return parsed;
};

export const parseNarrativeAnalysis = (value: unknown): NarrativeAnalysisPayload | null => {
  if (!value || typeof value !== 'object') return null;
  const source = value as Record<string, unknown>;
  if (typeof source.summary !== 'string' || !source.summary.trim()) return null;
  const keyFindings = parseExplainedItems(source.key_findings, 'finding');
  const termsExplained = parseExplainedItems(source.terms_explained, 'term');
  if (!keyFindings || !termsExplained) return null;

  return {
    report_type: nullableString(source.report_type),
    body_part_or_test: nullableString(source.body_part_or_test),
    report_date: nullableString(source.report_date),
    laboratory: nullableString(source.laboratory),
    summary: source.summary,
    key_findings: keyFindings,
    impression: nullableString(source.impression),
    terms_explained: termsExplained,
  };
};

export const analysisFromLabReportRow = (row: PersistedLabReportRow): LabReportAnalysis | null => {
  if (row.analysis_type === 'narrative') {
    const narrative = parseNarrativeAnalysis(row.narrative_analysis);
    return narrative ? { analysis_type: 'narrative', ...narrative } : null;
  }

  return {
    analysis_type: 'structured',
    reportFormat: 'structured',
    reportType: row.report_type ?? null,
    laboratory: row.laboratory ?? null,
    reportDate: row.report_date ?? null,
    rawText: row.raw_text ?? null,
    parameters: Array.isArray(row.parameters) ? row.parameters as LabParameter[] : [],
  };
};
