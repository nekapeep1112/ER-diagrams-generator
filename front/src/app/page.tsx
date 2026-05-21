import { PublicNav } from '@/components/layout/PublicNav';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { LiveDemo } from '@/components/landing/LiveDemo';
import { Dialects } from '@/components/landing/Dialects';
import { TemplatesTeaser } from '@/components/landing/TemplatesTeaser';
import { FinalCTA } from '@/components/landing/FinalCTA';

export default function LandingPage() {
  return (
    <>
      <PublicNav />
      <Hero />
      <HowItWorks />
      <LiveDemo />
      <Dialects />
      <TemplatesTeaser />
      <FinalCTA />
      <Footer />
    </>
  );
}
