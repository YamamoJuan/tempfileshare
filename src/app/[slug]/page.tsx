import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function Page(props: Props) {
  // Await params sebelum menggunakan propertinya
  const params = await props.params
  const slug = params.slug

  console.log('🔍 Accessing slug:', slug)

  // ambil isi folder berdasarkan slug (karena file disimpan di path: slug/filename)
  const { data: files, error } = await supabase.storage
    .from('uploads')
    .list(slug)

  console.log('📁 Files found:', files)
  console.log('❌ Error:', error)

  if (error) {
    console.log('❌ Supabase error:', error.message)
    return notFound()
  }

  if (!files || files.length === 0) {
    console.log('📭 No files found in folder:', slug)
    return notFound()
  }

  // Filter out folder dan metadata files, ambil file asli
  const actualFiles = files.filter(file => 
    file.name !== '.emptyFolderPlaceholder' && 
    !file.name.endsWith('.json') &&
    !file.name.startsWith('.')
  )

  console.log('📄 Actual files:', actualFiles)

  if (actualFiles.length === 0) {
    console.log('📭 No actual files found after filtering')
    return notFound()
  }

  const matched = actualFiles[0]
  if (!matched) return notFound()

  const filePath = `${slug}/${matched.name}`

  const { data: signed, error: signedError } = await supabase.storage
    .from('uploads')
    .createSignedUrl(filePath, 60 * 10)

  if (signedError || !signed) return notFound()

  return (
    <main style={{ textAlign: 'center', marginTop: '60px' }}>
      <h1>File Siap Diunduh</h1>
      <p>Nama: {matched.name}</p>
      <a href={signed.signedUrl} download>
        Klik untuk download
      </a>
    </main>
  )
}