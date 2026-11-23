import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProblemSection } from './components/ProblemSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { SimulatorSection } from './components/SimulatorSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AuditModal } from './components/AuditModal';
import { CrossingRecord, QuoteSummary } from './constants';

export default function App() {
  const [selectedRecord, setSelectedRecord] = useState<CrossingRecord | null>(null);
  const [activeQuote, setActiveQuote] = useState<QuoteSummary | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfc] text-[#0f172a]">
      <Navbar />

      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <SimulatorSection
          onAuditRecord={(record) => setSelectedRecord(record)}
          onSelectQuote={(quote) => setActiveQuote(quote)}
        />
        <ContactSection activeQuote={activeQuote} />
      </main>

      <Footer />

      <AuditModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
}
