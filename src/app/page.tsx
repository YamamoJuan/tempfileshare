'use client'

import { useState } from 'react'

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [fileName, setFileName] = useState('')

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setDownloadUrl('') // Reset previous URL

    const formData = new FormData()
    formData.append('file', file)

    try {
      console.log('🚀 Starting upload...')
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      console.log('📡 Response status:', res.status)
      const data = await res.json()
      console.log('📦 Response data:', data)

      if (res.ok && data.downloadUrl) {
        setDownloadUrl(data.downloadUrl)
        setFileName(data.fileName)
        console.log('✅ Upload successful, download URL:', data.downloadUrl)
      } else {
        console.log('❌ Upload failed:', data.error)
        alert(data.error || 'Upload gagal')
      }
    } catch (error) {
      console.log('💥 Upload error:', error)
      alert('Upload error: ' + error)
    }

    setUploading(false)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(downloadUrl)
      alert('link nya udah dicopy ke clipboardmu!')
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 text-white">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
          Temp File Share
        </h1>
        <p className="text-green-200 mt-2">Bagiin file cepet dan aman juga pastinya.</p>
      </div>

      {/* Upload Section */}
      <div className="bg-green-800/30 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-full max-w-md border border-green-600/50">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-green-200 mb-2">
              Choose File
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full p-3 bg-green-900/30 border border-green-600/50 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 file:cursor-pointer"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </div>
            ) : (
              '📤 Upload File'
            )}
          </button>
        </div>
      </div>

      {/* Download Section */}
      {downloadUrl && (
        <div className="bg-green-700/20 backdrop-blur-sm p-6 rounded-xl shadow-2xl w-full max-w-md border border-green-400/40 animate-fadeIn">
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">✅</span>
            </div>
            <h3 className="text-lg font-semibold text-emerald-300 mb-2">File Siap!</h3>
            <p className="text-sm text-green-200 mb-6">
              <span className="font-medium">{fileName}</span> udah bisa didownload!
            </p>
            
            <div className="space-y-3">
              <a 
                href={downloadUrl}
                className="block w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-lg hover:from-emerald-700 hover:to-green-700 font-medium transition-all duration-200 transform hover:scale-105"
              >
                📥 Download sekarang
              </a>
              
              <button
                onClick={copyToClipboard}
                className="w-full bg-green-600/40 text-white px-4 py-2 rounded-lg hover:bg-green-600/60 transition-all duration-200 transform hover:scale-105 text-sm"
                title="Copy link"
              >
                📋 Copy link to share
              </button>
            </div>

            <div className="mt-4 p-3 bg-green-900/40 rounded-lg">
              <p className="text-xs text-green-300 mb-1">Shareable link:</p>
              <div className="text-xs text-emerald-200 break-all font-mono">
                {downloadUrl}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-green-300/70 text-sm">
        <p>Filenya ga kesimpen lama dan bakal kehapus otomatis.</p>
      </div>
    </div>
  )
}