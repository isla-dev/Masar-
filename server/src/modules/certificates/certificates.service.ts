import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { AppError } from '../../utils/AppError';
import { storage } from '../../utils/storage';
import { env } from '../../config/env';
import { certificatesRepository } from './certificates.repository';
import { buildCertificateHtml } from './certificates.template';
import { renderHtmlToPdf } from './certificates.pdf';

function serialize(row: any) {
  return {
    id: row.id,
    courseId: row.course_id,
    courseTitle: row.course_title,
    teacherName: row.teacher_name,
    certificateNumber: row.certificate_number,
    pdfUrl: row.pdf_url,
    issuedAt: row.issued_at,
  };
}

function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `MASAR-${year}-${random}`;
}

// Logo is tiny and never changes at runtime — read once and keep the
// base64 data URI in memory rather than hitting disk on every certificate.
let cachedLogoDataUrl: string | null = null;
function getLogoDataUrl(): string {
  if (!cachedLogoDataUrl) {
    // Resolved from process.cwd() (the server package root), not __dirname —
    // __dirname would point into dist/ after a production build, and
    // `tsc` doesn't copy non-.ts assets there. src/assets/ always exists.
    const logoPath = path.resolve(process.cwd(), 'src/assets/logo.png');
    const bytes = fs.readFileSync(logoPath);
    cachedLogoDataUrl = `data:image/png;base64,${bytes.toString('base64')}`;
  }
  return cachedLogoDataUrl;
}

export const certificatesService = {
  /**
   * Called when an enrollment flips to 'completed'. Idempotent — if a
   * certificate already exists for this student/course, it's returned
   * as-is rather than regenerated.
   */
  async generateForCompletion(studentId: string, courseId: string, language: 'en' | 'fr' | 'ar' = 'en') {
    const existing = await certificatesRepository.findByStudentAndCourse(studentId, courseId);
    if (existing) return existing;

    const data = await certificatesRepository.getGenerationData(studentId, courseId);
    if (!data) throw AppError.notFound('Enrollment not found');

    let certificateNumber = generateCertificateNumber();
    const verificationUrl = `${env.CLIENT_URL}/verify/${certificateNumber}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 300 });

    const html = buildCertificateHtml({
      studentName: data.student_name,
      courseTitle: data.course_title,
      teacherName: data.teacher_name,
      completedAt: data.completed_at ?? new Date(),
      certificateNumber,
      verificationUrl,
      qrCodeDataUrl,
      language,
      logoDataUrl: getLogoDataUrl(),
    });

    const pdfBuffer = await renderHtmlToPdf(html);

    const filename = `${certificateNumber}.pdf`;
    const destDir = storage.destinationFor('certificates');
    fs.writeFileSync(`${destDir}/${filename}`, pdfBuffer);
    const pdfUrl = storage.urlFor(`certificates/${filename}`);

    try {
      return await certificatesRepository.create({ studentId, courseId, certificateNumber, pdfUrl });
    } catch (err: any) {
      // Extremely unlikely certificate_number collision — retry once with a fresh number.
      if (err?.code === '23505') {
        certificateNumber = generateCertificateNumber();
        return certificatesRepository.create({
          studentId,
          courseId,
          certificateNumber,
          pdfUrl,
        });
      }
      throw err;
    }
  },

  async listMine(studentId: string) {
    const rows = await certificatesRepository.findMine(studentId);
    return rows.map(serialize);
  },

  async verify(certificateNumber: string) {
    const row = await certificatesRepository.findByCertificateNumber(certificateNumber);
    if (!row) {
      return { valid: false as const };
    }
    return {
      valid: true as const,
      certificateNumber: row.certificate_number,
      studentName: row.student_name,
      courseTitle: row.course_title,
      teacherName: row.teacher_name,
      issuedAt: row.issued_at,
    };
  },
};
