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

    console.log('📤 Starting upload for file:', file.name, 'Size:', file.size)

    const slug = generateSlug()
    const filePath = `${slug}/${file.name}`
    const metadataPath = `${slug}/metadata.json`

    console.log('🎯 Generated slug:', slug)
    console.log('📂 File path:', filePath)

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload file utama
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.log('❌ Upload error:', uploadError.message)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    console.log('✅ File uploaded successfully:', uploadData)

    // Upload metadata file
    const metadata = {
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      slug: slug
    }

    const { data: metaData, error: metaError } = await supabase.storage
      .from('uploads')
      .upload(metadataPath, JSON.stringify(metadata, null, 2), {
        contentType: 'application/json',
        upsert: true,
      })

    if (metaError) {
      console.log('⚠️ Metadata upload error:', metaError.message)
      // Tidak return error karena file utama sudah berhasil
    } else {
      console.log('✅ Metadata uploaded successfully:', metaData)
    }

    // Verify upload dengan list files
    const { data: verifyFiles, error: verifyError } = await supabase.storage
      .from('uploads')
      .list(slug)

    console.log('🔍 Verification - files in folder:', verifyFiles)
    if (verifyError) {
      console.log('⚠️ Verification error:', verifyError.message)
    }

    // Generate direct download URL dengan parameter download
    const { data: signedUrl, error: signedError } = await supabase.storage
      .from('uploads')
      .createSignedUrl(filePath, 60 * 60 * 24, {
        download: file.name // Set filename untuk download
      })

    if (signedError) {
      console.log('❌ Signed URL error:', signedError.message)
      return NextResponse.json({ error: 'Failed to create download link' }, { status: 500 })
    }

    console.log('✅ Signed URL created:', signedUrl?.signedUrl)

    return NextResponse.json({ 
      slug,
      fileName: file.name,
      downloadUrl: signedUrl?.signedUrl,
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