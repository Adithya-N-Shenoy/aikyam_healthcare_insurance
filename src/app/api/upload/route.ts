import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string;

    if (!file || !bucket) {
      return NextResponse.json(
        { error: 'Missing file or bucket' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and PDF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename with bucket prefix
    const timestamp = Date.now();
    const uniqueSuffix = `${timestamp}-${Math.random().toString(36).substring(7)}`;
    const fileName = `${bucket}/${uniqueSuffix}-${file.name}`;

    console.log(`📤 Uploading to Vercel Blob: ${fileName}`);

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public', // Public access for bills and room photos
      addRandomSuffix: false, // We already added our own suffix
    });

    console.log('✅ Upload successful:', blob.url);

    return NextResponse.json({
      success: true,
      filePath: blob.pathname,
      publicUrl: blob.url,
      blob
    });

  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}