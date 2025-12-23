import React from 'react'
import { Clock, Shield, Zap, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

const HeroSection = () => {
  return (
    <section className="section-padding bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="section-title">
                Stop Fighting with{' '}
                <span className="text-secondary">DMV Forms</span>
              </h1>
              <p className="section-subtitle">
                Auto-fill your driver's license, vehicle registration, and insurance forms in seconds. Store your personal data securely and never fill out the same DMV paperwork again.
              </p>
            </div>

            {/* Value Proposition Stack */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-secondary" />
                <span className="text-gray-700 font-medium">5 minutes instead of 30</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-secondary" />
                <span className="text-gray-700 font-medium">Secure data storage</span>
              </div>
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-secondary" />
                <span className="text-gray-700 font-medium">AI-powered detection</span>
              </div>
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-secondary" />
                <span className="text-gray-700 font-medium">All DMV forms supported</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login" className="btn-primary text-lg px-8 py-4">
                Start Free Trial
              </Link>
              <a href="#how-it-works" className="btn-secondary text-lg px-8 py-4">
                See How It Works
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">AES-256 Encryption Active</span>
              </div>
              <p className="text-sm text-gray-600">
                Join thousands who've simplified their DMV paperwork
              </p>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            <div className="relative">
              <img
                src="/docautofill_hero_banner.png"
                alt="DocAutofill - DMV form automation"
                className="w-full h-auto rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection