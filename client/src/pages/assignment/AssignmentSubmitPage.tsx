import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { assignmentsApi } from '../../api/assignments';
import { Spinner, Badge } from '../../components/common/Feedback';
import { Button } from '../../components/common/Button';

export default function AssignmentSubmitPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const { data: assignment, isLoading } = useQuery({
    queryKey: ['assignment-submission', id],
    queryFn: () => assignmentsApi.getForSubmission(id!),
    enabled: Boolean(id),
  });

  const submitMutation = useMutation({
    mutationFn: () => assignmentsApi.submit(id!, { submissionText: text || undefined, file: file ?? undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-submission', id] });
      queryClient.invalidateQueries({ queryKey: ['learn'] });
      setText('');
      setFile(null);
    },
  });

  if (isLoading || !assignment) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  const submission = assignment.mySubmission;

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-1 text-2xl font-bold text-neutral-900">{assignment.title}</h1>
      {assignment.dueDate && (
        <p className="mb-4 text-sm text-neutral-500">
          {t('assignment.dueDate')}: {new Date(assignment.dueDate).toLocaleDateString()}
        </p>
      )}
      {assignment.description && <p className="mb-6 whitespace-pre-line text-neutral-700">{assignment.description}</p>}

      {submission && (
        <div className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-700">{t('assignment.yourSubmission')}</p>
            {submission.grade !== null ? (
              <Badge tone="primary">
                {submission.grade}/{assignment.maxScore}
              </Badge>
            ) : (
              <Badge>{t('assignment.awaitingGrade')}</Badge>
            )}
          </div>
          {submission.submissionText && <p className="text-sm text-neutral-600">{submission.submissionText}</p>}
          {submission.fileUrl && (
            <a href={submission.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-primary-600 underline">
              {t('assignment.viewFile')}
            </a>
          )}
          {submission.feedback && (
            <p className="mt-2 text-sm text-neutral-600">
              <span className="font-medium">{t('assignment.feedback')}:</span> {submission.feedback}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4">
        <p className="font-medium text-neutral-900">
          {submission ? t('assignment.resubmit') : t('assignment.submit')}
        </p>
        <textarea
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          rows={4}
          placeholder={t('assignment.textPlaceholder')}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
        <Button
          disabled={(!text && !file) || submitMutation.isPending}
          onClick={() => submitMutation.mutate()}
        >
          {t('assignment.submit')}
        </Button>
      </div>
    </div>
  );
}
