import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    console.log('Review API received:', body);

    const { 
      agentName, 
      agentEmail, 
      agentPhone, 
      reviewNotes, 
      items,
      action,
      documentRequests,
      companyId,
      statusNotes
    } = body;

    // Validate that action is present
    if (!action) {
      console.error('No action provided in request body');
      return NextResponse.json(
        { error: 'No action specified. Please select approve, reject, or partial.' },
        { status: 400 }
      );
    }

    console.log('Processing review with action:', action);

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

    // First, create or get agent with all credentials
    let agentId = null;
    if (agentEmail) {
      // Check if agent already exists
      const { data: existingAgent } = await supabase
        .from('agents')
        .select('*')
        .eq('email', agentEmail)
        .single();

      if (existingAgent) {
        agentId = existingAgent.id;
        // Update existing agent with latest info
        await supabase
          .from('agents')
          .update({
            name: agentName,
            phone: agentPhone,
            updated_at: new Date().toISOString()
          })
          .eq('id', agentId);
      } else {
        // Create new agent
        const { data: newAgent, error: createError } = await supabase
          .from('agents')
          .insert({
            name: agentName,
            email: agentEmail,
            phone: agentPhone,
            company_id: companyId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating agent:', createError);
        } else {
          agentId = newAgent?.id;
        }
      }
    }

    // Handle document requests first (if any)
    if (documentRequests && documentRequests.length > 0) {
      for (const docRequest of documentRequests) {
        await supabase
          .from('document_requests')
          .insert({
            claim_id: claimId,
            requested_by: agentId,
            document_type: docRequest.documentType,
            description: docRequest.description,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }

      // If this is just a document request (no approval/rejection yet)
      if (action === 'request_documents') {
        await supabase
          .from('claims')
          .update({
            status: 'documents_requested',
            agent_id: agentId,
            updated_at: new Date().toISOString()
          })
          .eq('id', claimId);

        // Add status history
        await supabase
          .from('claim_status_history')
          .insert({
            claim_id: claimId,
            status: 'documents_requested',
            notes: `Additional documents requested by ${agentName}`,
            created_at: new Date().toISOString()
          });

        // Add review notes
        if (reviewNotes) {
          await supabase
            .from('review_notes')
            .insert({
              claim_id: claimId,
              agent_id: agentId,
              notes: reviewNotes,
              is_private: false,
              created_at: new Date().toISOString()
            });
        }

        return NextResponse.json({
          success: true,
          message: 'Document requests sent successfully',
          status: 'documents_requested'
        });
      }
    }

    // Update claim items with approved/rejected amounts
    if (items && items.length > 0) {
      for (const item of items) {
        await supabase
          .from('claim_items')
          .update({
            approved_amount: item.approved_amount,
            rejected_amount: item.rejected_amount,
            rejection_reason: item.rejection_reason,
            status: item.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);
      }
    }

    // Calculate totals
    const { data: updatedItems } = await supabase
      .from('claim_items')
      .select('*')
      .eq('claim_id', claimId);

    const totalApproved = updatedItems?.reduce((sum, item) => sum + (item.approved_amount || 0), 0) || 0;
    const totalRejected = updatedItems?.reduce((sum, item) => sum + (item.rejected_amount || 0), 0) || 0;

    // Determine final status based on action
    let finalStatus = body.status || 'under_review';
    if (action === 'approve') {
      finalStatus = 'approved';
    } else if (action === 'reject') {
      finalStatus = 'rejected';
    } else if (action === 'partial') {
      finalStatus = 'partial';
    } else if (action === 'complete') {
      finalStatus = 'completed';
    } else if (action === 'save') {
      finalStatus = 'under_review';
    }

    console.log(`Setting claim status to: ${finalStatus} based on action: ${action}`);

    // Update claim with all data
    const claimUpdateData = {
      status: finalStatus,
      agent_id: agentId,
      total_approved_amount: totalApproved,
      total_rejected_amount: totalRejected,
      reviewed_at: new Date().toISOString(),
      completed_at: ['approved', 'rejected', 'completed'].includes(finalStatus) ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };

    console.log('Updating claim with:', claimUpdateData);

    const { error: updateError } = await supabase
      .from('claims')
      .update(claimUpdateData)
      .eq('id', claimId);

    if (updateError) {
      console.error('Error updating claim:', updateError);
      return NextResponse.json(
        { error: `Failed to update claim: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Add review notes
    if (reviewNotes) {
      await supabase
        .from('review_notes')
        .insert({
          claim_id: claimId,
          agent_id: agentId,
          notes: reviewNotes,
          is_private: false,
          created_at: new Date().toISOString()
        });
    }

    // Add status history
    await supabase
      .from('claim_status_history')
      .insert({
        claim_id: claimId,
        status: finalStatus,
        notes: statusNotes || `Claim ${finalStatus} by ${agentName}`,
        created_at: new Date().toISOString()
      });

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