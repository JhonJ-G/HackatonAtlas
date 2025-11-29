import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import BenefitsSection from '../components/landing/BenefitsSection';
import CallToActionSection from '../components/landing/CallToActionSection';

const Landing = () => {
  return (
    <div className="bg-white">
      <HeroSection />
      <BenefitsSection />
      <CallToActionSection />
    </div>
  );
};

export default Landing;