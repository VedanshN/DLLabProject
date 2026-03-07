import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DemoSection from './components/DemoSection';
import Workflow from './components/Workflow';
import ComparisonSlider from './components/ComparisonSlider';
import ModelCards from './components/ModelCards';
import Results from './components/Results';
import ImplementationDetails from './components/ImplementationDetails';
import Footer from './components/Footer';

export default function App() {
  const [liveGrayscaleUrl, setLiveGrayscaleUrl] = useState<string | null>(null);
  const [liveColorizedUrl, setLiveColorizedUrl] = useState<string | null>(null);

  const handleColorized = (grayscaleUrl: string, colorizedUrl: string) => {
    setLiveGrayscaleUrl(grayscaleUrl);
    setLiveColorizedUrl(colorizedUrl);
  };

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <DemoSection onColorized={handleColorized} />
        <ComparisonSlider
          liveGrayscaleUrl={liveGrayscaleUrl}
          liveColorizedUrl={liveColorizedUrl}
        />
        <Workflow />
        <ModelCards />
        <Results />
        <ImplementationDetails />
      </main>
      <Footer />
    </>
  );
}
