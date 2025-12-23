import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="text-2xl font-bold text-primary-700">
              DocAutofill
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-primary-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-700 hover:text-primary-600 transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-primary-600 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="text-gray-700 hover:text-primary-600 transition-colors">
              FAQ
            </a>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="btn-primary">
                  Dashboard
                </Link>
                <button onClick={handleSignOut} className="btn-outline">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="btn-outline">
                  Sign In
                </Link>
                <Link to="/login" className="btn-primary">
                  Start Free Trial
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <a href="#features" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                Features
              </a>
              <a href="#how-it-works" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                How It Works
              </a>
              <a href="#pricing" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                Pricing
              </a>
              <a href="#faq" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                FAQ
              </a>
              <div className="flex flex-col space-y-2 px-3 py-2">
                {user ? (
                  <>
                    <Link to="/dashboard" className="btn-primary w-full text-center">
                      Dashboard
                    </Link>
                    <button onClick={handleSignOut} className="btn-outline w-full">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn-outline w-full text-center">
                      Sign In
                    </Link>
                    <Link to="/login" className="btn-primary w-full text-center">
                      Start Free Trial
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header