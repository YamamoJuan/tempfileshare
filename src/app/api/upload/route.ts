import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateSlug } from '@/utils/generateSlug'

export async function POST(req: NextRequest) {
  try {
    // Check request size first
    const contentLength = req.headers.get('content-length')
    if (contentLength) {
      const size = parseInt(contentLength)
      const maxSize = 4 * 1024 * 1024 // 4MB untuk Vercel Free
      
      if (size > maxSize) {
        return NextResponse.json(
          { 
            error: 'File too large for server processing',
            shouldUseDirectUpload: true,
            maxSize: maxSize
          }, 
          { status: 413 }
        )
      }
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 400 })
    }

    console.log('📤 Starting upload for file:', file.name, 'Size:', file.size)

    const slug = generateSlug()
    const filePath = `${slug}/${file.name}`
    const metadataPath = `${slug}/metadata.json`

    console.log('🎯 Generated slug:', slug)

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
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` }, 
        { status: 500 }
      )
    }

    console.log('✅ File uploaded successfully:', uploadData)

    // Upload metadata
    const metadata = {
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      slug
    }

    await supabase.storage
      .from('uploads')
      .upload(metadataPath, JSON.stringify(metadata, null, 2), {
        contentType: 'application/json',
        upsert: true,
      })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin
    const downloadUrl = `${baseUrl}/api/download/${slug}`

    return NextResponse.json({
      success: true,
      slug,
      fileName: file.name,
      fileSize: file.size,
      downloadUrl,
      message: 'Upload successful'
    })

  } catch (error) {
    console.log('💥 Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Generate signed URL untuk direct upload (file besar)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const fileName = searchParams.get('fileName')
    const fileSize = searchParams.get('fileSize')

    if (!fileName) {
      return NextResponse.json({ error: 'fileName required' }, { status: 400 })
    }

    const slug = generateSlug()
    const filePath = `${slug}/${fileName}`

    // Generate signed URL untuk upload langsung ke Supabase
    const { data, error } = await supabase.storage
      .from('uploads')
      .createSignedUploadUrl(filePath)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      path: data.path,
      slug,
      fileName
    })

  } catch (error) {
    console.log('💥 Error generating signed URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}