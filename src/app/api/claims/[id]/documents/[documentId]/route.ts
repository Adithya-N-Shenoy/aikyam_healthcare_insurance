import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const body = await request.json();
    const { id, documentId } = params;

    const docRef = adminDb.collection('claims').doc(id)
      .collection('documentRequests').doc(documentId);

    await docRef.update({
      status: body.status,
      reviewedAt: new Date().toISOString(),
      reviewNotes: body.notes,
      reviewedBy: body.agentId
    });

    const updated = await docRef.get();
    return NextResponse.json({
      success: true,
      message: `Document ${body.status} successfully`,
      document: { id: updated.id, ...updated.data() }
    });

  } catch (error: any) {
    console.error('Document update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const docRef = adminDb.collection('claims').doc(params.id)
      .collection('documentRequests').doc(params.documentId);
    
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      document: { id: docSnap.id, ...docSnap.data() }
    });

  } catch (error: any) {
    console.error('Document fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}