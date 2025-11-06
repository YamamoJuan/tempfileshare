# 🚀 TempFileShare

Aplikasi berbagi file sementara yang modern dan elegan dibangun dengan Next.js dan Supabase. Bagikan file dengan cepat dan aman menggunakan link yang dibuat otomatis dan akan expired secara otomatis..

![TempFileShare](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Storage-green?style=for-the-badge&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Fitur Utama

- 📤 **Upload Mudah** - Upload file dengan interface yang simpel dan intuitif
- 🔗 **Sharing Instan** - Dapatkan link download yang bisa dibagikan langsung
- 📱 **Responsive Design** - UI cantik yang berfungsi di semua perangkat
- 🔒 **Penyimpanan Aman** - File disimpan dengan aman di Supabase Storage
- ⏰ **Auto Hapus** - File otomatis terhapus setelah 24 jam
- 📋 **Copy Link** - Copy link sharing ke clipboard dengan satu klik
- 🎨 **UI Modern** - Design bersih dengan gradient dan animasi smooth
- ⚡ **Direct Download** - Download langsung tanpa redirect ke halaman lain

## 🛠️ Tech Stack

| Teknologi | Fungsi | Versi |
|-----------|--------|-------|
| **Next.js** | Full-stack React framework | 15.0+ |
| **Supabase** | Backend & penyimpanan file | Terbaru |
| **TypeScript** | Type safety | Terbaru |
| **Tailwind CSS** | Styling & animasi | Terbaru |
| **nanoid** | Generate slug unik | Terbaru |

## 🚀 Cara Install

### Prasyarat

- Node.js 18+ sudah terinstall
- Akun Supabase dan dan project

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/YamamoJuan/tempfileshare.git
cd tempfileshare
npm install
```

### 2. Setup Environment

Buat file `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=url_project_supabase_kamu
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_key_supabase_kamu
```

### 3. Konfigurasi Supabase

#### Buat Storage Bucket
1. Buka Supabase Dashboard
2. Pergi ke **Storage** 
3. Buat bucket baru dengan nama `uploads`
4. Set sebagai **public bucket**

#### Setting Storage Policies
Jalankan SQL berikut di **SQL Editor**:

```sql
-- Policy untuk upload file
CREATE POLICY "Allow public upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'uploads');

-- Policy untuk read/download file
CREATE POLICY "Allow public read access" ON storage.objects 
FOR SELECT USING (bucket_id = 'uploads');

-- Policy untuk delete file (opsional)
CREATE POLICY "Allow public delete" ON storage.objects
FOR DELETE USING (bucket_id = 'uploads');
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) 🎉

## 📁 Struktur Folder

```
src/
├── app/
│   ├── api/
│   │   ├── upload/
│   │   │   └── route.ts          # API upload file
│   │   └── download/
│   │       └── [slug]/
│   │           └── route.ts      # API download file
│   ├── [slug]/
│   │   └── page.tsx             # Halaman download (backup)
│   ├── page.tsx                 # Homepage utama
│   └── layout.tsx               # Layout aplikasi
├── lib/
│   └── supabase.ts             # Konfigurasi Supabase client
└── utils/
    └── generateSlug.ts         # Generate slug unik
```

## 🔧 Cara Kerja

1. **Upload**: User pilih file → generate slug unik → upload ke Supabase Storage
2. **Generate Link**: Buat signed URL dengan expired 24 jam
3. **Share**: User bisa copy link untuk dibagikan
4. **Download**: Orang lain klik link → direct download file
5. **Auto Cleanup**: File otomatis terhapus setelah 24 jam

## 🎨 Design Highlights

- **Tema Hijau Modern**: Gradient emerald-green yang premium
- **Glassmorphism Effect**: Card dengan backdrop blur
- **Smooth Animations**: Hover effects dan scale animations
- **Mobile First**: Responsive di semua ukuran layar
- **Dark Theme**: Easy on the eyes untuk penggunaan lama

## 🔐 Keamanan

- ✅ File disimpan dengan slug random (tidak bisa ditebak)
- ✅ Signed URL dengan expiry time
- ✅ Auto delete file setelah 24 jam
- ✅ No authentication required (anonymous upload)
- ✅ File size limits dari Supabase

## 📝 API Endpoints

### Upload File
```typescript
POST /api/upload
Content-Type: multipart/form-data

Response:
{
  "slug": "ABC123",
  "fileName": "document.pdf", 
  "downloadUrl": "https://...",
  "message": "Upload successful"
}
```

### Download File
```typescript
GET /api/download/[slug]

Response: File binary dengan headers:
- Content-Disposition: attachment; filename="..."
- Content-Type: application/octet-stream
```

## 🚀 Deploy

### Vercel (Recommended)

1. Push code ke GitHub
2. Connect repository di Vercel
3. Set environment variables di Vercel dashboard
4. Deploy! 🎉

### Environment Variables untuk Production
```bash
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

## 🤝 Contributing

Contributions are welcome! Silakan:

1. Fork repository ini
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🙏 Acknowledgments

- **Next.js Team** - Framework yang luar biasa
- **Supabase** - Backend as a Service yang powerful
- **Tailwind CSS** - Utility-first CSS framework
- **Claude AI** - Membantu development dan debugging
- **ChatGPT** - Assistant dalam problem solving

## 📞 Contact

Dibuat dengan ❤️ oleh **juaN**

- GitHub: [@yamamojuan](https://github.com/YamamoJuan)
- Email: yamamojuan@gmail.com
- Website: [yamamojuan.vercel.app](https://yamamojuan.vercel.app)

---

⭐ **Jangan lupa kasih star kalau project ini berguna!** ⭐
