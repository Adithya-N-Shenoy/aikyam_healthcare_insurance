import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

interface ClaimData {
  id: string;
  companyId?: string;
  status?: string;
  claimNumber?: string;
  patientName?: string;
  totalRequestedAmount?: number;
  createdAt?: string;
  [key: string]: any; // For other dynamic fields
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Add timestamps
    const claimData = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: body.status || 'submitted'
    };

    // Save to Firestore
    const docRef = await adminDb.collection('claims').add(claimData);

    return NextResponse.json({
      success: true,
      claimId: docRef.id,
      claimNumber: body.claimNumber || docRef.id
    });

  } catch (error: any) {
    console.error('Claims API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');
    const claimNumber = searchParams.get('claimNumber');
    const patientName = searchParams.get('patientName');

    let query: FirebaseFirestore.Query = adminDb.collection('claims');

    if (companyId) {
      query = query.where('companyId', '==', companyId);
    }
    if (status) {
      query = query.where('status', '==', status);
    }
    if (claimNumber) {
      query = query.where('claimNumber', '==', claimNumber);
    }
    if (patientName) {
      query = query.where('patientName', '>=', patientName)
                   .where('patientName', '<=', patientName + '\uf8ff');
    }

    const snapshot = await query.get();
    const claims: ClaimData[] = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    } as ClaimData));

    return NextResponse.json({
      success: true,
      claims
    });

  } catch (error: any) {
    console.error('Claims fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}