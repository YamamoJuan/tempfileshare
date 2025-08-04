'use client'

import { useState } from 'react'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  // Main upload function dengan hybrid system
  const handleUpload = async (file: File) => {
    const maxServerSize = 4 * 1024 * 1024 // 4MB
    
    console.log('🚀 Starting upload for:', file.name, 'Size:', file.size)
    setError('')
    setUploadProgress(10)

    // Jika file kecil (< 4MB), upload via server
    if (file.size <= maxServerSize) {
      console.log('📤 Using server upload (file < 4MB)')
      
      const formData = new FormData()
      formData.append('file', file)
      setUploadProgress(30)

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        setUploadProgress(80)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Server upload failed:', errorText)
          throw new Error(`Upload failed: ${response.status}`)
        }

        const data = await response.json()
        console.log('✅ Server upload success:', data)
        setUploadProgress(100)
        return data

      } catch (error) {
        console.error('💥 Server upload error:', error)
        throw error
      }
    } 
    
    // Jika file besar (> 4MB), upload langsung ke Supabase
    else {
      console.log('📤 Using direct upload (file > 4MB)')
      
      try {
        setUploadProgress(20)
        
        // 1. Get signed URL dari server
        const urlResponse = await fetch(
          `/api/upload?fileName=${encodeURIComponent(file.name)}&fileSize=${file.size}`
        )
        
        if (!urlResponse.ok) {
          throw new Error('Failed to get upload URL')
        }
        
        const { signedUrl, slug, fileName } = await urlResponse.json()
        console.log('🔗 Got signed URL for direct upload')
        setUploadProgress(40)

        // 2. Upload langsung ke Supabase
        const uploadResponse = await fetch(signedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          },
        })

        setUploadProgress(70)

        if (!uploadResponse.ok) {
          throw new Error('Direct upload to Supabase failed')
        }

        console.log('✅ Direct upload success')
        setUploadProgress(85)

        // 3. Save metadata via server
        const metadataResponse = await fetch('/api/upload/metadata', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slug,
            fileName: file.name,
            size: file.size,
            type: file.type,
          }),
        })

        setUploadProgress(95)

        const baseUrl = window.location.origin
        const downloadUrl = `${baseUrl}/api/download/${slug}`

        setUploadProgress(100)

        return {
          success: true,
          slug,
          fileName: file.name,
          fileSize: file.size,
          downloadUrl,
          message: 'Direct upload successful'
        }

      } catch (error) {
        console.error('💥 Direct upload error:', error)
        throw error
      }
    }
  }

  // Handle file selection
  const onFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setUploadSuccess(false)
    setDownloadUrl('')
    setError('')
  }

  // Handle upload button click
  const onUploadClick = async () => {
    if (!file) return

    try {
      setUploading(true)
      setUploadProgress(0)
      
      const result = await handleUpload(file)
      
      // Handle success
      setDownloadUrl(result.downloadUrl)
      setUploadSuccess(true)
      
    } catch (error) {
      console.error('Upload failed:', error)
      setError('Upload failed. Please try again.')
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(downloadUrl)
      alert('Download URL copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          📤 Temp File Share
        </h1>

        {/* File Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose File
          </label>
          <input
            type="file"
            onChange={onFileSelect}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
          />
          
          {file && (
            <div className="mt-2 text-sm text-gray-600">
              <p><strong>File:</strong> {file.name}</p>
              <p><strong>Size:</strong> {formatFileSize(file.size)}</p>
              <p><strong>Upload method:</strong> {file.size > 4*1024*1024 ? 'Direct to Supabase (Large file)' : 'Via Server (Small file)'}</p>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <button
          onClick={onUploadClick}
          disabled={!file || uploading}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
            !file || uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>

        {/* Progress Bar */}
        {uploading && (
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1 text-center">
              {uploadProgress}% uploaded
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Success Message */}
        {uploadSuccess && downloadUrl && (
          <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded-lg">
            <h3 className="text-green-800 font-medium mb-2">✅ Upload Successful!</h3>
            <div className="space-y-2">
              <input
                type="text"
                value={downloadUrl}
                readOnly
                className="w-full p-2 text-sm bg-white border rounded text-gray-600"
              />
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  📋 Copy URL
                </button>
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 text-center"
                >
                  📥 Download
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}