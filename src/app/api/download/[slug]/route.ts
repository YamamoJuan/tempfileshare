import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const slug = url.pathname.split('/').pop()

  if (!slug) {
    return NextResponse.json({ error: 'Slug not provided' }, { status: 400 })
  }

  const { data: list, error: listError } = await supabase.storage
    .from('uploads')
    .list(slug)

  if (listError || !list) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const file = list.find((item) => item.name !== 'metadata.json')
  if (!file) {
    return NextResponse.json({ error: 'File missing' }, { status: 404 })
  }

  const filePath = `${slug}/${file.name}`

  const { data: fileData, error: downloadError } = await supabase.storage
    .from('uploads')
    .download(filePath)

  if (downloadError || !fileData) {
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }

  const arrayBuffer = await fileData.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${file.name}"`,
    },
  })
}
