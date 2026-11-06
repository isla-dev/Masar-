import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { teacherCoursesApi, CourseFormInput } from '../../api/teacherCourses';
import { categoriesApi } from '../../api/categories';
import { sectionsApi } from '../../api/sections';
import { lecturesApi, Lecture } from '../../api/lectures';
import { QuizBuilderPanel } from '../../components/course/QuizBuilderPanel';
import { AssignmentBuilderPanel } from '../../components/course/AssignmentBuilderPanel';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Badge, Spinner } from '../../components/common/Feedback';
import { useLanguage } from '../../context/LanguageContext';

function SectionBuilder({ courseId, sectionId, title }: { courseId: string; sectionId: string; title: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [newLectureTitle, setNewLectureTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLectureId, setUploadingLectureId] = useState<string | null>(null);

  const { data: lectures } = useQuery({
    queryKey: ['lectures', sectionId],
    queryFn: () => lecturesApi.listForSection(sectionId),
  });

  const invalidateLectures = () => queryClient.invalidateQueries({ queryKey: ['lectures', sectionId] });

  const addLecture = useMutation({
    mutationFn: () => lecturesApi.create(sectionId, { title: newLectureTitle, contentType: 'video' }),
    onSuccess: () => {
      setNewLectureTitle('');
      invalidateLectures();
    },
  });

  const deleteLecture = useMutation({
    mutationFn: (id: string) => lecturesApi.remove(id),
    onSuccess: invalidateLectures,
  });

  const deleteSection = useMutation({
    mutationFn: () => sectionsApi.remove(sectionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sections', courseId] }),
  });

  const uploadContent = useMutation({
    mutationFn: ({ lectureId, file }: { lectureId: string; file: File }) =>
      lecturesApi.uploadContent(lectureId, file),
    onSuccess: invalidateLectures,
    onSettled: () => setUploadingLectureId(null),
  });

  function handleFilePick(lectureId: string) {
    setUploadingLectureId(lectureId);
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && uploadingLectureId) {
      uploadContent.mutate({ lectureId: uploadingLectureId, file });
    }
    e.target.value = '';
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-neutral-900">{title}</h3>
        <Button variant="ghost" onClick={() => deleteSection.mutate()} disabled={deleteSection.isPending}>
          {t('common.cancel') /* used generically as "remove" affordance below */}
          &nbsp;✕
        </Button>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {lectures?.map((lecture: Lecture) => (
          <li key={lecture.id} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-sm">
            <span className="text-neutral-800">{lecture.title}</span>
            <div className="flex items-center gap-2">
              {lecture.contentUrl ? (
                <Badge>{t('teacher.uploaded')}</Badge>
              ) : (
                <button
                  type="button"
                  className="text-xs font-medium text-primary-600 hover:underline"
                  onClick={() => handleFilePick(lecture.id)}
                  disabled={uploadContent.isPending}
                >
                  {t('teacher.uploadContent')}
                </button>
              )}
              <button
                type="button"
                className="text-xs text-neutral-400 hover:text-red-500"
                onClick={() => deleteLecture.mutate(lecture.id)}
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>

      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (newLectureTitle.trim()) addLecture.mutate();
        }}
      >
        <Input
          placeholder={t('teacher.newLecture')}
          value={newLectureTitle}
          onChange={(e) => setNewLectureTitle(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="secondary" disabled={addLecture.isPending}>
          {t('common.save')}
        </Button>
      </form>

      <QuizBuilderPanel sectionId={sectionId} />
      <AssignmentBuilderPanel sectionId={sectionId} />
    </div>
  );
}

export default function CourseEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const { data: course, isLoading } = useQuery({
    queryKey: ['teacher-course', id],
    queryFn: () => teacherCoursesApi.getMine(id!),
    enabled: Boolean(id),
  });

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });

  const { data: sections } = useQuery({
    queryKey: ['sections', id],
    queryFn: () => sectionsApi.listForCourse(id!),
    enabled: Boolean(id),
  });

  const { register, handleSubmit, reset, watch } = useForm<CourseFormInput>();

  useEffect(() => {
    if (course) {
      reset({
        title: course.title,
        description: course.description ?? '',
        categoryId: course.category?.id,
        level: course.level,
        price: course.price,
        isFree: course.isFree,
        language: course.language,
      });
    }
  }, [course, reset]);

  const isFree = watch('isFree');

  const updateMutation = useMutation({
    mutationFn: (input: Partial<CourseFormInput>) => teacherCoursesApi.update(id!, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teacher-course', id] }),
  });

  const submitMutation = useMutation({
    mutationFn: () => teacherCoursesApi.submit(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teacher-course', id] }),
  });

  const thumbnailMutation = useMutation({
    mutationFn: (file: File) => teacherCoursesApi.uploadThumbnail(id!, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teacher-course', id] }),
  });

  const addSection = useMutation({
    mutationFn: () => sectionsApi.create(id!, newSectionTitle),
    onSuccess: () => {
      setNewSectionTitle('');
      queryClient.invalidateQueries({ queryKey: ['sections', id] });
    },
  });

  if (isLoading || !course) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">{course.title}</h1>
        <div className="flex items-center gap-3">
          <Link to={`/dashboard/teacher/courses/${id}/students`} className="text-sm font-medium text-primary-600 hover:underline">
            {t('teacher.enrolledStudents')} ({course.enrollmentCount ?? 0})
          </Link>
          <Badge>{t(`courseStatus.${course.status}`)}</Badge>
        </div>
      </div>

      {course.status === 'rejected' && course.rejectionReason && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{course.rejectionReason}</p>
      )}

      <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-neutral-900">{t('teacher.thumbnail')}</h2>
        <div className="flex items-center gap-4">
          <div className="h-24 w-40 overflow-hidden rounded-lg bg-neutral-100">
            {course.thumbnailUrl && <img src={course.thumbnailUrl} className="h-full w-full object-cover" />}
          </div>
          <Button
            variant="secondary"
            onClick={() => thumbnailInputRef.current?.click()}
            disabled={thumbnailMutation.isPending}
          >
            {t('teacher.uploadThumbnail')}
          </Button>
          <input
            ref={thumbnailInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) thumbnailMutation.mutate(file);
              e.target.value = '';
            }}
          />
        </div>
      </section>

      <form
        className="mb-8 flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4"
        onSubmit={handleSubmit((values) =>
          updateMutation.mutate({ ...values, price: isFree ? 0 : Number(values.price) })
        )}
      >
        <h2 className="font-semibold text-neutral-900">{t('teacher.courseDetails')}</h2>
        <Input label={t('course.title')} {...register('title', { required: true })} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700">{t('course.description')}</label>
          <textarea
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            rows={4}
            {...register('description')}
          />
        </div>
        <Select
          label={t('nav.categories')}
          placeholder={t('course.selectCategory')}
          options={categories?.map((c) => ({ value: c.id, label: c.name[language] ?? c.name.en ?? c.slug })) ?? []}
          {...register('categoryId')}
        />
        <Select
          label={t('course.level')}
          options={[
            { value: 'beginner', label: t('courseLevel.beginner') },
            { value: 'intermediate', label: t('courseLevel.intermediate') },
            { value: 'advanced', label: t('courseLevel.advanced') },
          ]}
          {...register('level')}
        />
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" {...register('isFree')} />
          {t('course.free')}
        </label>
        {!isFree && (
          <Input type="number" min={0} step="0.01" label={t('course.priceFilter')} {...register('price')} />
        )}
        <div className="flex gap-3">
          <Button type="submit" disabled={updateMutation.isPending}>
            {t('common.save')}
          </Button>
          {['draft', 'rejected'].includes(course.status) && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
            >
              {t('teacher.submitForReview')}
            </Button>
          )}
        </div>
      </form>

      <section className="flex flex-col gap-4">
        <h2 className="font-semibold text-neutral-900">{t('course.curriculum')}</h2>
        {sections?.map((section) => (
          <SectionBuilder key={section.id} courseId={id!} sectionId={section.id} title={section.title} />
        ))}

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (newSectionTitle.trim()) addSection.mutate();
          }}
        >
          <Input
            placeholder={t('teacher.newSection')}
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="secondary" disabled={addSection.isPending}>
            {t('common.save')}
          </Button>
        </form>
      </section>
    </div>
  );
}
