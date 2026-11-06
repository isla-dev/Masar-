import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assignmentsApi } from '../../api/assignments';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

function AssignmentForm({ sectionId, onDone }: { sectionId: string; onDone: () => void }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState(100);

  const createMutation = useMutation({
    mutationFn: () =>
      assignmentsApi.create(sectionId, {
        title,
        description: description || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        maxScore,
      }),
    onSuccess: onDone,
  });

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3">
      <Input placeholder={t('assignment.title')} value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        rows={2}
        placeholder={t('course.description')}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="flex gap-2">
        <Input
          type="date"
          label={t('assignment.dueDate')}
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <Input
          type="number"
          min={1}
          label={t('assignment.maxScore')}
          value={maxScore}
          onChange={(e) => setMaxScore(Number(e.target.value))}
          className="w-28"
        />
      </div>
      <div className="flex gap-2">
        <Button disabled={!title.trim() || createMutation.isPending} onClick={() => createMutation.mutate()}>
          {t('common.save')}
        </Button>
        <Button variant="ghost" type="button" onClick={onDone}>
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  );
}

export function AssignmentBuilderPanel({ sectionId }: { sectionId: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);

  const { data: assignments } = useQuery({
    queryKey: ['assignments', sectionId],
    queryFn: () => assignmentsApi.listForSection(sectionId),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => assignmentsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignments', sectionId] }),
  });

  return (
    <div className="mt-3">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
        {t('assignment.assignments')}
      </p>
      <ul className="flex flex-col gap-1">
        {assignments?.map((a) => (
          <li key={a.id} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-sm">
            <Link to={`/dashboard/teacher/assignments/${a.id}/submissions`} className="hover:underline">
              {a.title} · {a.submissionCount ?? 0} {t('assignment.submissions')}
            </Link>
            <button
              type="button"
              className="text-xs text-neutral-400 hover:text-red-500"
              onClick={() => deleteMutation.mutate(a.id)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {isAdding ? (
        <div className="mt-2">
          <AssignmentForm
            sectionId={sectionId}
            onDone={() => {
              setIsAdding(false);
              queryClient.invalidateQueries({ queryKey: ['assignments', sectionId] });
            }}
          />
        </div>
      ) : (
        <button
          type="button"
          className="mt-2 text-xs font-medium text-primary-600 hover:underline"
          onClick={() => setIsAdding(true)}
        >
          {t('assignment.newAssignment')}
        </button>
      )}
    </div>
  );
}
