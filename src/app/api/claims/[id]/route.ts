import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = adminDb.collection('claims').doc(params.id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    // Get claim items
    const itemsSnap = await docRef.collection('items').get();
    const items = itemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get document requests
    const docsSnap = await docRef.collection('documentRequests').get();
    const documents = docsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get status history
    const historySnap = await docRef.collection('statusHistory')
      .orderBy('createdAt', 'desc')
      .get();
    const history = historySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const claim = {
      id: docSnap.id,
      ...docSnap.data(),
      claim_items: items,
      document_requests: documents,
      claim_status_history: history
    };

    return NextResponse.json({
      success: true,
      claim
    });

  } catch (error: any) {
    console.error('Claim fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const docRef = adminDb.collection('claims').doc(params.id);

    await docRef.update({
      ...body,
      updatedAt: new Date().toISOString()
    });

    // Add to status history if status changed
    if (body.status) {
      await docRef.collection('statusHistory').add({
        status: body.status,
        notes: body.statusNotes || `Status updated to ${body.status}`,
        createdAt: new Date().toISOString()
      });
    }

    const updatedDoc = await docRef.get();
    return NextResponse.json({
      success: true,
      claim: { id: updatedDoc.id, ...updatedDoc.data() }
    });

  } catch (error: any) {
    console.error('Claim update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}