import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useUserData } from '../hooks/useUserData'
import { Link, useNavigate } from 'react-router-dom'

const DashboardPage = () => {
  const { user, signOut } = useAuth()
  const { 
    loading, 
    personalData, 
    licenseInfo, 
    vehicleInfo, 
    insuranceInfo, 
    processedForms 
  } = useUserData()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to access the dashboard.</p>
          <Link to="/login" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your data...</p>
        </div>
      </div>
    )
  }

  const isDataComplete = personalData && licenseInfo && vehicleInfo && insuranceInfo

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-primary-700">
              DocAutofill
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.email}</span>
              <button onClick={handleSignOut} className="btn-outline">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your stored information and fill DMV forms quickly.
          </p>
        </div>

        {/* Setup Status */}
        {!isDataComplete && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Complete Your Profile Setup
            </h3>
            <p className="text-yellow-700 mb-4">
              To start using DocAutofill, please add your personal information, driver's license, vehicle, and insurance details.
            </p>
            <button className="btn-primary">
              Set Up Profile
            </button>
          </div>
        )}

        {/* Status Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Data</h3>
            <p className={`text-2xl font-bold mb-1 ${
              personalData ? 'text-green-600' : 'text-gray-400'
            }`}>
              {personalData ? 'Complete' : 'Missing'}
            </p>
            <p className="text-sm text-gray-600">
              {personalData ? 'Ready to use' : 'Please add information'}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">License Info</h3>
            <p className={`text-2xl font-bold mb-1 ${
              licenseInfo ? 'text-green-600' : 'text-gray-400'
            }`}>
              {licenseInfo ? 'Active' : 'Missing'}
            </p>
            <p className="text-sm text-gray-600">
              {licenseInfo?.expiration_date ? `Expires ${licenseInfo.expiration_date}` : 'Please add license'}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Vehicle Data</h3>
            <p className={`text-2xl font-bold mb-1 ${
              vehicleInfo ? 'text-green-600' : 'text-gray-400'
            }`}>
              {vehicleInfo ? `${vehicleInfo.year} ${vehicleInfo.make}` : 'Missing'}
            </p>
            <p className="text-sm text-gray-600">
              {vehicleInfo ? 'Registration current' : 'Please add vehicle'}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Insurance</h3>
            <p className={`text-2xl font-bold mb-1 ${
              insuranceInfo ? 'text-green-600' : 'text-gray-400'
            }`}>
              {insuranceInfo ? insuranceInfo.provider : 'Missing'}
            </p>
            <p className="text-sm text-gray-600">
              {insuranceInfo?.policy_expiration ? `Valid until ${insuranceInfo.policy_expiration}` : 'Please add insurance'}
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Stored Data */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Stored Information</h2>
            
            <div className="space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Personal Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  {personalData ? (
                    <>
                      <p><span className="font-medium">Name:</span> {personalData.first_name} {personalData.last_name}</p>
                      <p><span className="font-medium">Email:</span> {personalData.email}</p>
                      <p><span className="font-medium">Phone:</span> {personalData.phone}</p>
                      <p><span className="font-medium">Address:</span> {personalData.street_address}, {personalData.city}, {personalData.state} {personalData.zip_code}</p>
                    </>
                  ) : (
                    <p className="text-gray-500 italic">No personal information added yet</p>
                  )}
                </div>
              </div>

              {/* License Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Driver's License</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  {licenseInfo ? (
                    <>
                      <p><span className="font-medium">Number:</span> {licenseInfo.license_number}</p>
                      <p><span className="font-medium">Class:</span> {licenseInfo.license_class}</p>
                      <p><span className="font-medium">Expiration:</span> {licenseInfo.expiration_date}</p>
                    </>
                  ) : (
                    <p className="text-gray-500 italic">No license information added yet</p>
                  )}
                </div>
              </div>

              {/* Vehicle Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Vehicle Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  {vehicleInfo ? (
                    <>
                      <p><span className="font-medium">Vehicle:</span> {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}</p>
                      <p><span className="font-medium">License Plate:</span> {vehicleInfo.license_plate}</p>
                      <p><span className="font-medium">VIN:</span> {vehicleInfo.vin}</p>
                      <p><span className="font-medium">Registration:</span> {vehicleInfo.registration_number}</p>
                      <p><span className="font-medium">Reg. Expires:</span> {vehicleInfo.registration_expiration}</p>
                    </>
                  ) : (
                    <p className="text-gray-500 italic">No vehicle information added yet</p>
                  )}
                </div>
              </div>

              {/* Insurance Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Insurance Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  {insuranceInfo ? (
                    <>
                      <p><span className="font-medium">Provider:</span> {insuranceInfo.provider}</p>
                      <p><span className="font-medium">Policy Number:</span> {insuranceInfo.policy_number}</p>
                      <p><span className="font-medium">Coverage:</span> {insuranceInfo.coverage_type}</p>
                      <p><span className="font-medium">Expiration:</span> {insuranceInfo.policy_expiration}</p>
                    </>
                  ) : (
                    <p className="text-gray-500 italic">No insurance information added yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Forms</h2>
            
            {processedForms.length > 0 ? (
              <div className="space-y-4">
                {processedForms.slice(0, 5).map((form, index) => (
                  <div key={form.id || index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{form.form_name || form.form_type}</h3>
                      <p className="text-sm text-gray-600">{form.created_at}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      form.status === 'completed' ? 'bg-green-100 text-green-800' :
                      form.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {form.status || 'pending'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No forms processed yet</p>
                <p className="text-sm text-gray-400">Upload your first DMV form to get started</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t">
              <button className="btn-primary w-full">
                Start New Form
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-primary-50 to-secondary-50 p-6 rounded-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="bg-white p-4 rounded-lg text-left hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">Upload New Document</h3>
              <p className="text-sm text-gray-600">Add or update your stored information</p>
            </button>
            <button className="bg-white p-4 rounded-lg text-left hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">Fill DMV Form</h3>
              <p className="text-sm text-gray-600">Start a new form with your data</p>
            </button>
            <button className="bg-white p-4 rounded-lg text-left hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">View Form History</h3>
              <p className="text-sm text-gray-600">See your completed forms</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage