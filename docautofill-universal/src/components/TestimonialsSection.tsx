import React from 'react'
import { Star, Quote } from 'lucide-react'

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah M.",
      role: "Working Mom",
      content: "I used to dread renewing my driver's license every few years. With DocAutofill, I uploaded my info once and now it takes me 2 minutes instead of 30. Game changer!",
      timeSaved: "28 minutes per renewal",
      rating: 5
    },
    {
      name: "Mike R.",
      role: "Small Business Owner",
      content: "I have to handle DMV paperwork for my delivery vehicles regularly. DocAutofill has saved me hours and prevented so many typos in license numbers and registration details.",
      timeSaved: "2+ hours per month",
      rating: 5
    },
    {
      name: "Jennifer L.",
      role: "Recent College Graduate",
      content: "Moving to a new state meant updating all my vehicle paperwork. DocAutofill made the process painless - everything was accurate and submitted quickly.",
      timeSaved: "45 minutes vs. 2 hours",
      rating: 5
    }
  ]

  const stats = [
    { value: "95%", label: "Time reduction on DMV forms" },
    { value: "99.9%", label: "Accuracy in field detection" },
    { value: "10,000+", label: "Forms automated monthly" },
    { value: "4.9/5", label: "User satisfaction rating" }
  ]

  return (
    <section className="section-padding bg-gray-50">
      <div className="container">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="section-title mb-6">
            Loved by Thousands of{' '}
            <span className="text-secondary">Happy Users</span>
          </h2>
          <p className="section-subtitle">
            Real people saving real time on their DMV paperwork.
          </p>
        </div>

        {/* Success Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl text-center shadow-sm">
              <div className="text-3xl font-bold text-secondary mb-2">
                {stat.value}
              </div>
              <p className="text-gray-600 text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-secondary mb-4" />
              
              {/* Rating */}
              <div className="flex space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Content */}
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </blockquote>

              {/* Time Saved */}
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <p className="text-green-800 font-medium">
                  Time Saved: {testimonial.timeSaved}
                </p>
              </div>

              {/* Author */}
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-gray-600">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Before/After Comparison */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Before vs. After DocAutofill
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <h4 className="text-xl font-semibold text-red-600 mb-4">Before (Manual Process)</h4>
              <ul className="space-y-2 text-gray-700">
                <li>30+ minutes per form</li>
                <li>Frequent typos and errors</li>
                <li>Searching for information</li>
                <li>Stress and frustration</li>
                <li>Multiple attempts sometimes</li>
              </ul>
            </div>
            <div className="text-center">
              <h4 className="text-xl font-semibold text-green-600 mb-4">After (DocAutofill)</h4>
              <ul className="space-y-2 text-gray-700">
                <li>2-5 minutes per form</li>
                <li>99.9% accuracy</li>
                <li>Auto-filled from stored data</li>
                <li>Quick and painless</li>
                <li>Done right the first time</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Industry Recognition */}
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Trusted & Recommended
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-2">4.9/5 Stars</div>
                <p className="text-gray-600">App Store & Google Play</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary mb-2">10,000+</div>
                <p className="text-gray-600">Active Users</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">Featured</div>
                <p className="text-gray-600">Product Hunt, TechCrunch</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection