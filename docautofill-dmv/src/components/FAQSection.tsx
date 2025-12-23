import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const FAQSection = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0)

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I get started with DocAutofill?",
          answer: "Simply create an account, upload photos of your driver's license and vehicle registration, verify the extracted information, and you're ready to auto-fill any DMV form."
        },
        {
          question: "What documents do I need to upload initially?",
          answer: "You'll need photos of your driver's license, vehicle registration, insurance card, and any other DMV-related documents you want to store for quick access."
        },
        {
          question: "How accurate is the AI form detection?",
          answer: "Our AI achieves 99.9% accuracy in field detection. You can review and correct any extracted information before it's saved to your account."
        }
      ]
    },
    {
      category: "Security & Privacy",
      questions: [
        {
          question: "How secure is my personal information?",
          answer: "We use AES-256 encryption (the same standard used by banks) to protect your data. Your information is encrypted both in transit and at rest, and you control access to your account."
        },
        {
          question: "Do you share my information with anyone?",
          answer: "Never. We never share, sell, or provide your personal information to third parties. Your data is solely for your use in filling out DMV forms."
        },
        {
          question: "Can I delete my data?",
          answer: "Yes, you can delete your account and all associated data at any time through your account settings."
        }
      ]
    },
    {
      category: "Using the Service",
      questions: [
        {
          question: "Which DMV forms are supported?",
          answer: "We support all major DMV forms including driver's license renewal, vehicle registration, title transfers, insurance verification, change of address, and accident reports."
        },
        {
          question: "Does it work on mobile devices?",
          answer: "Yes! DocAutofill is fully responsive and works perfectly on smartphones, tablets, and computers."
        },
        {
          question: "What if the AI makes a mistake?",
          answer: "You can review and edit any extracted information before saving it. Our system also learns from corrections to improve accuracy over time."
        }
      ]
    },
    {
      category: "Billing & Plans",
      questions: [
        {
          question: "What's included in the free plan?",
          answer: "The free plan includes up to 5 form fillings per month, basic AI detection, secure storage, and email support."
        },
        {
          question: "Can I change plans anytime?",
          answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
        },
        {
          question: "Do you offer refunds?",
          answer: "We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund."
        }
      ]
    }
  ]

  const toggleFAQ = (categoryIndex: number, questionIndex: number) => {
    const globalIndex = categoryIndex * 1000 + questionIndex
    setOpenFAQ(openFAQ === globalIndex ? null : globalIndex)
  }

  return (
    <section id="faq" className="section-padding bg-gray-50">
      <div className="container">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="section-title mb-6">
            Frequently Asked{' '}
            <span className="text-secondary">Questions</span>
          </h2>
          <p className="section-subtitle">
            Everything you need to know about DocAutofill.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {category.category}
              </h3>
              
              <div className="space-y-4">
                {category.questions.map((faq, questionIndex) => {
                  const globalIndex = categoryIndex * 1000 + questionIndex
                  const isOpen = openFAQ === globalIndex
                  
                  return (
                    <div key={questionIndex} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => toggleFAQ(categoryIndex, questionIndex)}
                        className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <h4 className="text-lg font-semibold text-gray-900 pr-4">
                          {faq.question}
                        </h4>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-secondary flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-6">
                          <div className="border-t border-gray-200 pt-4">
                            <p className="text-gray-700 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="mt-16 text-center">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Still Have Questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Our support team is here to help you get started with DocAutofill.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">
                Start Free Trial
              </button>
              <button className="btn-secondary">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQSection