import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const body = await request.json();
    const supabase = createServerClient();

    // Get the claim ID (handle both UUID and claim number)
    let claimId = params.id;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(params.id)) {
      const { data: claim, error: claimError } = await supabase
        .from('claims')
        .select('id')
        .eq('claim_number', params.id)
        .single();

      if (claimError || !claim) {
        return NextResponse.json(
          { error: 'Claim not found' },
          { status: 404 }
        );
      }
      claimId = claim.id;
    }

    // First check if document exists
    const { data: existingDoc, error: checkError } = await supabase
      .from('document_requests')
      .select('*')
      .eq('id', params.documentId)
      .eq('claim_id', claimId)
      .single();

    if (checkError || !existingDoc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Update document request status
    const updateData = {
      status: body.status,
      updated_at: new Date().toISOString(),
      reviewed_at: new Date().toISOString(),
      reviewed_by: body.agentId || null,
      review_notes: body.notes || null
    };

    const { error: updateError } = await supabase
      .from('document_requests')
      .update(updateData)
      .eq('id', params.documentId);

    if (updateError) {
      console.error('Error updating document:', updateError);
      return NextResponse.json(
        { error: `Failed to update document status: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Add status history
    await supabase
      .from('claim_status_history')
      .insert({
        claim_id: claimId,
        status: `document_${body.status}`,
        notes: body.notes || `Document ${body.status} by agent`,
        created_at: new Date().toISOString()
      });

    // Get updated document
    const { data: updatedDoc } = await supabase
      .from('document_requests')
      .select('*')
      .eq('id', params.documentId)
      .single();

    return NextResponse.json({
      success: true,
      message: `Document ${body.status} successfully`,
      document: updatedDoc
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
    const supabase = createServerClient();

    // Get the claim ID
    let claimId = params.id;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(params.id)) {
      const { data: claim, error: claimError } = await supabase
        .from('claims')
        .select('id')
        .eq('claim_number', params.id)
        .single();

      if (claimError || !claim) {
        return NextResponse.json(
          { error: 'Claim not found' },
          { status: 404 }
        );
      }
      claimId = claim.id;
    }

    const { data: document, error } = await supabase
      .from('document_requests')
      .select('*')
      .eq('id', params.documentId)
      .eq('claim_id', claimId)
      .single();

    if (error) {
      console.error('Error fetching document:', error);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      document
    });

  } catch (error: any) {
    console.error('Document fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}