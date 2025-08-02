import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateSlug } from '@/utils/generateSlug';

// ======== POST /api/download/[slug] — Upload File ==========
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 400 });
    }

    const slug = generateSlug();
    const filePath = `${slug}/${file.name}`;
    const metadataPath = `${slug}/metadata.json`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload file utama
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Upload metadata
    const metadata = {
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      slug,
    };

    await supabase.storage.from('uploads').upload(
      metadataPath,
      JSON.stringify(metadata, null, 2),
      {
        contentType: 'application/json',
        upsert: true,
      }
    );

    // Buat signed URL untuk download
    const { data: signedUrl, error: signedError } = await supabase.storage
      .from('uploads')
      .createSignedUrl(filePath, 60 * 60 * 24, {
        download: file.name,
      });

    if (signedError || !signedUrl) {
      return NextResponse.json({ error: 'Failed to create download link' }, { status: 500 });
    }

    return NextResponse.json({
      slug,
      fileName: file.name,
      downloadUrl: signedUrl.signedUrl,
      message: 'Upload successful',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ======== GET /api/download/[slug] — Download File ==========
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;

  // Ambil semua file dalam folder slug
  const { data: files, error: listError } = await supabase.storage
    .from('uploads')
    .list(slug);

  if (listError || !files || files.length === 0) {
    return NextResponse.json({ error: 'Files not found' }, { status: 404 });
  }

  // Cari file utama (selain metadata.json)
  const file = files.find(f => f.name !== 'metadata.json');

  if (!file) {
    return NextResponse.json({ error: 'No downloadable file found' }, { status: 404 });
  }

  const filePath = `${slug}/${file.name}`;

  // Buat signed URL untuk download
  const { data: signedUrl, error: urlError } = await supabase.storage
    .from('uploads')
    .createSignedUrl(filePath, 60 * 60, {
      download: file.name,
    });

  if (urlError || !signedUrl) {
    return NextResponse.json({ error: 'Failed to create signed URL' }, { status: 500 });
  }

  // Redirect ke URL download Supabase
  return NextResponse.redirect(signedUrl.signedUrl, 302);
}
