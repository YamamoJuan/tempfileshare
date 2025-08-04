import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateSlug } from '@/utils/generateSlug'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 400 })
    }

    // Validasi size file (50MB maksimal)
    const maxSize = 50 * 1024 * 1024; // 50MB dalam bytes
    if (file.size > maxSize) {
      console.log('❌ File too large:', file.size, 'bytes. Max:', maxSize, 'bytes')
      return NextResponse.json(
        { 
          error: 'File too large. Maximum size is 50MB',
          fileSize: file.size,
          maxSize: maxSize
        }, 
        { status: 413 }
      )
    }

    // Validasi tipe file (opsional - sesuaikan kebutuhan)
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/zip',
      'application/x-zip-compressed', 'application/octet-stream'
    ]
    
    if (!allowedTypes.includes(file.type) && file.type !== '') {
      console.log('❌ Invalid file type:', file.type)
      return NextResponse.json(
        { error: 'File type not allowed' }, 
        { status: 400 }
      )
    }

    console.log('📤 Starting upload for file:', file.name, 'Size:', file.size, 'Type:', file.type)

    const slug = generateSlug()
    const filePath = `${slug}/${file.name}`
    const metadataPath = `${slug}/metadata.json`

    console.log('🎯 Generated slug:', slug)
    console.log('📂 File path:', filePath)

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload file utama ke Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.log('❌ Supabase upload error:', uploadError.message)
      
      // Handle specific Supabase errors
      if (uploadError.message.includes('Payload too large')) {
        return NextResponse.json(
          { error: 'File too large for storage service' }, 
          { status: 413 }
        )
      }
      
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` }, 
        { status: 500 }
      )
    }

    console.log('✅ File uploaded successfully:', uploadData)

    // Upload metadata file
    const metadata = {
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      slug,
      sizeFormatted: formatFileSize(file.size)
    }

    const { data: metaData, error: metaError } = await supabase.storage
      .from('uploads')
      .upload(metadataPath, JSON.stringify(metadata, null, 2), {
        contentType: 'application/json',
        upsert: true,
      })

    if (metaError) {
      console.log('⚠️ Metadata upload error:', metaError.message)
      // Don't fail the whole request if metadata fails
    } else {
      console.log('✅ Metadata uploaded successfully:', metaData)
    }

    // Buat base URL dari env atau fallback ke origin
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin
    const downloadUrl = `${baseUrl}/api/download/${slug}`

    console.log('🔗 Final download URL:', downloadUrl)

    return NextResponse.json({
      success: true,
      slug,
      fileName: file.name,
      fileSize: file.size,
      fileSizeFormatted: formatFileSize(file.size),
      downloadUrl,
      message: 'Upload successful'
    })

  } catch (error) {
    console.log('💥 Unexpected error:', error)
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('PayloadTooLargeError') || 
          error.message.includes('Request entity too large')) {
        return NextResponse.json(
          { error: 'File too large. Please try a smaller file.' }, 
          { status: 413 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function untuk format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}