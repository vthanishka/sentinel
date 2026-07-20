import { LandingNav } from '@/components/marketing/LandingNav';
import { ArchitectureSection } from '@/components/marketing/sections/ArchitectureSection';
import { ControlRoomSection } from '@/components/marketing/sections/ControlRoomSection';
import { DecisionReviewSection } from '@/components/marketing/sections/DecisionReviewSection';
import { Hero } from '@/components/marketing/sections/Hero';
import { MissionLogsSection } from '@/components/marketing/sections/MissionLogsSection';
import { NumbersSection } from '@/components/marketing/sections/NumbersSection';
import { OpsMapSection } from '@/components/marketing/sections/OpsMapSection';
import { SiteFooter } from '@/components/marketing/sections/SiteFooter';
import { TimelineSection } from '@/components/marketing/sections/TimelineSection';

// The landing, composed as a run of operations "dispatches": an editorial hero
// masthead, then bespoke broadcast sections (timeline, live map, VAR review,
// scattered telemetry, system blueprint, mission logs, control-room entrance).
// Small client islands (nav, scroll-reveal) over static, crawlable HTML.
export default function HomePage() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <LandingNav />

      <main id="main">
        <Hero />
        <TimelineSection />
        <OpsMapSection />
        <DecisionReviewSection />
        <NumbersSection />
        <ArchitectureSection />
        <MissionLogsSection />
        <ControlRoomSection />
      </main>

      <SiteFooter />
    </>
  );
}
