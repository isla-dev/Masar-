import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { assignmentsApi, Submission } from '../../api/assignments';
import { Spinner, Badge } from '../../components/common/Feedback';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

function GradeRow({ submission }: { submission: Submission }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [grade, setGrade] = useState(submission.grade?.toString() ?? '');
  const [feedback, setFeedback] = useState(submission.feedback ?? '');

  const gradeMutation = useMutation({
    mutationFn: () => assignmentsApi.gradeSubmission(submission.id, Number(grade), feedback || undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['submissions', submission.assignmentId] }),
  });

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="font-medium text-neutral-900">{submission.studentName}</p>
          <p className="text-xs text-neutral-500">{submission.studentEmail}</p>
        </div>
        {submission.grade !== null && <Badge tone="primary">{t('assignment.graded')}</Badge>}
      </div>

      {submission.submissionText && <p className="mb-2 text-sm text-neutral-700">{submission.submissionText}</p>}
      {submission.fileUrl && (
        <a href={submission.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-primary-600 underline">
          {t('assignment.viewFile')}
        </a>
      )}

      <div className="mt-3 flex items-end gap-2">
        <Input
          type="number"
          min={0}
          label={t('assignment.grade')}
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="w-24"
        />
        <Input
          label={t('assignment.feedback')}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="flex-1"
        />
        <Button onClick={() => gradeMutation.mutate()} disabled={!grade || gradeMutation.isPending}>
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
}

export default function AssignmentSubmissionsPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['submissions', id],
    queryFn: () => assignmentsApi.listSubmissions(id!),
    enabled: Boolean(id),
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">{t('assignment.submissions')}</h1>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {submissions && submissions.length === 0 && (
        <p className="py-16 text-center text-neutral-500">{t('assignment.noSubmissions')}</p>
      )}

      <div className="flex flex-col gap-3">
        {submissions?.map((sub) => (
          <GradeRow key={sub.id} submission={sub} />
        ))}
      </div>
    </div>
  );
}
