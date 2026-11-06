import { Hero } from '../components/landing/Hero';
import { CategoriesSection } from '../components/landing/CategoriesSection';
import { FeaturedCoursesSection } from '../components/landing/FeaturedCoursesSection';
import { BenefitsSection } from '../components/landing/BenefitsSection';
import { TrendingCoursesSection } from '../components/landing/TrendingCoursesSection';
import { FreeCoursesSection } from '../components/landing/FreeCoursesSection';
import { InstructorSection } from '../components/landing/InstructorSection';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { StatsSection } from '../components/landing/StatsSection';
import { CertificateSection } from '../components/landing/CertificateSection';
import { FinalCtaSection } from '../components/landing/FinalCtaSection';

export default function HomePage() {
  return (
    <div>
      <Hero />
      <CategoriesSection />
      <FeaturedCoursesSection />
      <BenefitsSection />
      <TrendingCoursesSection />
      <FreeCoursesSection />
      <InstructorSection />
      <TestimonialsSection />
      <StatsSection />
      <CertificateSection />
      <FinalCtaSection />
    </div>
  );
}
