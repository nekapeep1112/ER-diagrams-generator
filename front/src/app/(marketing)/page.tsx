import Nav from '@/components/marketing/Nav';
import Hero from '@/components/marketing/Hero';
import Logos from '@/components/marketing/Logos';
import HowItWorks from '@/components/marketing/HowItWorks';
import Features from '@/components/marketing/Features';
import LiveDemo from '@/components/marketing/LiveDemo';
import Dialects from '@/components/marketing/Dialects';
import Faq from '@/components/marketing/Faq';
import Footer from '@/components/marketing/Footer';

export default function MarketingPage() {
  return (
    <>
      <Nav />
      <Hero />
      <Logos />
      <HowItWorks />
      <Features />
      <LiveDemo />
      <Dialects />
      <Faq />
      <Footer />
    </>
  );
}
