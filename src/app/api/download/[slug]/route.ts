import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const slug = url.pathname.split('/').pop()

    if (!slug) {
      return NextResponse.json({ error: 'Slug not provided' }, { status: 400 })
    }

    // Ambil metadata
    const { data, error } = await supabase.storage
      .from('uploads')
      .list(slug)

    if (error || !data || data.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const file = data.find((item) => item.name !== 'metadata.json')

    if (!file) {
      return NextResponse.json({ error: 'File missing' }, { status: 404 })
    }

    const { data: fileUrl } = supabase.storage
      .from('uploads')
      .getPublicUrl(`${slug}/${file.name}`)

    return NextResponse.redirect(fileUrl.publicUrl)
  } catch (err) {
    console.error('❌ Download error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
