// File: /src/app/api/download/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type Props = {
  params: Promise<{ slug: string }>
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const { slug } = await params

    // Get files in folder
    const { data: files, error } = await supabase.storage
      .from('uploads')
      .list(slug)

    if (error || !files || files.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Filter actual files
    const actualFiles = files.filter(file => 
      file.name !== '.emptyFolderPlaceholder' && 
      !file.name.endsWith('.json') &&
      !file.name.startsWith('.')
    )

    if (actualFiles.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const file = actualFiles[0]
    const filePath = `${slug}/${file.name}`

    // Download file content
    const { data, error: downloadError } = await supabase.storage
      .from('uploads')
      .download(filePath)

    if (downloadError || !data) {
      return NextResponse.json({ error: 'Download failed' }, { status: 500 })
    }

    // Convert blob to array buffer
    const arrayBuffer = await data.arrayBuffer()

    // Return file with proper headers for direct download
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${file.name}"`,
        'Content-Length': arrayBuffer.byteLength.toString(),
      },
    })

  } catch (error) {
    console.log('💥 Download error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}