// Illustrative course cards for the landing page's showcase sections.
// These include fields (rating, duration, discount) not yet in the real
// course schema — see README for the note on wiring this to live data
// once those fields exist. Category/course *links* still go to the real
// catalog at /courses.

export interface ShowcaseCourse {
  title: string;
  instructor: string;
  category: string;
  thumbnail: string;
  rating: number;
  reviews: number;
  students: number;
  durationHours: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number | null; // null = free
  originalPrice?: number;
  badge?: 'bestseller' | 'trending';
}

const img = (seed: string) => `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=600&q=80`;

export const FEATURED_COURSES: ShowcaseCourse[] = [
  {
    title: 'Professional Sewing for Beginners',
    instructor: 'Amina Belkacem',
    category: 'Sewing',
    thumbnail: img('photo-1584917865442-de89df76afd3'),
    rating: 4.8,
    reviews: 214,
    students: 1830,
    durationHours: 6,
    level: 'beginner',
    price: 3000,
    originalPrice: 4500,
    badge: 'bestseller',
  },
  {
    title: 'Master Homemade Pastries',
    instructor: 'Sarah Cherif',
    category: 'Cooking',
    thumbnail: img('photo-1509440159596-0249088772ff'),
    rating: 4.9,
    reviews: 356,
    students: 2650,
    durationHours: 8,
    level: 'beginner',
    price: 3500,
  },
  {
    title: 'Modern Makeup Techniques',
    instructor: 'Lina Meziane',
    category: 'Beauty',
    thumbnail: img('photo-1487412947147-5cebf100ffc2'),
    rating: 4.7,
    reviews: 142,
    students: 980,
    durationHours: 5,
    level: 'intermediate',
    price: 2800,
  },
  {
    title: 'Start Your Small Business',
    instructor: 'Nadia Boumediene',
    category: 'Business',
    thumbnail: img('photo-1519389950473-47ba0277781c'),
    rating: 4.6,
    reviews: 98,
    students: 720,
    durationHours: 7,
    level: 'beginner',
    price: 4000,
    originalPrice: 5500,
  },
];

export const TRENDING_COURSES: ShowcaseCourse[] = [
  {
    title: 'Digital Marketing Fundamentals',
    instructor: 'Yasmine Cherif',
    category: 'Digital Skills',
    thumbnail: img('photo-1460925895917-afdab827c52f'),
    rating: 4.8,
    reviews: 301,
    students: 2100,
    durationHours: 6,
    level: 'beginner',
    price: 3200,
    badge: 'trending',
  },
  {
    title: 'Introduction to Web Development',
    instructor: 'Meriem Haddad',
    category: 'Digital Skills',
    thumbnail: img('photo-1461749280684-dccba630e2f6'),
    rating: 4.7,
    reviews: 189,
    students: 1540,
    durationHours: 10,
    level: 'beginner',
    price: 4500,
    badge: 'trending',
  },
  {
    title: 'Embroidery Essentials',
    instructor: 'Amina Belkacem',
    category: 'Embroidery',
    thumbnail: 'https://images.pexels.com/photos/30713763/pexels-photo-30713763.jpeg?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviews: 176,
    students: 1120,
    durationHours: 4,
    level: 'beginner',
    price: 2500,
  },
  {
    title: 'Brand Identity Design',
    instructor: 'Nadia Boumediene',
    category: 'Design',
    thumbnail: img('photo-1561070791-2526d30994b5'),
    rating: 4.6,
    reviews: 87,
    students: 640,
    durationHours: 5,
    level: 'intermediate',
    price: 3800,
  },
];

export const FREE_COURSES: ShowcaseCourse[] = [
  {
    title: 'Getting Started with Baking',
    instructor: 'Sarah Cherif',
    category: 'Baking',
    thumbnail: img('photo-1509440159596-0249088772ff'),
    rating: 4.5,
    reviews: 412,
    students: 5200,
    durationHours: 2,
    level: 'beginner',
    price: null,
  },
  {
    title: 'Sewing Basics: Your First Stitch',
    instructor: 'Amina Belkacem',
    category: 'Sewing',
    thumbnail: img('photo-1521577352947-9bb58764b69a'),
    rating: 4.6,
    reviews: 268,
    students: 3400,
    durationHours: 2,
    level: 'beginner',
    price: null,
  },
  {
    title: 'Personal Finance for Beginners',
    instructor: 'Nadia Boumediene',
    category: 'Business',
    thumbnail: img('photo-1554224155-6726b3ff858f'),
    rating: 4.4,
    reviews: 155,
    students: 2100,
    durationHours: 3,
    level: 'beginner',
    price: null,
  },
  {
    title: 'Skincare Fundamentals',
    instructor: 'Lina Meziane',
    category: 'Beauty',
    thumbnail: img('photo-1596462502278-27bfdc403348'),
    rating: 4.7,
    reviews: 320,
    students: 4100,
    durationHours: 2,
    level: 'beginner',
    price: null,
  },
];
