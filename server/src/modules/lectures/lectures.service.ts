import { AppError } from '../../utils/AppError';
import { lecturesRepository } from './lectures.repository';
import { CreateLectureInput, UpdateLectureInput } from './lectures.validation';

function serialize(row: any) {
  return {
    id: row.id,
    sectionId: row.section_id,
    title: row.title,
    contentType: row.content_type,
    contentUrl: row.content_url,
    durationSeconds: row.duration_seconds,
    orderIndex: row.order_index,
    createdAt: row.created_at,
  };
}

export const lecturesService = {
  async create(sectionId: string, teacherId: string, input: CreateLectureInput) {
    const owned = await lecturesRepository.findSectionIfOwned(sectionId, teacherId);
    if (!owned) throw AppError.notFound('Section not found');

    const row = await lecturesRepository.create(sectionId, {
      title: input.title,
      contentType: input.contentType,
      durationSeconds: input.durationSeconds ?? null,
    });
    return serialize(row);
  },

  async listForSection(sectionId: string, teacherId: string) {
    const owned = await lecturesRepository.findSectionIfOwned(sectionId, teacherId);
    if (!owned) throw AppError.notFound('Section not found');

    const rows = await lecturesRepository.findByOwnedSection(sectionId, teacherId);
    return rows.map(serialize);
  },

  async update(lectureId: string, teacherId: string, input: UpdateLectureInput) {
    const row = await lecturesRepository.updateOwned(lectureId, teacherId, input);
    if (!row) throw AppError.notFound('Lecture not found');
    return serialize(row);
  },

  async remove(lectureId: string, teacherId: string) {
    const deleted = await lecturesRepository.deleteOwned(lectureId, teacherId);
    if (!deleted) throw AppError.notFound('Lecture not found');
  },

  async setContent(lectureId: string, teacherId: string, contentUrl: string) {
    const row = await lecturesRepository.updateOwned(lectureId, teacherId, { contentUrl });
    if (!row) throw AppError.notFound('Lecture not found');
    return serialize(row);
  },
};
