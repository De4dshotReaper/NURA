import React from 'react';
import { Document, Font, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer';
import i18n, { languageLocale, type SupportedLanguage } from '../../i18n';
import type { VisitPacket } from '../../lib/visitPacket';

const pdfFontFamily = 'NotoSansDevanagari';
let fontRegistered = false;

Font.registerHyphenationCallback((word) => [word]);

const registerPdfFont = () => {
  if (fontRegistered) return;
  Font.register({
    family: pdfFontFamily,
    fonts: [
      { src: `${window.location.origin}/fonts/NotoSansDevanagari.ttf`, fontWeight: 400 },
      { src: `${window.location.origin}/fonts/NotoSansDevanagari.ttf`, fontWeight: 700 },
    ],
  });
  fontRegistered = true;
};

const styles = StyleSheet.create({
  page: { paddingTop: 48, paddingRight: 48, paddingBottom: 55, paddingLeft: 48, fontFamily: pdfFontFamily, fontSize: 9, color: '#1e293b', lineHeight: 1.45 },
  brand: { fontSize: 8, fontWeight: 700, color: '#2563eb', letterSpacing: 1.4 },
  title: { marginTop: 3, fontSize: 20, fontWeight: 700, color: '#0f172a' },
  header: { paddingBottom: 13 },
  metadata: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 10 },
  metadataItem: { width: '30%' },
  label: { fontSize: 7, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6 },
  value: { marginTop: 2, fontSize: 8.5, color: '#0f172a' },
  section: { marginTop: 14, paddingTop: 10, borderTopWidth: 0.7, borderTopColor: '#cbd5e1' },
  sectionTitle: { marginBottom: 7, fontSize: 12, fontWeight: 700, color: '#0f172a' },
  body: { fontSize: 9, lineHeight: 1.5 },
  compactMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 7 },
  block: { marginBottom: 9 },
  borderedBlock: { marginBottom: 9, padding: 8, borderWidth: 0.7, borderColor: '#cbd5e1', borderRadius: 2 },
  date: { marginBottom: 4, fontSize: 7.5, color: '#64748b' },
  blockTitle: { marginBottom: 3, fontSize: 9.5, fontWeight: 700, color: '#0f172a' },
  continuationLabel: { marginTop: 5, marginBottom: 3, fontSize: 8, fontWeight: 700, color: '#64748b' },
  field: { marginTop: 4 },
  table: { marginTop: 5, borderTopWidth: 0.7, borderTopColor: '#94a3b8', borderLeftWidth: 0.7, borderLeftColor: '#cbd5e1' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.7, borderBottomColor: '#cbd5e1' },
  tableHeader: { backgroundColor: '#f1f5f9' },
  tableCell: { paddingVertical: 4, paddingHorizontal: 4, borderRightWidth: 0.7, borderRightColor: '#cbd5e1', fontSize: 7.5 },
  tableHeaderText: { fontWeight: 700, color: '#475569' },
  checkboxRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  checkbox: { width: 9, height: 9, marginTop: 1, borderWidth: 0.8, borderColor: '#475569' },
  timelineRow: { flexDirection: 'row', marginBottom: 4 },
  timelineDate: { width: 125, fontSize: 7.5, color: '#64748b' },
  timelineLabel: { flex: 1, fontSize: 8.5, fontWeight: 700 },
  safety: { marginTop: 15, paddingTop: 9, borderTopWidth: 0.7, borderTopColor: '#cbd5e1', color: '#64748b' },
  safetyTitle: { fontSize: 7, fontWeight: 700, letterSpacing: 0.7 },
  safetyText: { marginTop: 3, fontSize: 7.5, lineHeight: 1.45 },
  footer: { position: 'absolute', left: 48, right: 48, bottom: 22, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 0.5, borderTopColor: '#e2e8f0', paddingTop: 5, fontSize: 7, color: '#94a3b8' },
});

const Metadata: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <View style={styles.metadataItem}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>
);

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <View style={styles.field}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}><Text style={styles.sectionTitle} minPresenceAhead={30}>{title}</Text>{children}</View>
);

const chunksOf = <T,>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size));

const chunkText = (text: string, maxCharacters = 1100) => {
  if (text.length <= maxCharacters) return [text];

  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > maxCharacters) {
    const candidate = remaining.slice(0, maxCharacters + 1);
    const whitespaceIndex = Math.max(candidate.lastIndexOf(' '), candidate.lastIndexOf('\n'), candidate.lastIndexOf('\t'));
    const splitIndex = whitespaceIndex > 0 ? whitespaceIndex : maxCharacters;
    chunks.push(remaining.slice(0, splitIndex));
    remaining = remaining.slice(splitIndex).replace(/^\s+/, '');
  }
  if (remaining) chunks.push(remaining);
  return chunks;
};

interface PdfDocumentProps { packet: VisitPacket; language: SupportedLanguage }

export const VisitPacketPdfDocument: React.FC<PdfDocumentProps> = ({ packet, language }) => {
  const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, { lng: language, ...options });
  const locale = languageLocale[language];
  const formatDateTime = (value: string) => new Date(value).toLocaleString(locale, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  const questionCycles = new Map<string, typeof packet.questions>();
  packet.questions.forEach((question) => {
    const key = question.previousConsultationId ?? 'initial';
    questionCycles.set(key, [...(questionCycles.get(key) ?? []), question]);
  });

  return <Document title="Nura Visit Packet" author="Nura">
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.header}>
        <Text style={styles.brand}>NURA</Text>
        <Text style={styles.title}>{t('visitPacket.title')}</Text>
        <View style={styles.metadata}>
          {packet.patient.displayName && <Metadata label={t('visitPacket.patient')} value={packet.patient.displayName} />}
          <Metadata label={t('visitPacket.episode')} value={packet.episode.title || t('visitPacket.healthEpisode')} />
          <Metadata label={t('visitPacket.started')} value={formatDateTime(packet.episode.startedAt)} />
          <Metadata label={t('visitPacket.status')} value={t(`common.${packet.episode.status}`)} />
          {packet.episode.completedAt && <Metadata label={t('visitPacket.completed')} value={formatDateTime(packet.episode.completedAt)} />}
          <Metadata label={t('visitPacket.generated')} value={formatDateTime(packet.generatedAt)} />
        </View>
      </View>

      <Section title={t('visitPacket.initialSymptoms')}>
        {packet.initialSymptoms ? <View>
          <Text style={styles.body}>{packet.initialSymptoms.symptoms}</Text>
          <View style={styles.compactMeta}>
            {packet.initialSymptoms.severity !== null && <Metadata label={t('visitPacket.severity')} value={`${packet.initialSymptoms.severity}/10`} />}
            {packet.initialSymptoms.duration && <Metadata label={t('visitPacket.duration')} value={packet.initialSymptoms.duration} />}
            <Metadata label={t('visitPacket.recorded')} value={formatDateTime(packet.initialSymptoms.createdAt)} />
          </View>
        </View> : <Text style={styles.body}>{t('visitPacket.initialSymptomsUnavailable')}</Text>}
      </Section>

      {packet.followUps.length > 0 && <Section title={t('visitPacket.progressFollowUps')}>
        {packet.followUps.map((item) => <View key={item.id} style={styles.block}>
          <Text style={styles.date} minPresenceAhead={30}>{formatDateTime(item.createdAt)}</Text>
          {item.progress && <Field label={t('visitPacket.progress')} value={item.progress} />}
          {item.currentSymptoms && <Field label={t('visitPacket.currentSymptoms')} value={item.currentSymptoms} />}
          {item.medicineCompliance && <Field label={t('visitPacket.medicineCompliance')} value={item.medicineCompliance} />}
          {item.medicineReason && <Field label={t('visitPacket.medicineReason')} value={item.medicineReason} />}
          <Field label={t('visitPacket.sideEffects')} value={item.hasSideEffects ? item.sideEffectsText || t('common.yes') : t('common.no')} />
        </View>)}
      </Section>}

      {packet.consultations.length > 0 && <Section title={t('visitPacket.consultationHistory')}>
        {packet.consultations.map((item) => <View key={item.id} style={styles.borderedBlock}>
          <Text style={styles.date} minPresenceAhead={35}>{formatDateTime(item.consultationAt ?? item.createdAt)}</Text>
          {(item.doctorName || item.clinicName) && <Text style={styles.blockTitle}>{[item.doctorName, item.clinicName].filter(Boolean).join(' - ')}</Text>}
          <Text style={styles.body}>{item.notes}</Text>
          <Field label={t('visitPacket.followUpRecommended')} value={item.followUpRecommended ? t('common.yes') : t('common.no')} />
          {item.followUpNotes && <Field label={t('visitPacket.followUpNotes')} value={item.followUpNotes} />}
        </View>)}
      </Section>}

      {packet.prescriptions.length > 0 && <Section title={t('visitPacket.prescriptionsMedicines')}>
        {packet.prescriptions.map((prescription, index) => <View key={prescription.id} style={styles.block}>
          <View wrap={false}><Text style={styles.blockTitle}>{packet.prescriptions.length === 1 ? t('visitPacket.prescription') : t('visitPacket.prescriptionNumber', { number: index + 1 })}</Text><Text style={styles.date}>{prescription.fileName}</Text></View>
          {prescription.medicines.length > 0 && chunksOf(prescription.medicines, 6).map((medicineChunk, chunkIndex) => <View key={chunkIndex} style={styles.table} wrap={false}>
            <View style={[styles.tableRow, styles.tableHeader]}><Text style={[styles.tableCell, styles.tableHeaderText, { width: '24%' }]}>{t('visitPacket.medicine')}</Text><Text style={[styles.tableCell, styles.tableHeaderText, { width: '18%' }]}>{t('visitPacket.dosage')}</Text><Text style={[styles.tableCell, styles.tableHeaderText, { width: '20%' }]}>{t('visitPacket.frequency')}</Text><Text style={[styles.tableCell, styles.tableHeaderText, { width: '38%' }]}>{t('visitPacket.instructions')}</Text></View>
            {medicineChunk.map((medicine, medicineIndex) => <View key={`${medicine.name}-${chunkIndex}-${medicineIndex}`} style={styles.tableRow}><Text style={[styles.tableCell, { width: '24%', fontWeight: 700 }]}>{medicine.name || '-'}</Text><Text style={[styles.tableCell, { width: '18%' }]}>{medicine.dosage || '-'}</Text><Text style={[styles.tableCell, { width: '20%' }]}>{medicine.frequency || '-'}</Text><Text style={[styles.tableCell, { width: '38%' }]}>{medicine.instructions || '-'}</Text></View>)}
          </View>)}
        </View>)}
      </Section>}

      {packet.labReports.length > 0 && <Section title={t('visitPacket.reportsInvestigations')}>
        {packet.labReports.map((report) => <View key={report.id} style={styles.borderedBlock}>
          <Text style={styles.label} minPresenceAhead={report.analysisType === 'structured' ? 300 : 40}>{report.analysisType === 'structured' ? t('visitPacket.structuredReport') : t('visitPacket.narrativeReport')}</Text>
          <Text style={styles.blockTitle}>{report.reportType || report.fileName}</Text>
          <View style={styles.compactMeta} wrap={false}>
            {report.reportDate && <Metadata label={t('visitPacket.reportDate')} value={report.reportDate} />}
            {report.laboratory && <Metadata label={t('visitPacket.laboratory')} value={report.laboratory} />}
            {report.analysisType === 'narrative' && report.narrativeAnalysis.body_part_or_test && <Metadata label={t('visitPacket.bodyPartTest')} value={report.narrativeAnalysis.body_part_or_test} />}
          </View>
          {report.analysisType === 'structured' ? report.parameters.length > 0 && chunksOf(report.parameters, 8).map((parameterChunk, chunkIndex) => <View key={chunkIndex} wrap={false}>
            {chunkIndex > 0 && <Text style={styles.continuationLabel}>{t('visitPacket.reportContinued', { reportType: report.reportType || t('visitPacket.structuredReport') })}</Text>}
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}><Text style={[styles.tableCell, styles.tableHeaderText, { width: '28%' }]}>{t('visitPacket.parameter')}</Text><Text style={[styles.tableCell, styles.tableHeaderText, { width: '22%' }]}>{t('visitPacket.result')}</Text><Text style={[styles.tableCell, styles.tableHeaderText, { width: '30%' }]}>{t('visitPacket.referenceRange')}</Text><Text style={[styles.tableCell, styles.tableHeaderText, { width: '20%' }]}>{t('visitPacket.status')}</Text></View>
              {parameterChunk.map((parameter) => <View key={parameter.id} style={styles.tableRow}><Text style={[styles.tableCell, { width: '28%', fontWeight: 700 }]}>{parameter.name}</Text><Text style={[styles.tableCell, { width: '22%' }]}>{[parameter.value, parameter.unit].filter(Boolean).join(' ') || '-'}</Text><Text style={[styles.tableCell, { width: '30%' }]}>{parameter.referenceRange || '-'}</Text><Text style={[styles.tableCell, { width: '20%' }]}>{parameter.status}</Text></View>)}
            </View>
          </View>) : <View>
            <Field label={t('visitPacket.summary')} value={report.narrativeAnalysis.summary} />
            {report.narrativeAnalysis.key_findings.length > 0 && <View style={styles.field}><Text style={styles.label}>{t('visitPacket.keyFindings')}</Text>{report.narrativeAnalysis.key_findings.map((finding, findingIndex) => chunkText(finding.explanation).map((explanationChunk, chunkIndex) => <View key={`${finding.finding}-${findingIndex}-${chunkIndex}`} style={styles.field} wrap={false}>
              {chunkIndex === 0 ? <Text style={[styles.value, { fontWeight: 700 }]}>{finding.finding}</Text> : <Text style={styles.continuationLabel}>{t('visitPacket.keyFindingsContinued')}</Text>}
              <Text style={styles.value}>{explanationChunk}</Text>
            </View>))}</View>}
            {report.narrativeAnalysis.impression?.trim() && <Field label={t('visitPacket.reportImpression')} value={report.narrativeAnalysis.impression} />}
          </View>}
        </View>)}
      </Section>}

      {packet.questions.length > 0 && <Section title={t('visitPacket.appointmentQuestions')}>
        {Array.from(questionCycles.entries()).map(([cycle, questions]) => <View key={cycle} style={styles.block}>
          <Text style={styles.blockTitle} minPresenceAhead={18}>{cycle === 'initial' ? t('visitPacket.beforeFirstConsultation') : t('visitPacket.nextAppointmentQuestions')}</Text>
          {questions.map((question) => <View key={question.id} style={styles.checkboxRow} wrap={false}><View style={styles.checkbox} /><Text style={{ flex: 1 }}>{question.question}</Text></View>)}
        </View>)}
      </Section>}

      <Section title={t('visitPacket.episodeTimeline')}>
        {packet.timeline.map((event) => <View key={`${event.type}-${event.sourceId}`} style={styles.timelineRow} wrap={false}><Text style={styles.timelineDate}>{formatDateTime(event.timestamp)}</Text><Text style={styles.timelineLabel}>{t(`visitPacket.timeline.${event.type}`)}{event.type === 'questions_prepared' && event.questionCount ? ` - ${t('visitPacket.questionCount', { count: event.questionCount })}` : ''}</Text></View>)}
      </Section>

      <View style={styles.safety} wrap={false}><Text style={styles.safetyTitle}>{t('visitPacket.preparedWith').toUpperCase()}</Text><Text style={styles.safetyText}>{t('visitPacket.notice')}</Text></View>
      <View style={styles.footer} fixed><Text>{t('visitPacket.title')}</Text><Text render={({ pageNumber, totalPages }) => `${t('visitPacket.page')} ${pageNumber} ${t('visitPacket.of')} ${totalPages}`} /></View>
    </Page>
  </Document>;
};

export const getVisitPacketPdfFileName = (date = new Date()) => `Nura-Visit-Packet-${date.toISOString().slice(0, 10)}.pdf`;

export const generateVisitPacketPdf = async (packet: VisitPacket, language: SupportedLanguage) => {
  registerPdfFont();
  return pdf(<VisitPacketPdfDocument packet={packet} language={language} />).toBlob();
};

export const downloadVisitPacketPdfBlob = (blob: Blob, fileName = getVisitPacketPdfFileName()) => {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
};

export const downloadVisitPacketPdf = async (packet: VisitPacket, language: SupportedLanguage) => {
  const blob = await generateVisitPacketPdf(packet, language);
  downloadVisitPacketPdfBlob(blob);
};
