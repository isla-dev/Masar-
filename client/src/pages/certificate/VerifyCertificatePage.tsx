import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { certificatesApi } from '../../api/certificates';
import { Spinner } from '../../components/common/Feedback';

export default function VerifyCertificatePage() {
  const { certificateNumber } = useParams<{ certificateNumber: string }>();
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['verify-certificate', certificateNumber],
    queryFn: () => certificatesApi.verify(certificateNumber!),
    enabled: Boolean(certificateNumber),
  });

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-12">
      {isLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      {data && !data.valid && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-lg font-semibold text-red-600">{t('certificate.notFound')}</p>
          <p className="mt-1 text-sm text-red-500">{t('certificate.notFoundDescription')}</p>
        </div>
      )}

      {data && data.valid && (
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-6 text-center">
          <p className="text-lg font-semibold text-primary-700">{t('certificate.valid')}</p>
          <div className="mt-4 flex flex-col gap-2 text-start text-sm text-neutral-700">
            <p>
              <span className="font-medium">{t('certificate.student')}:</span> {data.studentName}
            </p>
            <p>
              <span className="font-medium">{t('certificate.course')}:</span> {data.courseTitle}
            </p>
            <p>
              <span className="font-medium">{t('certificate.instructor')}:</span> {data.teacherName}
            </p>
            <p>
              <span className="font-medium">{t('certificate.issued')}:</span>{' '}
              {data.issuedAt && new Date(data.issuedAt).toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium">{t('certificate.id')}:</span> {data.certificateNumber}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
