import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const claimRef = adminDb.collection('claims').doc(params.id);

    const {
      agentName,
      agentEmail,
      agentPhone,
      reviewNotes,
      items,
      action,
      documentRequests,
      companyId
    } = body;

    // Update claim items
    if (items && items.length > 0) {
      const batch = adminDb.batch();
      items.forEach((item: any) => {
        if (item.id) {
          const itemRef = claimRef.collection('items').doc(item.id);
          batch.update(itemRef, {
            approvedAmount: item.approved_amount,
            rejectedAmount: item.rejected_amount,
            rejectionReason: item.rejection_reason,
            status: item.status,
            updatedAt: new Date().toISOString()
          });
        }
      });
      await batch.commit();
    }

    // Calculate totals
    const itemsSnap = await claimRef.collection('items').get();
    const totalApproved = itemsSnap.docs.reduce(
      (sum, doc) => sum + (doc.data().approvedAmount || 0), 0
    );
    const totalRejected = itemsSnap.docs.reduce(
      (sum, doc) => sum + (doc.data().rejectedAmount || 0), 0
    );

    // Determine final status
    let finalStatus = body.status || 'under_review';
    if (action === 'approve') finalStatus = 'approved';
    else if (action === 'reject') finalStatus = 'rejected';
    else if (action === 'partial') finalStatus = 'partial';

    // Update claim
    await claimRef.update({
      status: finalStatus,
      agentName,
      agentEmail,
      agentPhone,
      companyId,
      totalApprovedAmount: totalApproved,
      totalRejectedAmount: totalRejected,
      reviewedAt: new Date().toISOString(),
      completedAt: ['approved', 'rejected', 'completed'].includes(finalStatus) 
        ? new Date().toISOString() 
        : null,
      updatedAt: new Date().toISOString()
    });

    // Add review notes
    if (reviewNotes) {
      await claimRef.collection('reviewNotes').add({
        notes: reviewNotes,
        agentName,
        agentEmail,
        createdAt: new Date().toISOString()
      });
    }

    // Add status history
    await claimRef.collection('statusHistory').add({
      status: finalStatus,
      notes: `Claim ${finalStatus} by ${agentName}`,
      agentName,
      createdAt: new Date().toISOString()
    });

    // Handle document requests
    if (documentRequests && documentRequests.length > 0) {
      const batch = adminDb.batch();
      documentRequests.forEach((req: any) => {
        const docRef = claimRef.collection('documentRequests').doc();
        batch.set(docRef, {
          ...req,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      message: `Claim ${finalStatus} successfully`,
      status: finalStatus
    });

  } catch (error: any) {
    console.error('Review API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}