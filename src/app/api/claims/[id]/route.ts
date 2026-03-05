import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { id } = params;

    console.log('Looking up claim with identifier:', id);

    // Build query with all related data
    let query = supabase
      .from('claims')
      .select(`
        *,
        insurance_companies (
          id,
          name,
          code
        ),
        claim_items (*),
        document_requests (*),
        review_notes (
          *,
          agents (
            name,
            email
          )
        ),
        claim_status_history (*)
      `);

    // Check if the id is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) {
      // It's a UUID, search by id
      query = query.eq('id', id);
    } else {
      // It's a claim number, search by claim_number
      query = query.eq('claim_number', id);
    }

    const { data: claim, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Claim not found' },
          { status: 404 }
        );
      }
      console.error('Claim fetch error:', error);
      return NextResponse.json(
        { error: `Failed to fetch claim: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      claim
    });

  } catch (error: any) {
    console.error('Claim API error:', error);
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
    const supabase = createServerClient();
    const { id } = params;

    // First find the claim by either UUID or claim number
    let claimId = id;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(id)) {
      // It's a claim number, get the actual UUID
      const { data: claim } = await supabase
        .from('claims')
        .select('id')
        .eq('claim_number', id)
        .single();

      if (!claim) {
        return NextResponse.json(
          { error: 'Claim not found' },
          { status: 404 }
        );
      }
      claimId = claim.id;
    }

    // Update claim
    const { data: claim, error } = await supabase
      .from('claims')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', claimId)
      .select(`
        *,
        insurance_companies (
          id,
          name,
          code
        ),
        claim_items (*),
        document_requests (*),
        review_notes (
          *,
          agents (
            name,
            email
          )
        ),
        claim_status_history (*)
      `)
      .single();

    if (error) {
      console.error('Claim update error:', error);
      return NextResponse.json(
        { error: `Failed to update claim: ${error.message}` },
        { status: 500 }
      );
    }

    // Create status history if status changed
    if (body.status) {
      await supabase
        .from('claim_status_history')
        .insert({
          claim_id: claimId,
          status: body.status,
          notes: body.statusNotes || `Status updated to ${body.status}`
        });
    }

    return NextResponse.json({
      success: true,
      claim
    });

  } catch (error: any) {
    console.error('Claim API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}