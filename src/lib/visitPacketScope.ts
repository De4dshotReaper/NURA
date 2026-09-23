interface ScopedQuestion {
  previous_consultation_id: string | null;
}

const uniqueIds = (values: string[]) => [...new Set(values)];

export const scopeVisitPacketAssociations = <TQuestion extends ScopedQuestion>(
  consultationIds: string[],
  questions: TQuestion[],
  prescriptionLinks: Array<{ consultation_id: string; prescription_id: string }>,
  labLinks: Array<{ consultation_id: string; lab_report_id: string }>,
) => {
  const consultationIdSet = new Set(consultationIds);
  return {
    questions: questions.filter((question) =>
      question.previous_consultation_id === null || consultationIdSet.has(question.previous_consultation_id)),
    prescriptionIds: uniqueIds(prescriptionLinks
      .filter((link) => consultationIdSet.has(link.consultation_id))
      .map((link) => link.prescription_id)),
    labReportIds: uniqueIds(labLinks
      .filter((link) => consultationIdSet.has(link.consultation_id))
      .map((link) => link.lab_report_id)),
  };
};

interface LinkedAssociation {
  resourceId: string;
  createdAt: string | null;
}

interface ResolveLinkedEventTimestampInput {
  resourceId: string;
  uploadedAt: string;
  episodeStartedAt: string;
  associations: LinkedAssociation[];
}

const validTime = (value: string | null) => value !== null && !Number.isNaN(new Date(value).getTime());

export const resolveEpisodeLinkedEventTimestamp = ({
  resourceId,
  uploadedAt,
  episodeStartedAt,
  associations,
}: ResolveLinkedEventTimestampInput): string | null => {
  const associationTimes = associations
    .filter((association) => association.resourceId === resourceId && validTime(association.createdAt))
    .map((association) => association.createdAt as string)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  if (associationTimes.length > 0) return associationTimes[0];
  if (!validTime(uploadedAt) || !validTime(episodeStartedAt)) return null;
  return new Date(uploadedAt).getTime() >= new Date(episodeStartedAt).getTime() ? uploadedAt : null;
};

interface AppointmentCycleQuestion {
  id: string;
  previousConsultationId: string | null;
  createdAt: string;
}

export const buildQuestionCycleEvents = (questions: AppointmentCycleQuestion[]) => {
  const cycles = new Map<string, AppointmentCycleQuestion[]>();
  questions.forEach((question) => {
    const key = question.previousConsultationId ?? 'initial';
    cycles.set(key, [...(cycles.get(key) ?? []), question]);
  });

  return Array.from(cycles.entries()).map(([cycle, cycleQuestions]) => {
    const ordered = [...cycleQuestions].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() || a.id.localeCompare(b.id));
    return {
      cycle,
      timestamp: ordered[0].createdAt,
      sourceId: `questions-${cycle}`,
      questionCount: ordered.length,
      appointmentCycle: cycle === 'initial' ? 'initial' as const : 'next' as const,
    };
  });
};
