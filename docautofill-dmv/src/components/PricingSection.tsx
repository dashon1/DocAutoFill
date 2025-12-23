import React from 'react'
import { Check, Star, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const PricingSection = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out DocAutofill",
      features: [
        "Up to 5 form fillings per month",
        "Basic AI form detection",
        "Secure data storage",
        "Email support",
        "Mobile app access"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Premium",
      price: "$4.99",
      period: "/month",
      description: "Best for regular DMV users",
      features: [
        "Unlimited form fillings",
        "Advanced AI detection",
        "Priority support",
        "Form history & tracking",
        "Export to PDF",
        "Multiple profile support"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Family",
      price: "$9.99",
      period: "/month",
      description: "Share with your family",
      features: [
        "Everything in Premium",
        "Up to 6 family members",
        "Shared vehicle information",
        "Family form templates",
        "Dedicated support",
        "Advanced security features"
      ],
      cta: "Start Free Trial",
      popular: false
    }
  ]

  return (
    <section id="pricing" className="section-padding bg-white">
      <div className="container">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="section-title mb-6">
            Simple, Transparent{' '}
            <span className="text-secondary">Pricing</span>
          </h2>
          <p className="section-subtitle mb-8">
            Choose the plan that fits your needs. Start free, upgrade anytime.
          </p>
          
          {/* Free Trial Banner */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
            <p className="text-green-800 font-medium">
              14-Day Free Trial • No Credit Card Required • Cancel Anytime
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div key={index} className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
              plan.popular ? 'border-secondary scale-105' : 'border-gray-200'
            }`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-secondary text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-xl text-gray-600">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link 
                to="/login" 
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors text-center block ${
                  plan.popular 
                    ? 'bg-secondary text-white hover:bg-secondary-700' 
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-gray-50 p-8 rounded-xl mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Pricing Questions
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. No long-term contracts or cancellation fees.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is my data secure?</h4>
              <p className="text-gray-600">Absolutely. We use AES-256 encryption and never share your personal information with third parties.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What forms are supported?</h4>
              <p className="text-gray-600">All major DMV forms including driver's license renewal, vehicle registration, title transfers, and insurance verification.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h4>
              <p className="text-gray-600">Yes, we offer a 30-day money-back guarantee if you're not completely satisfied.</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-gradient-to-r from-primary-600 to-secondary-600 p-8 rounded-xl text-white">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Simplify Your DMV Experience?
          </h3>
          <p className="text-xl mb-6 opacity-90">
            Join thousands who've automated their DMV paperwork
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="bg-white text-primary-700 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <button className="border-2 border-white text-white hover:bg-white hover:text-primary-700 font-semibold py-3 px-8 rounded-lg transition-all">
              View Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PricingSection