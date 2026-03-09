import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 30; // Maximum duration in seconds
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createServerClient();

    console.log('Received claim data:', body);

    // Validate required fields
    const requiredFields = [
      'companyId', 'patientName', 'patientDob', 'patientGender',
      'patientPhone', 'policyNumber', 'admissionDate', 'admissionType',
      'staffName', 'staffDesignation', 'staffPhone', 'staffEmail',
      'billFileUrl', 'roomPhotoUrl'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // First, get the actual UUID for the insurance company
    const { data: companyData, error: companyError } = await supabase
      .from('insurance_companies')
      .select('id')
      .eq('code', body.companyId) // Assuming body.companyId contains the code like 'ACKO'
      .single();

    if (companyError || !companyData) {
      console.error('Company lookup error:', companyError);
      
      // Try looking up by name if code fails
      const { data: companyByName } = await supabase
        .from('insurance_companies')
        .select('id')
        .ilike('name', `%${body.companyId}%`)
        .single();

      if (!companyByName) {
        return NextResponse.json(
          { error: `Insurance company not found: ${body.companyId}` },
          { status: 404 }
        );
      }
      
      body.companyId = companyByName.id;
    } else {
      body.companyId = companyData.id;
    }

    // Generate claim number
    const claimNumber = `CLM-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    // Calculate length of stay if discharge date provided
    let lengthOfStay = null;
    if (body.dischargeDate && body.admissionDate) {
      const admission = new Date(body.admissionDate);
      const discharge = new Date(body.dischargeDate);
      lengthOfStay = Math.ceil((discharge.getTime() - admission.getTime()) / (1000 * 60 * 60 * 24));
    }

    console.log('Inserting claim with companyId:', body.companyId);

    // Insert claim
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .insert({
        claim_number: claimNumber,
        company_id: body.companyId, // Now this should be a valid UUID
        status: 'submitted',
        patient_name: body.patientName,
        patient_dob: body.patientDob,
        patient_gender: body.patientGender,
        patient_phone: body.patientPhone,
        patient_email: body.patientEmail,
        policy_number: body.policyNumber,
        patient_address: body.patientAddress,
        admission_date: body.admissionDate,
        discharge_date: body.dischargeDate,
        admission_type: body.admissionType,
        length_of_stay: lengthOfStay,
        staff_name: body.staffName,
        staff_designation: body.staffDesignation,
        staff_phone: body.staffPhone,
        staff_email: body.staffEmail,
        bill_file_url: body.billFileUrl,
        room_photo_url: body.roomPhotoUrl,
        total_requested_amount: body.totalRequested || 0
      })
      .select()
      .single();

    if (claimError) {
      console.error('Claim insert error:', claimError);
      return NextResponse.json(
        { error: `Failed to create claim: ${claimError.message}` },
        { status: 500 }
      );
    }

    // Insert claim items if provided
    if (body.medicalCharges && body.medicalCharges.length > 0) {
      const itemsToInsert = body.medicalCharges.map((item: any) => ({
        claim_id: claim.id,
        category: item.category,
        subcategory: item.subcategory,
        field_name: item.fieldName,
        requested_amount: item.requestedAmount || 0,
        status: 'pending'
      }));

      const { error: itemsError } = await supabase
        .from('claim_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('Claim items insert error:', itemsError);
        // Don't fail the whole request, just log the error
      }
    }

    // Create status history entry
    await supabase
      .from('claim_status_history')
      .insert({
        claim_id: claim.id,
        status: 'submitted',
        notes: 'Claim submitted by hospital'
      });

    // Create notification for insurance company
    await supabase
      .from('notifications')
      .insert({
        user_type: 'agent',
        user_identifier: body.companyId,
        claim_id: claim.id,
        title: 'New Claim Submitted',
        message: `A new claim has been submitted for ${body.patientName}`
      });

    return NextResponse.json({
      success: true,
      claimId: claim.id,
      claimNumber: claim.claim_number
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
    const patientPhone = searchParams.get('patientPhone');

    const supabase = createServerClient();
    
    let query = supabase
      .from('claims')
      .select(`
        *,
        insurance_companies (
          id,
          name,
          code
        ),
        claim_items (*)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (companyId) {
      // Handle both UUID and code
      if (companyId.includes('-')) { // Likely a UUID
        query = query.eq('company_id', companyId);
      } else {
        // Try to get company by code first
        const { data: company } = await supabase
          .from('insurance_companies')
          .select('id')
          .eq('code', companyId.toUpperCase())
          .single();
        
        if (company) {
          query = query.eq('company_id', company.id);
        }
      }
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (claimNumber) {
      query = query.ilike('claim_number', `%${claimNumber}%`);
    }
    
    if (patientName) {
      query = query.ilike('patient_name', `%${patientName}%`);
    }
    
    if (patientPhone) {
      query = query.ilike('patient_phone', `%${patientPhone}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Claims fetch error:', error);
      return NextResponse.json(
        { error: `Failed to fetch claims: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      claims: data
    });

  } catch (error: any) {
    console.error('Claims API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}