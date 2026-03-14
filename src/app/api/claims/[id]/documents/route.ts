import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase/admin';
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const requestId = formData.get('requestId') as string;

    if (!file || !requestId) {
      return NextResponse.json(
        { error: 'Missing file or requestId' },
        { status: 400 }
      );
    }

    // Upload to Firebase Storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${uuidv4()}-${file.name}`;
    const filePath = `documents/${params.id}/${fileName}`;

    const bucket = adminStorage.bucket();
    const blob = bucket.file(filePath);
    await blob.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          originalName: file.name,
          requestId: requestId
        }
      }
    });

    // Get public URL
    const [url] = await blob.getSignedUrl({
      action: 'read',
      expires: '03-01-2500' // Far future expiry
    });

    // Update document request in Firestore
    await adminDb.collection('claims').doc(params.id)
      .collection('documentRequests').doc(requestId)
      .update({
        status: 'submitted',
        submittedUrl: url,
        submittedAt: new Date().toISOString(),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        storagePath: filePath
      });

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      url
    });

  } catch (error: any) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const snapshot = await adminDb.collection('claims').doc(params.id)
      .collection('documentRequests')
      .orderBy('createdAt', 'desc')
      .get();

    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      documents
    });

  } catch (error: any) {
    console.error('Document fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}