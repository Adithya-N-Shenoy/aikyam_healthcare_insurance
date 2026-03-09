import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const supabase = createServerClient();
    const { id } = params;
    const { status, notes, agentId } = body;

    // Get the claim ID (handle both UUID and claim number)
    let claimId = id;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(id)) {
      const { data: claim, error: claimError } = await supabase
        .from('claims')
        .select('id')
        .eq('claim_number', id)
        .single();

      if (claimError || !claim) {
        return NextResponse.json(
          { error: 'Claim not found' },
          { status: 404 }
        );
      }
      claimId = claim.id;
    }

    // Update claim status
    const { error: updateError } = await supabase
      .from('claims')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', claimId);

    if (updateError) {
      console.error('Error updating claim status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update claim status' },
        { status: 500 }
      );
    }

    // Add status history
    const { error: historyError } = await supabase
      .from('claim_status_history')
      .insert({
        claim_id: claimId,
        status: status,
        notes: notes || `Status updated to ${status}`,
        changed_by: agentId,
        created_at: new Date().toISOString()
      });

    if (historyError) {
      console.error('Error adding status history:', historyError);
    }

    return NextResponse.json({
      success: true,
      message: `Claim status updated to ${status}`
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
    const supabase = createServerClient();
    const { id } = params;

    // Get the claim ID
    let claimId = id;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(id)) {
      const { data: claim, error: claimError } = await supabase
        .from('claims')
        .select('id')
        .eq('claim_number', id)
        .single();

      if (claimError || !claim) {
        return NextResponse.json(
          { error: 'Claim not found' },
          { status: 404 }
        );
      }
      claimId = claim.id;
    }

    // Get status history
    const { data: history, error: historyError } = await supabase
      .from('claim_status_history')
      .select('*')
      .eq('claim_id', claimId)
      .order('created_at', { ascending: false });

    if (historyError) {
      console.error('Error fetching status history:', historyError);
      return NextResponse.json(
        { error: 'Failed to fetch status history' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      history: history || []
    });

  } catch (error: any) {
    console.error('Status fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}