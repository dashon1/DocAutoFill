import React from 'react'
import { Brain, Shield, Smartphone, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const SolutionSection = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="section-title mb-6">
            DocAutofill: Your{' '}
            <span className="text-secondary">Personal DMV Assistant</span>
          </h2>
          <p className="section-subtitle">
            Store your personal information securely once, then auto-fill any DMV form in seconds.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left Column - Key Benefits */}
          <div className="space-y-8">
            <div className="grid gap-6">
              <div className="flex items-start space-x-4">
                <div className="bg-secondary-100 p-3 rounded-lg">
                  <Brain className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    AI-Powered Form Detection
                  </h3>
                  <p className="text-gray-600">
                    Automatically identifies and fills fields in any DMV form - driver's license, registration, title transfer, and more.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-secondary-100 p-3 rounded-lg">
                  <Shield className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Secure Data Storage
                  </h3>
                  <p className="text-gray-600">
                    Your personal information is encrypted with AES-256 and stored securely. Only you can access your data.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-secondary-100 p-3 rounded-lg">
                  <Smartphone className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Mobile-Friendly
                  </h3>
                  <p className="text-gray-600">
                    Works perfectly on your phone, tablet, or computer. Fill forms anywhere, anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - What You Store */}
          <div className="bg-gray-50 p-8 rounded-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Store Once, Use Forever
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Driver's License Information</span>
                </div>
                <span className="text-sm text-gray-500">One-time setup</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Vehicle Details</span>
                </div>
                <span className="text-sm text-gray-500">Auto-updates</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Insurance Information</span>
                </div>
                <span className="text-sm text-gray-500">Secure & encrypted</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Personal Contact Details</span>
                </div>
                <span className="text-sm text-gray-500">Always accurate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Supported Forms */}
        <div className="text-center mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Supports All Major DMV Forms
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              "Driver's License Renewal",
              "Vehicle Registration",
              "Title Transfer",
              "Insurance Verification",
              "Change of Address",
              "Accident Report"
            ].map((form, index) => (
              <div key={index} className="bg-gray-100 p-4 rounded-lg text-center">
                <span className="text-sm font-medium text-gray-700">{form}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary-600 to-secondary-600 p-8 rounded-xl text-white">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Simplify Your DMV Experience?
          </h3>
          <p className="text-xl mb-6 opacity-90">
            Stop wasting time on repetitive forms. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="bg-white text-primary-700 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors">
              Start Free Trial
            </Link>
            <a href="#how-it-works" className="border-2 border-white text-white hover:bg-white hover:text-primary-700 font-semibold py-3 px-8 rounded-lg transition-all">
              See How It Works
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SolutionSection