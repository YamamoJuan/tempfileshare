'use client'

import { useState } from 'react'

export default function UploadPage() {
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
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setDownloadUrl(data.downloadUrl)
        setFileName(data.fileName)
      } else {
        alert(data.error || 'Upload gagal')
      }
    } catch (error) {
      alert('Upload error: ' + error)
    }

    setUploading(false)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(downloadUrl)
      alert('Link copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center gap-4 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold">Upload Temporary File</h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full p-2 bg-gray-700 rounded text-white"
        />

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {downloadUrl && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
          <h3 className="text-lg font-semibold mb-2">File Ready!</h3>
          <p className="text-sm text-gray-300 mb-4">File: {fileName}</p>
          
          <div className="flex gap-2">
            <a 
              href={downloadUrl} 
              download
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
            >
              📥 Download Now
            </a>
            
            <button
              onClick={copyToClipboard}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              title="Copy link"
            >
              📋
            </button>
          </div>

          <div className="mt-3 p-2 bg-gray-700 rounded text-xs break-all">
            {downloadUrl}
          </div>
        </div>
      )}
    </div>
  )
}