// Hand-written row types mirroring the SQL schema.
// Kept in sync manually with src/db/migrations/*.sql — since there is
// no ORM to infer these from, update this file whenever the schema changes.

export type UserRole = 'student' | 'teacher' | 'admin';
export type AppLanguage = 'en' | 'fr' | 'ar';
export type CourseStatus = 'draft' | 'pending' | 'published' | 'rejected';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type LectureContentType = 'video' | 'text' | 'file';
export type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false';
export type EnrollmentStatus = 'active' | 'completed';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  preferred_language: AppLanguage;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CourseRow {
  id: string;
  teacher_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  level: CourseLevel;
  price: string; // numeric comes back as string from pg by default
  is_free: boolean;
  status: CourseStatus;
  language: AppLanguage;
  rejection_reason: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface SectionRow {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  created_at: Date;
}

export interface LectureRow {
  id: string;
  section_id: string;
  title: string;
  content_type: LectureContentType;
  content_url: string | null;
  duration_seconds: number | null;
  order_index: number;
  created_at: Date;
}

export interface EnrollmentRow {
  id: string;
  student_id: string;
  course_id: string;
  status: EnrollmentStatus;
  enrolled_at: Date;
  completed_at: Date | null;
}

export interface CertificateRow {
  id: string;
  student_id: string;
  course_id: string;
  certificate_number: string;
  pdf_url: string | null;
  issued_at: Date;
}

export interface PaymentRow {
  id: string;
  student_id: string;
  course_id: string;
  amount: string;
  currency: string;
  provider: string;
  provider_transaction_id: string | null;
  provider_metadata: Record<string, unknown> | null;
  status: PaymentStatus;
  created_at: Date;
  updated_at: Date;
}
