import React from 'react'
import Header from './Header'
import HeroSection from './HeroSection'
import ProblemSection from './ProblemSection'
import SolutionSection from './SolutionSection'
import FeaturesSection from './FeaturesSection'
import HowItWorksSection from './HowItWorksSection'
import TestimonialsSection from './TestimonialsSection'
import PricingSection from './PricingSection'
import FAQSection from './FAQSection'
import Footer from './Footer'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage