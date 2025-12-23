import React from 'react'
import { AlertTriangle, Clock, FileX, Users } from 'lucide-react'

const ProblemSection = () => {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="section-title mb-6">
            DMV Paperwork Is a{' '}
            <span className="text-red-600">Time-Wasting Nightmare</span>
          </h2>
          <p className="section-subtitle">
            Every year, millions of Americans waste hours filling out the same DMV forms over and over.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Problem Stats */}
          <div className="space-y-8">
            <div className="grid gap-8">
              {/* Common DMV Issues */}
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                <div className="flex items-start space-x-4">
                  <Clock className="w-8 h-8 text-red-500 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Time Wasted on Repetitive Forms
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center">
                        <FileX className="w-4 h-4 text-red-500 mr-2" />
                        <span>Driver's license renewal takes 30+ minutes</span>
                      </li>
                      <li className="flex items-center">
                        <FileX className="w-4 h-4 text-red-500 mr-2" />
                        <span>Vehicle registration requires same info every year</span>
                      </li>
                      <li className="flex items-center">
                        <FileX className="w-4 h-4 text-red-500 mr-2" />
                        <span>Insurance verification forms repeat basic details</span>
                      </li>
                      <li className="flex items-center">
                        <FileX className="w-4 h-4 text-red-500 mr-2" />
                        <span>Title transfers require re-entering personal data</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Form Errors */}
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
                <div className="flex items-start space-x-4">
                  <AlertTriangle className="w-8 h-8 text-orange-500 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Common Form Mistakes
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center">
                        <FileX className="w-4 h-4 text-orange-500 mr-2" />
                        <span>Typos in license number or expiration dates</span>
                      </li>
                      <li className="flex items-center">
                        <FileX className="w-4 h-4 text-orange-500 mr-2" />
                        <span>Inconsistent address information across forms</span>
                      </li>
                      <li className="flex items-center">
                        <FileX className="w-4 h-4 text-orange-500 mr-2" />
                        <span>Missing required fields cause delays</span>
                      </li>
                      <li className="flex items-center">
                        <FileX className="w-4 h-4 text-orange-500 mr-2" />
                        <span>Outdated insurance information</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Impact Quote */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-center space-y-6">
              <Clock className="w-16 h-16 text-red-500 mx-auto" />
              <blockquote className="text-xl text-gray-700 italic leading-relaxed">
                "The average American spends 3-4 hours per year just on DMV form filling. Multiply that by 250 million licensed drivers, and we're looking at 750 million hours wasted annually."
              </blockquote>
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">
                  That's time you could spend with family, at work, or pursuing your hobbies.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Pain Points */}
        <div className="mt-16 bg-blue-50 p-8 rounded-xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Why DMV Forms Are So Frustrating
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <Users className="w-8 h-8 text-blue-600 mx-auto" />
              <div className="text-2xl font-bold text-gray-900">Same Info</div>
              <p className="text-gray-700">Every form asks for the same basic personal details</p>
            </div>
            <div className="space-y-2">
              <FileX className="w-8 h-8 text-orange-600 mx-auto" />
              <div className="text-2xl font-bold text-gray-900">Complex Forms</div>
              <p className="text-gray-700">Long, confusing forms with legal terminology</p>
            </div>
            <div className="space-y-2">
              <Clock className="w-8 h-8 text-red-600 mx-auto" />
              <div className="text-2xl font-bold text-gray-900">Time Consuming</div>
              <p className="text-gray-700">What should take 5 minutes takes 30+ minutes</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProblemSection