import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const requestId = formData.get('requestId') as string;

    if (!file || !requestId) {
      return NextResponse.json(
        { error: 'Missing file or requestId' },
        { status: 400 }
      );
    }

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
        console.error('Claim not found:', claimError);
        return NextResponse.json(
          { error: 'Claim not found' },
          { status: 404 }
        );
      }
      claimId = claim.id;
    }

    // First, check if document request exists
    const { data: existingRequest, error: checkError } = await supabase
      .from('document_requests')
      .select('*')
      .eq('id', requestId)
      .eq('claim_id', claimId)
      .single();

    if (checkError || !existingRequest) {
      console.error('Document request not found:', checkError);
      return NextResponse.json(
        { error: 'Document request not found' },
        { status: 404 }
      );
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `documents/${claimId}/${fileName}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log(`Uploading document to storage: ${filePath}`);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('claim-documents')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload document: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('claim-documents')
      .getPublicUrl(filePath);

    console.log('Document uploaded, public URL:', publicUrl);

    // Update document request with comprehensive data
    const updateData = {
      status: 'submitted',
      submitted_url: publicUrl,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      storage_path: filePath
    };

    console.log('Updating document request with:', updateData);

    const { error: updateError } = await supabase
      .from('document_requests')
      .update(updateData)
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating document request:', updateError);
      return NextResponse.json(
        { error: `Failed to update document request: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Verify the update was successful
    const { data: verifiedRequest, error: verifyError } = await supabase
      .from('document_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (verifyError) {
      console.error('Error verifying update:', verifyError);
    } else {
      console.log('Document request updated successfully:', verifiedRequest);
    }

    // Add status history
    await supabase
      .from('claim_status_history')
      .insert({
        claim_id: claimId,
        status: 'documents_submitted',
        notes: `Patient submitted document: ${file.name}`,
        created_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        id: requestId,
        url: publicUrl,
        status: 'submitted',
        submitted_at: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Document upload error:', error);
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

    const { data: documents, error } = await supabase
      .from('document_requests')
      .select('*')
      .eq('claim_id', claimId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      documents: documents || []
    });

  } catch (error: any) {
    console.error('Document fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}