import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { slug, fileName, size, type } = await req.json()

    if (!slug || !fileName) {
      return NextResponse.json(
        { error: 'slug and fileName required' }, 
        { status: 400 }
      )
    }

    const metadataPath = `${slug}/metadata.json`
    const metadata = {
      originalName: fileName,
      size: size,
      type: type,
      uploadedAt: new Date().toISOString(),
      slug
    }

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(metadataPath, JSON.stringify(metadata, null, 2), {
        contentType: 'application/json',
        upsert: true,
      })

    if (error) {
      console.log('❌ Metadata save error:', error.message)
      return NextResponse.json(
        { error: error.message }, 
        { status: 500 }
      )
    }

    console.log('✅ Metadata saved successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Metadata saved'
    })

  } catch (error) {
    console.log('💥 Metadata save error:', error)
    return NextResponse.json(
      { error: 'Failed to save metadata' },
      { status: 500 }
    )
  }
}