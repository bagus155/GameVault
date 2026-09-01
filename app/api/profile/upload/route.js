// app/api/profile/upload/route.js
// ─────────────────────────────────────────────
// POST /api/profile/upload
// Accepts multipart/form-data:
//   - file : image file (jpg, png, webp, gif — maks 5 MB)
//   - type : 'avatar' | 'banner'
// Uploads to Supabase Storage bucket "profile-images".
// Returns: { url: 'https://....supabase.co/storage/v1/object/public/...' }
// ─────────────────────────────────────────────
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

const BUCKET         = 'profile-images';
const ALLOWED_TYPES  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file     = formData.get('file');
    const type     = formData.get('type');

    // ── Validation ──
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'File tidak ditemukan.' }, { status: 400 });
    }
    if (!['avatar', 'banner'].includes(type)) {
      return NextResponse.json({ error: 'Tipe harus "avatar" atau "banner".' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'Ukuran file maksimal 5 MB.' }, { status: 400 });
    }

    // ── Upload to Supabase Storage ──
    // Path: profile/{userId}/{type}-{timestamp}.{ext}
    const ext      = file.name.split('.').pop().toLowerCase() || 'jpg';
    const filePath = `profile/${authUser.id}/${type}-${Date.now()}.${ext}`;

    const { error: uploadError } = await getSupabaseAdmin().storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType:  file.type,
        upsert:       true,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('[upload] Supabase Storage error:', uploadError.message);
      return NextResponse.json({ error: 'Upload ke storage gagal.' }, { status: 500 });
    }

    // ── Get public URL ──
    const { data } = getSupabaseAdmin().storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    console.error('[API/profile/upload] Error:', error.message);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
