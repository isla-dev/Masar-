import { AppError } from '../../utils/AppError';
import { assignmentsRepository } from './assignments.repository';
import {
  CreateAssignmentInput,
  GradeSubmissionInput,
  UpdateAssignmentInput,
} from './assignments.validation';

function serializeAssignment(row: any) {
  return {
    id: row.id,
    sectionId: row.section_id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    maxScore: row.max_score,
    orderIndex: row.order_index,
    submissionCount: row.submission_count !== undefined ? Number(row.submission_count) : undefined,
  };
}

function serializeSubmission(row: any) {
  return {
    id: row.id,
    assignmentId: row.assignment_id,
    studentId: row.student_id,
    studentName: row.student_name,
    studentEmail: row.student_email,
    fileUrl: row.file_url,
    submissionText: row.submission_text,
    submittedAt: row.submitted_at,
    grade: row.grade,
    feedback: row.feedback,
    gradedAt: row.graded_at,
  };
}

export const assignmentsService = {
  async create(sectionId: string, teacherId: string, input: CreateAssignmentInput) {
    const owned = await assignmentsRepository.findSectionIfOwned(sectionId, teacherId);
    if (!owned) throw AppError.notFound('Section not found');

    const row = await assignmentsRepository.create(sectionId, input);
    return serializeAssignment(row);
  },

  async listForSection(sectionId: string, teacherId: string) {
    const owned = await assignmentsRepository.findSectionIfOwned(sectionId, teacherId);
    if (!owned) throw AppError.notFound('Section not found');

    const rows = await assignmentsRepository.findByOwnedSection(sectionId, teacherId);
    return rows.map(serializeAssignment);
  },

  async update(assignmentId: string, teacherId: string, input: UpdateAssignmentInput) {
    const row = await assignmentsRepository.updateOwned(assignmentId, teacherId, input);
    if (!row) throw AppError.notFound('Assignment not found');
    return serializeAssignment(row);
  },

  async remove(assignmentId: string, teacherId: string) {
    const deleted = await assignmentsRepository.deleteOwned(assignmentId, teacherId);
    if (!deleted) throw AppError.notFound('Assignment not found');
  },

  async listSubmissions(assignmentId: string, teacherId: string) {
    const rows = await assignmentsRepository.findSubmissionsForOwnedAssignment(assignmentId, teacherId);
    if (rows === null) throw AppError.notFound('Assignment not found');
    return rows.map(serializeSubmission);
  },

  async gradeSubmission(submissionId: string, teacherId: string, input: GradeSubmissionInput) {
    const row = await assignmentsRepository.gradeSubmissionOwned(
      submissionId,
      teacherId,
      input.grade,
      input.feedback ?? null
    );
    if (!row) throw AppError.notFound('Submission not found');
    return serializeSubmission(row);
  },

  // --- Student-facing ---

  async getForSubmission(assignmentId: string, studentId: string) {
    const enrollment = await assignmentsRepository.findEnrollmentForAssignment(assignmentId, studentId);
    if (!enrollment) throw AppError.forbidden('You are not enrolled in the course this assignment belongs to');

    const assignment = await assignmentsRepository.findPublishedAssignment(assignmentId);
    if (!assignment) throw AppError.notFound('Assignment not found');

    const submission = await assignmentsRepository.findMySubmission(assignmentId, studentId);

    return {
      ...serializeAssignment(assignment),
      mySubmission: submission ? serializeSubmission(submission) : null,
    };
  },

  async getResultsForStudent(studentId: string) {
    const rows = await assignmentsRepository.findAllSubmissionsForStudent(studentId);
    return rows.map((r: any) => ({
      submissionId: r.id,
      assignmentId: r.assignment_id,
      assignmentTitle: r.assignment_title,
      maxScore: r.max_score,
      courseId: r.course_id,
      courseTitle: r.course_title,
      submittedAt: r.submitted_at,
      grade: r.grade,
      graded: r.graded_at !== null,
    }));
  },

  async submit(
    assignmentId: string,
    studentId: string,
    data: { submissionText?: string; fileUrl?: string | null }
  ) {
    const enrollment = await assignmentsRepository.findEnrollmentForAssignment(assignmentId, studentId);
    if (!enrollment) throw AppError.forbidden('You are not enrolled in the course this assignment belongs to');

    if (!data.submissionText && !data.fileUrl) {
      throw new AppError('Submit either text or a file', 400, 'BAD_REQUEST');
    }

    const existing = await assignmentsRepository.findMySubmission(assignmentId, studentId);

    const row = await assignmentsRepository.upsertSubmission(assignmentId, studentId, {
      fileUrl: data.fileUrl ?? existing?.file_url ?? null,
      submissionText: data.submissionText ?? existing?.submission_text ?? null,
    });
    return serializeSubmission(row);
  },
};
