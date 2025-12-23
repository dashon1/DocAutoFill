import React from 'react'
import { Upload, Database, Download, ArrowRight } from 'lucide-react'

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Upload,
      title: "Upload Your Documents",
      description: "Take photos or upload PDFs of your driver's license, vehicle registration, and insurance card.",
      time: "2 minutes",
      details: [
        "Drag and drop or take photos",
        "AI extracts all relevant information",
        "Securely encrypted and stored"
      ]
    },
    {
      icon: Database,
      title: "Verify Your Information",
      description: "Review and confirm the extracted data. Make any corrections needed for accuracy.",
      time: "3 minutes",
      details: [
        "AI-pre-filled form fields",
        "Easy corrections and updates",
        "All information encrypted"
      ]
    },
    {
      icon: Download,
      title: "Auto-Fill Any DMV Form",
      description: "Upload any DMV form and watch as it's automatically filled with your stored information.",
      time: "30 seconds",
      details: [
        "Works with any DMV form",
        "95% of fields auto-filled",
        "Download ready-to-submit forms"
      ]
    }
  ]

  return (
    <section id="how-it-works" className="section-padding bg-white">
      <div className="container">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="section-title mb-6">
            From Upload to Complete Form in{' '}
            <span className="text-secondary">3 Simple Steps</span>
          </h2>
          <p className="section-subtitle">
            Most users complete their first automated DMV form in under 5 minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Step Card */}
              <div className="bg-gray-50 p-8 rounded-xl h-full">
                {/* Step Number */}
                <div className="absolute -top-4 left-8">
                  <div className="bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="pt-4 space-y-6">
                  {/* Icon & Title */}
                  <div className="flex items-center space-x-4">
                    <div className="bg-secondary-100 p-3 rounded-lg">
                      <step.icon className="w-8 h-8 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Details */}
                  <ul className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center text-sm text-gray-600">
                        <ArrowRight className="w-4 h-4 text-secondary mr-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>

                  {/* Time */}
                  <div className="bg-white p-4 rounded-lg border border-secondary-200">
                    <p className="text-center">
                      <span className="text-2xl font-bold text-secondary">{step.time}</span>
                      <br />
                      <span className="text-sm text-gray-600">Average time</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Arrow (except for last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <div className="bg-white p-2 rounded-full shadow-lg">
                    <ArrowRight className="w-6 h-6 text-secondary" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Demo Video Placeholder */}
        <div className="bg-gray-100 rounded-xl p-8 text-center mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            See DocAutofill in Action
          </h3>
          <p className="text-gray-600 mb-6">
            Watch how we transform a 30-minute DMV form into a 2-minute automated process
          </p>
          <div className="bg-gray-300 rounded-lg p-12">
            <p className="text-gray-500">Demo video would go here</p>
          </div>
        </div>

        {/* Quick Start Promise */}
        <div className="text-center bg-gradient-to-r from-primary-50 to-secondary-50 p-8 rounded-xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Start Your Free Trial Today
          </h3>
          <p className="text-lg text-gray-700 mb-6">
            No credit card required. Cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary text-lg px-8 py-4">
              Start Free Trial
            </button>
            <button className="btn-secondary text-lg px-8 py-4">
              View Sample Forms
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection