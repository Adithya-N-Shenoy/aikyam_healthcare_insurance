import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const claimRef = adminDb.collection('claims').doc(params.id);

    await claimRef.update({
      status: body.status,
      updatedAt: new Date().toISOString()
    });

    await claimRef.collection('statusHistory').add({
      status: body.status,
      notes: body.notes || `Status updated to ${body.status}`,
      agentId: body.agentId,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: `Claim status updated to ${body.status}`
    });

  } catch (error: any) {
    console.error('Status update error:', error);
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
      .collection('statusHistory')
      .orderBy('createdAt', 'desc')
      .get();

    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      history
    });

  } catch (error: any) {
    console.error('Status fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}