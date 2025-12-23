import React from 'react'
import { Brain, Database, Shield, Smartphone, Zap, FileText } from 'lucide-react'

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "Smart Form Recognition",
      description: "Our AI automatically detects form fields and fills them with your stored information. No templates needed."
    },
    {
      icon: Database,
      title: "Personal Data Vault",
      description: "Store your license, vehicle, and insurance information securely. Update once, use everywhere."
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "AES-256 encryption protects your sensitive information. You control access to your data."
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Fill forms on any device. Responsive design works perfectly on phones, tablets, and computers."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Complete DMV forms in minutes instead of hours. Our smart detection fills 95% of fields automatically."
    },
    {
      icon: FileText,
      title: "All DMV Forms",
      description: "Supports driver's license renewal, vehicle registration, title transfers, insurance verification, and more."
    }
  ]

  return (
    <section id="features" className="section-padding bg-gray-50">
      <div className="container">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="section-title mb-6">
            Everything You Need for{' '}
            <span className="text-secondary">DMV Form Automation</span>
          </h2>
          <p className="section-subtitle">
            Simple, secure, and fast. DocAutofill handles all your DMV paperwork automatically.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-secondary-100 p-3 rounded-lg w-fit mb-6">
                <feature.icon className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Security Badge */}
        <div className="mt-16 text-center">
          <div className="bg-white p-6 rounded-xl shadow-lg inline-block">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-green-600" />
              <span className="text-lg font-semibold text-gray-900">AES-256 Encryption Active</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Your personal information is protected with the same encryption used by banks
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection