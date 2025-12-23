import React, { useState, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useUserData, DOCUMENT_CATEGORIES, DocumentCategory } from '../hooks/useUserData'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Building2, 
  Scale, 
  Briefcase, 
  Heart, 
  DollarSign, 
  User,
  Upload,
  FileText,
  Download,
  Eye,
  Trash2,
  Plus,
  Search,
  Filter,
  Settings,
  Brain,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  FileImage,
  File,
  UploadCloud
} from 'lucide-react'

interface FileUploadState {
  isDragging: boolean
  selectedFile: File | null
  isUploading: boolean
  uploadProgress: number
}

const iconMap = {
  Building2,
  Scale,
  Briefcase,
  Heart,
  DollarSign,
  User
}

const statusConfig = {
  uploaded: { icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Uploaded' },
  processing: { icon: Brain, color: 'text-purple-600', bgColor: 'bg-purple-50', label: 'Processing' },
  processed: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', label: 'Processed' },
  completed: { icon: Zap, color: 'text-emerald-600', bgColor: 'bg-emerald-50', label: 'Completed' },
  error: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', label: 'Error' }
}

const DashboardPage = () => {
  const { user, signOut } = useAuth()
  const { 
    loading, 
    universalDocuments,
    documentTemplates,
    activeCategory,
    setActiveCategory,
    uploadUniversalDocument,
    getDocumentsByCategory
  } = useUserData()
  const navigate = useNavigate()

  const [fileUpload, setFileUpload] = useState<FileUploadState>({
    isDragging: false,
    selectedFile: null,
    isUploading: false,
    uploadProgress: 0
  })
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('government')

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setFileUpload(prev => ({ ...prev, isDragging: true }))
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setFileUpload(prev => ({ ...prev, isDragging: false }))
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setFileUpload(prev => ({ ...prev, isDragging: false }))
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      setFileUpload(prev => ({ ...prev, selectedFile: files[0] }))
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setFileUpload(prev => ({ ...prev, selectedFile: files[0] }))
    }
  }

  const handleUpload = async () => {
    if (!fileUpload.selectedFile) return

    setFileUpload(prev => ({ ...prev, isUploading: true, uploadProgress: 0 }))

    try {
      const documentName = fileUpload.selectedFile.name.replace(/\.[^/.]+$/, '')
      await uploadUniversalDocument(fileUpload.selectedFile, uploadCategory, documentName)
      
      // Reset upload state
      setFileUpload({
        isDragging: false,
        selectedFile: null,
        isUploading: false,
        uploadProgress: 100
      })
      
      setShowUploadModal(false)
      
      // Reset after short delay
      setTimeout(() => {
        setFileUpload(prev => ({ ...prev, uploadProgress: 0 }))
      }, 2000)
      
    } catch (error) {
      console.error('Upload failed:', error)
      setFileUpload(prev => ({ ...prev, isUploading: false }))
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return FileImage
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredDocuments = universalDocuments.filter(doc => {
    const matchesCategory = doc.document_category === activeCategory
    const matchesSearch = doc.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.original_filename.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

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
          <p className="text-gray-600">Loading your documents...</p>
        </div>
      </div>
    )
  }

  const activeCategoryData = DOCUMENT_CATEGORIES.find(cat => cat.id === activeCategory)
  const IconComponent = activeCategoryData ? iconMap[activeCategoryData.icon as keyof typeof iconMap] : FileText

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
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
            Document Automation Dashboard
          </h1>
          <p className="text-gray-600">
            Upload, process, and manage your documents with AI-powered field detection and auto-fill.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Documents</h3>
                <p className="text-3xl font-bold text-primary-600">{universalDocuments.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Processed</h3>
                <p className="text-3xl font-bold text-green-600">
                  {universalDocuments.filter(doc => doc.status === 'processed' || doc.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Templates</h3>
                <p className="text-3xl font-bold text-blue-600">{documentTemplates.length}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Processing</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {universalDocuments.filter(doc => doc.status === 'processing').length}
                </p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Document Categories</h2>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Document</span>
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {DOCUMENT_CATEGORIES.map((category) => {
              const IconComponent = iconMap[category.icon as keyof typeof iconMap]
              const isActive = activeCategory === category.id
              const count = universalDocuments.filter(doc => doc.document_category === category.id).length
              
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id as DocumentCategory)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isActive 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className={`h-6 w-6 mb-2 ${
                    isActive ? 'text-primary-600' : 'text-gray-600'
                  }`} />
                  <h3 className={`font-semibold mb-1 ${
                    isActive ? 'text-primary-900' : 'text-gray-900'
                  }`}>
                    {category.name}
                  </h3>
                  <p className={`text-sm ${
                    isActive ? 'text-primary-700' : 'text-gray-600'
                  }`}>
                    {count} document{count !== 1 ? 's' : ''}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Active Category Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <IconComponent className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeCategoryData?.name} Documents
                </h2>
                <p className="text-gray-600">{activeCategoryData?.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button 
                onClick={() => alert('Filter functionality will be available when connected to Supabase backend')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Filter documents"
              >
                <Filter className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredDocuments.map((document) => {
              const statusInfo = statusConfig[document.status || 'uploaded']
              const StatusIcon = statusInfo.icon
              const FileIcon = getFileIcon(document.mime_type)
              
              return (
                <div key={document.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <FileIcon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {document.document_name}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {document.original_filename}
                          </p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Size:</span>
                        <span className="text-gray-900">{formatFileSize(document.file_size)}</span>
                      </div>
                      {document.confidence_score && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Confidence:</span>
                          <span className="text-gray-900">{(document.confidence_score * 100).toFixed(1)}%</span>
                        </div>
                      )}
                      {document.fields_detected && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Fields:</span>
                          <span className="text-gray-900">{document.fields_detected}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(document.created_at!).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <UploadCloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {activeCategoryData?.name.toLowerCase()} documents yet
            </h3>
            <p className="text-gray-600 mb-6">
              Upload your first {activeCategoryData?.name.toLowerCase()} document to get started with AI-powered processing.
            </p>
            <button 
              onClick={() => {
                setUploadCategory(activeCategory)
                setShowUploadModal(true)
              }}
              className="btn-primary"
            >
              Upload Document
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-6 rounded-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <button 
              onClick={() => {
                setUploadCategory(activeCategory)
                setShowUploadModal(true)
              }}
              className="bg-white p-4 rounded-lg text-left hover:shadow-md transition-shadow"
            >
              <Upload className="h-6 w-6 text-primary-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Upload Document</h3>
              <p className="text-sm text-gray-600">Add a new document for processing</p>
            </button>
            <button className="bg-white p-4 rounded-lg text-left hover:shadow-md transition-shadow">
              <Brain className="h-6 w-6 text-purple-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">AI Processing</h3>
              <p className="text-sm text-gray-600">Process documents with AI</p>
            </button>
            <button className="bg-white p-4 rounded-lg text-left hover:shadow-md transition-shadow">
              <Settings className="h-6 w-6 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Create Template</h3>
              <p className="text-sm text-gray-600">Build a new document template</p>
            </button>
            <button className="bg-white p-4 rounded-lg text-left hover:shadow-md transition-shadow">
              <Download className="h-6 w-6 text-green-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Export Data</h3>
              <p className="text-sm text-gray-600">Download processed data</p>
            </button>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Upload Document</h2>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Category Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Document Category
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {DOCUMENT_CATEGORIES.map((category) => {
                    const IconComponent = iconMap[category.icon as keyof typeof iconMap]
                    const isSelected = uploadCategory === category.id
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => setUploadCategory(category.id as DocumentCategory)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          isSelected 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <IconComponent className={`h-5 w-5 mb-2 ${
                          isSelected ? 'text-primary-600' : 'text-gray-600'
                        }`} />
                        <div className={`font-medium text-sm ${
                          isSelected ? 'text-primary-900' : 'text-gray-900'
                        }`}>
                          {category.name}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* File Upload Area */}
              <div className="mb-6">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    fileUpload.isDragging 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <UploadCloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Drop your document here or click to browse
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Supports PDF, DOC, DOCX, TXT, and image files
                  </p>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="btn-primary cursor-pointer">
                    Choose File
                  </label>
                </div>

                {/* Selected File */}
                {fileUpload.selectedFile && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <File className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">{fileUpload.selectedFile.name}</p>
                          <p className="text-sm text-gray-600">
                            {formatFileSize(fileUpload.selectedFile.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setFileUpload(prev => ({ ...prev, selectedFile: null }))}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {fileUpload.isUploading && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Uploading...</span>
                      <span>{fileUpload.uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${fileUpload.uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="btn-outline"
                  disabled={fileUpload.isUploading}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpload}
                  className="btn-primary"
                  disabled={!fileUpload.selectedFile || fileUpload.isUploading}
                >
                  {fileUpload.isUploading ? 'Uploading...' : 'Upload & Process'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
