import { AppError } from '../../utils/AppError';
import { sectionsRepository } from './sections.repository';
import { CreateSectionInput, UpdateSectionInput } from './sections.validation';

function serialize(row: any) {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    orderIndex: row.order_index,
    createdAt: row.created_at,
  };
}

export const sectionsService = {
  async create(courseId: string, teacherId: string, input: CreateSectionInput) {
    const owned = await sectionsRepository.findCourseIfOwned(courseId, teacherId);
    if (!owned) throw AppError.notFound('Course not found');

    const row = await sectionsRepository.create(courseId, input.title);
    return serialize(row);
  },

  async listForCourse(courseId: string, teacherId: string) {
    const owned = await sectionsRepository.findCourseIfOwned(courseId, teacherId);
    if (!owned) throw AppError.notFound('Course not found');

    const rows = await sectionsRepository.findByCourse(courseId);
    return rows.map(serialize);
  },

  async update(sectionId: string, teacherId: string, input: UpdateSectionInput) {
    const row = await sectionsRepository.updateOwned(sectionId, teacherId, {
      title: input.title,
      orderIndex: input.orderIndex,
    });
    if (!row) throw AppError.notFound('Section not found');
    return serialize(row);
  },

  async remove(sectionId: string, teacherId: string) {
    const deleted = await sectionsRepository.deleteOwned(sectionId, teacherId);
    if (!deleted) throw AppError.notFound('Section not found');
  },
};
