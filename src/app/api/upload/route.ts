import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!bucket) {
      return NextResponse.json(
        { error: 'No bucket specified' },
        { status: 400 }
      );
    }

    // Map bucket names to actual Supabase bucket names
    const bucketMap: Record<string, string> = {
      'bills': 'medical-bills',        // Map 'bills' to 'medical-bills'
      'room-photos': 'room-photos',     // Keep as is
      'medical-bills': 'medical-bills'  // Allow direct use too
    };

    const actualBucket = bucketMap[bucket] || bucket;

    // Validate that the bucket exists in our allowed list
    const allowedBuckets = ['medical-bills', 'room-photos'];
    if (!allowedBuckets.includes(actualBucket)) {
      return NextResponse.json(
        { error: `Invalid bucket: ${bucket}. Allowed buckets: medical-bills, room-photos` },
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

    console.log('Creating Supabase client...');
    const supabase = createServerClient();
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = fileName;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log(`Uploading to bucket: ${actualBucket}, path: ${filePath}`);

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(actualBucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      
      // Provide more helpful error messages
      if (uploadError.message.includes('Bucket not found')) {
        return NextResponse.json(
          { error: `Bucket '${actualBucket}' not found. Please create it in Supabase dashboard.` },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(actualBucket)
      .getPublicUrl(filePath);

    console.log('Upload successful, public URL:', publicUrl);

    return NextResponse.json({
      success: true,
      filePath: data.path,
      publicUrl
    });

  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}