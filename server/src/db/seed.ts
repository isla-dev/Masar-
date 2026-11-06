/* eslint-disable no-console */
import { pool, query } from '../config/db';
import { hashPassword } from '../utils/hashing';
import { setTranslation } from './repositories/translations.repository';

const CATEGORIES: { slug: string; icon: string; name: Record<'en' | 'fr' | 'ar', string> }[] = [
  { slug: 'cooking', icon: 'utensils', name: { en: 'Cooking', fr: 'Cuisine', ar: 'الطبخ' } },
  { slug: 'sewing', icon: 'scissors', name: { en: 'Sewing', fr: 'Couture', ar: 'الخياطة' } },
  { slug: 'embroidery', icon: 'needle', name: { en: 'Embroidery', fr: 'Broderie', ar: 'التطريز' } },
  { slug: 'handcrafts', icon: 'hand', name: { en: 'Handcrafts', fr: 'Artisanat', ar: 'الحرف اليدوية' } },
  { slug: 'beauty', icon: 'sparkles', name: { en: 'Beauty & Self-care', fr: 'Beauté', ar: 'الجمال والعناية' } },
  { slug: 'business', icon: 'briefcase', name: { en: 'Business & Entrepreneurship', fr: 'Entrepreneuriat', ar: 'الأعمال وريادة الأعمال' } },
  { slug: 'digital-skills', icon: 'laptop', name: { en: 'Digital Skills', fr: 'Compétences numériques', ar: 'المهارات الرقمية' } },
  { slug: 'languages', icon: 'globe', name: { en: 'Languages', fr: 'Langues', ar: 'اللغات' } },
];

async function seed() {
  console.log('Seeding categories...');
  const categoryIds: Record<string, string> = {};

  for (const cat of CATEGORIES) {
    const result = await query<{ id: string }>(
      `INSERT INTO categories (slug, icon) VALUES ($1, $2)
       ON CONFLICT (slug) DO UPDATE SET icon = EXCLUDED.icon
       RETURNING id`,
      [cat.slug, cat.icon]
    );
    const id = result.rows[0].id;
    categoryIds[cat.slug] = id;
    for (const [lang, value] of Object.entries(cat.name)) {
      await setTranslation('category', id, 'name', lang as 'en' | 'fr' | 'ar', value);
    }
  }

  console.log('Seeding demo teacher...');
  const passwordHash = await hashPassword('Password123!');
  const teacherResult = await query<{ id: string }>(
    `INSERT INTO users (email, password_hash, role, full_name, preferred_language)
     VALUES ('teacher.demo@lms.test', $1, 'teacher', 'Amina Belkacem', 'ar')
     ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
     RETURNING id`,
    [passwordHash]
  );
  const teacherId = teacherResult.rows[0].id;
  await query(`INSERT INTO teacher_profiles (user_id) VALUES ($1) ON CONFLICT DO NOTHING`, [teacherId]);

  console.log('Seeding demo student...');
  await query(
    `INSERT INTO users (email, password_hash, role, full_name, preferred_language)
     VALUES ('student.demo@lms.test', $1, 'student', 'Yasmine Cherif', 'fr')
     ON CONFLICT (email) DO NOTHING`,
    [passwordHash]
  );

  console.log('Seeding demo admin...');
  // Admins can't self-register via the public /auth/register endpoint by
  // design — this is the only way to get an admin account in a fresh dev DB.
  await query(
    `INSERT INTO users (email, password_hash, role, full_name, preferred_language)
     VALUES ('admin.demo@lms.test', $1, 'admin', 'Platform Admin', 'en')
     ON CONFLICT (email) DO NOTHING`,
    [passwordHash]
  );

  console.log('Seeding demo course...');
  const courseResult = await query<{ id: string }>(
    `INSERT INTO courses (teacher_id, category_id, title, description, level, price, is_free, status, language)
     VALUES ($1, $2, 'تعلم الخياطة للمبتدئات', 'A beginner-friendly sewing course covering the essentials.', 'beginner', 0, true, 'published', 'ar')
     RETURNING id`,
    [teacherId, categoryIds['sewing']]
  );
  const courseId = courseResult.rows[0].id;

  const sections = [
    { title: 'Introduction', lectures: ['Getting to know your machine', 'Basic tools'] },
    { title: 'Basic Techniques', lectures: ['Straight stitches', 'Hemming'] },
    { title: 'Final Project', lectures: ['Sewing a simple tote bag'] },
  ];

  for (let i = 0; i < sections.length; i++) {
    const sectionResult = await query<{ id: string }>(
      `INSERT INTO sections (course_id, title, order_index) VALUES ($1, $2, $3) RETURNING id`,
      [courseId, sections[i].title, i]
    );
    const sectionId = sectionResult.rows[0].id;

    for (let j = 0; j < sections[i].lectures.length; j++) {
      await query(
        `INSERT INTO lectures (section_id, title, content_type, duration_seconds, order_index)
         VALUES ($1, $2, 'video', $3, $4)`,
        [sectionId, sections[i].lectures[j], 300 + j * 120, j]
      );
    }
  }

  console.log('Seed complete.');
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
