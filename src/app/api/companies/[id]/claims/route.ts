import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

interface ClaimSummary {
  id: string;
  status: string;
  totalRequestedAmount?: number;
  companyId?: string;
  patientName?: string;
  claimNumber?: string;
  createdAt?: string;
  [key: string]: any;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const snapshot = await adminDb.collection('claims')
      .where('companyId', '==', params.id)
      .orderBy('createdAt', 'desc')
      .get();

    const claims: ClaimSummary[] = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    } as ClaimSummary));

    // Calculate summary
    const summary = {
      total: claims.length,
      pending: claims.filter(c => ['submitted', 'under_review'].includes(c.status || '')).length,
      approved: claims.filter(c => ['approved', 'completed'].includes(c.status || '')).length,
      rejected: claims.filter(c => c.status === 'rejected').length,
      totalAmount: claims.reduce((sum, c) => sum + (c.totalRequestedAmount || 0), 0)
    };

    return NextResponse.json({
      success: true,
      claims,
      summary
    });

  } catch (error: any) {
    console.error('Company claims fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}