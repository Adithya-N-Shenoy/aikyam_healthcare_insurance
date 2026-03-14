import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

interface PolicyData {
  id: string;
  policyName?: string;
  policyType?: string;
  agentId?: string;
  companyName?: string;
  isActive?: boolean;
  createdAt?: string;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const policyData = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    const docRef = await adminDb.collection('policies').add(policyData);

    return NextResponse.json({
      success: true,
      policyId: docRef.id,
      policy: { id: docRef.id, ...policyData }
    });

  } catch (error: any) {
    console.error('Policy creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const isActive = searchParams.get('isActive');

    let query: FirebaseFirestore.Query = adminDb.collection('policies');

    if (agentId) {
      query = query.where('agentId', '==', agentId);
    }

    if (isActive !== null) {
      query = query.where('isActive', '==', isActive === 'true');
    }

    const snapshot = await query.get();
    const policies: PolicyData[] = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    } as PolicyData));

    return NextResponse.json({
      success: true,
      policies
    });

  } catch (error: any) {
    console.error('Policy fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}