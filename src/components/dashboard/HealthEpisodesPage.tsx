import React, { useEffect, useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { EpisodeStoryPage } from './EpisodeStoryPage';
import { useTranslation } from 'react-i18next';
import { isSupportedLanguage, languageLocale } from '../../i18n';

interface HealthEpisodeRow {
  id: string;
  initial_symptom_entry_id: string;
  status: 'active' | 'completed';
  started_at: string;
  completed_at: string | null;
}

interface InitialSymptomRow {
  id: string;
  symptoms: string;
}

interface ConsultationCountRow {
  id: string;
  symptom_entry_id: string;
}

interface FollowUpCountRow {
  id: string;
  symptom_entry_id: string;
}

interface ConsultationPrescriptionLink {
  consultation_id: string;
  prescription_id: string;
}

interface ConsultationLabLink {
  consultation_id: string;
  lab_report_id: string;
}

interface EpisodeCounts {
  consultations: number | null;
  followUps: number | null;
  prescriptions: number | null;
  labReports: number | null;
}

interface EpisodeDisplay {
  episode: HealthEpisodeRow;
  initialSymptom: InitialSymptomRow | null;
  counts: EpisodeCounts;
}

interface HealthEpisodesPageProps {
  userId: string;
  selectedEpisodeId: string | null;
  onSelectEpisode: (episodeId: string) => void;
  onBackToEpisodes: () => void;
  onBackToDashboard: () => void;
  onStartNewEpisode: () => void;
}

const formatLocalDate = (timestamp: string, locale: string): string =>
  new Date(timestamp).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const pluralize = (count: number, singular: string): string =>
  `${count} ${count === 1 ? singular : `${singular}s`}`;

export const HealthEpisodesPage: React.FC<HealthEpisodesPageProps> = ({
  userId,
  selectedEpisodeId,
  onSelectEpisode,
  onBackToEpisodes,
  onBackToDashboard,
  onStartNewEpisode,
}) => {
  const { t, i18n } = useTranslation();
  const locale = languageLocale[isSupportedLanguage(i18n.language) ? i18n.language : 'en'];
  const [episodes, setEpisodes] = useState<EpisodeDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadEpisodes = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const { data: episodeData, error: episodeError } = await supabase
          .from('health_episodes')
          .select('id, initial_symptom_entry_id, status, started_at, completed_at')
          .eq('user_id', userId)
          .order('started_at', { ascending: false });

        if (!isMounted) return;
        if (episodeError) {
          console.error('Failed to load health episodes:', episodeError);
          setErrorMessage(t('episodes.error'));
          return;
        }

        const episodeRows = ((episodeData ?? []) as HealthEpisodeRow[]).sort((a, b) => {
          if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
          return new Date(b.started_at).getTime() - new Date(a.started_at).getTime();
        });

        if (episodeRows.length === 0) {
          setEpisodes([]);
          return;
        }

        const symptomEntryIds = episodeRows.map((episode) => episode.initial_symptom_entry_id);
        const { data: symptomData, error: symptomError } = await supabase
          .from('symptom_entries')
          .select('id, symptoms')
          .eq('user_id', userId)
          .in('id', symptomEntryIds);

        if (!isMounted) return;
        if (symptomError) {
          console.error('Failed to load initial symptoms for health episodes:', symptomError);
          setErrorMessage(t('episodes.detailsError'));
          return;
        }

        const [consultationResult, followUpResult] = await Promise.all([
          supabase
            .from('consultations')
            .select('id, symptom_entry_id')
            .eq('user_id', userId)
            .in('symptom_entry_id', symptomEntryIds),
          supabase
            .from('follow_up_entries')
            .select('id, symptom_entry_id')
            .eq('user_id', userId)
            .in('symptom_entry_id', symptomEntryIds),
        ]);

        if (!isMounted) return;

        if (consultationResult.error) {
          console.error('Failed to load consultation counts for health episodes:', consultationResult.error);
        }
        if (followUpResult.error) {
          console.error('Failed to load follow-up counts for health episodes:', followUpResult.error);
        }

        const consultations = consultationResult.error
          ? null
          : (consultationResult.data ?? []) as ConsultationCountRow[];
        const followUps = followUpResult.error
          ? null
          : (followUpResult.data ?? []) as FollowUpCountRow[];

        let prescriptionLinks: ConsultationPrescriptionLink[] | null = null;
        let labLinks: ConsultationLabLink[] | null = null;

        if (consultations) {
          const consultationIds = consultations.map((consultation) => consultation.id);
          if (consultationIds.length === 0) {
            prescriptionLinks = [];
            labLinks = [];
          } else {
            const [prescriptionLinkResult, labLinkResult] = await Promise.all([
              supabase
                .from('consultation_prescriptions')
                .select('consultation_id, prescription_id')
                .in('consultation_id', consultationIds),
              supabase
                .from('consultation_lab_reports')
                .select('consultation_id, lab_report_id')
                .in('consultation_id', consultationIds),
            ]);

            if (!isMounted) return;

            if (prescriptionLinkResult.error) {
              console.error('Failed to load linked prescription counts for health episodes:', prescriptionLinkResult.error);
            } else {
              prescriptionLinks = (prescriptionLinkResult.data ?? []) as ConsultationPrescriptionLink[];
            }

            if (labLinkResult.error) {
              console.error('Failed to load linked lab report counts for health episodes:', labLinkResult.error);
            } else {
              labLinks = (labLinkResult.data ?? []) as ConsultationLabLink[];
            }
          }
        }

        const symptomsById = new Map(
          ((symptomData ?? []) as InitialSymptomRow[]).map((symptom) => [symptom.id, symptom]),
        );
        setEpisodes(episodeRows.map((episode) => {
          const episodeConsultations = consultations?.filter(
            (consultation) => consultation.symptom_entry_id === episode.initial_symptom_entry_id,
          ) ?? null;
          const episodeConsultationIds = new Set(episodeConsultations?.map((consultation) => consultation.id) ?? []);
          const linkedPrescriptionIds = prescriptionLinks === null
            ? null
            : new Set(prescriptionLinks
              .filter((link) => episodeConsultationIds.has(link.consultation_id))
              .map((link) => link.prescription_id));
          const linkedLabIds = labLinks === null
            ? null
            : new Set(labLinks
              .filter((link) => episodeConsultationIds.has(link.consultation_id))
              .map((link) => link.lab_report_id));

          return {
            episode,
            initialSymptom: symptomsById.get(episode.initial_symptom_entry_id) ?? null,
            counts: {
              consultations: episodeConsultations?.length ?? null,
              followUps: followUps?.filter(
                (followUp) => followUp.symptom_entry_id === episode.initial_symptom_entry_id,
              ).length ?? null,
              prescriptions: linkedPrescriptionIds?.size ?? null,
              labReports: linkedLabIds?.size ?? null,
            },
          };
        }));
      } catch (error) {
        if (!isMounted) return;
        console.error('Unexpected error loading health episodes:', error);
        setErrorMessage(t('episodes.error'));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadEpisodes();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (selectedEpisodeId) return <EpisodeStoryPage episodeId={selectedEpisodeId} userId={userId} onBack={onBackToEpisodes} showBackButton={false} />;

  return (
    <div className="max-w-4xl mr-auto space-y-8">
      <button type="button" onClick={onBackToDashboard} className="inline-flex items-center gap-2 text-sm font-semibold text-nuraTextSecondary hover:text-primary transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        {t('common.backDashboard')}
      </button>
      <header className="space-y-3">
        <div className="inline-flex rounded-full bg-blue-50/80 px-3 py-1 text-xs font-semibold tracking-wider text-primary">{t('episodes.eyebrow')}</div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-nuraText">{t('episodes.title')}</h1>
        <p className="text-base sm:text-lg text-nuraTextSecondary">{t('episodes.subtitle')}</p>
      </header>

      {isLoading ? (
        <div className="rounded-[1.75rem] border border-gray-100 bg-white p-10 text-center shadow-sm" aria-busy="true">
          <p className="text-sm font-medium text-nuraTextSecondary">{t('episodes.loading')}</p>
        </div>
      ) : errorMessage ? (
        <div className="rounded-[1.75rem] border border-red-100 bg-white p-8 text-center shadow-sm" role="alert">
          <p className="text-sm font-medium text-red-700">{errorMessage}</p>
        </div>
      ) : episodes.length === 0 ? (
        <div className="rounded-[1.75rem] border border-gray-100 bg-white p-8 sm:p-10 text-center shadow-sm space-y-5">
          <div className="space-y-2">
            <h2 className="font-heading text-xl font-bold text-nuraText">{t('episodes.empty')}</h2>
            <p className="text-sm text-nuraTextSecondary">{t('episodes.emptyHelp')}</p>
          </div>
          <button type="button" onClick={onStartNewEpisode} className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600 transition-colors">
            {t('dashboard.startEpisode')}
          </button>
        </div>
      ) : (
        <div className="grid gap-5">
          {episodes.map(({ episode, initialSymptom, counts }) => {
            const countLabels = [
              counts.consultations === null ? null : pluralize(counts.consultations, 'consultation'),
              counts.followUps === null ? null : pluralize(counts.followUps, 'follow-up'),
              counts.prescriptions === null ? null : pluralize(counts.prescriptions, 'prescription'),
              counts.labReports === null ? null : pluralize(counts.labReports, 'lab report'),
            ].filter((label): label is string => Boolean(label));

            return (
              <article key={episode.id} className="rounded-[1.75rem] border border-gray-100 bg-white p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:border-primary/20 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${episode.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                      {episode.status}
                    </span>
                    <p className="text-xs font-medium text-nuraTextSecondary">
                      {episode.status === 'completed' && episode.completed_at
                        ? `${formatLocalDate(episode.started_at, locale)} — ${formatLocalDate(episode.completed_at, locale)}`
                        : t('episodes.started', { date: formatLocalDate(episode.started_at, locale) })}
                    </p>
                  </div>
                  <p className="font-heading text-lg sm:text-xl font-bold leading-relaxed text-nuraText whitespace-pre-line">
                    {initialSymptom?.symptoms ?? 'Initial symptom details unavailable'}
                  </p>
                  {countLabels.length > 0 && (
                    <p className="text-xs sm:text-sm text-nuraTextSecondary">{countLabels.join(' • ')}</p>
                  )}
                  <div className="border-t border-gray-100 pt-5 flex justify-end">
                    <button type="button" onClick={() => onSelectEpisode(episode.id)} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-blue-600 transition-colors group">
                      {t('episodes.view')}
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HealthEpisodesPage;
