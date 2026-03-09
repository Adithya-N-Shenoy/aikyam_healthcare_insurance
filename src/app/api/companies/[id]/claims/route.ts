import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const companyId = params.id;

    console.log('Fetching claims for company:', companyId);

    // First, get the company UUID if a code was provided
    let actualCompanyId = companyId;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(companyId)) {
      // Try to find company by code
      const { data: company } = await supabase
        .from('insurance_companies')
        .select('id')
        .eq('code', companyId.toUpperCase())
        .single();

      if (company) {
        actualCompanyId = company.id;
      } else {
        // Try by name
        const { data: companyByName } = await supabase
          .from('insurance_companies')
          .select('id')
          .ilike('name', `%${companyId}%`)
          .single();

        if (companyByName) {
          actualCompanyId = companyByName.id;
        }
      }
    }

    // Fetch claims for the company
    const { data: claims, error } = await supabase
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
      .eq('company_id', actualCompanyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching company claims:', error);
      return NextResponse.json(
        { error: 'Failed to fetch claims' },
        { status: 500 }
      );
    }

    // Get summary statistics
    const summary = {
      total: claims?.length || 0,
      pending: claims?.filter(c => c.status === 'submitted' || c.status === 'under_review').length || 0,
      approved: claims?.filter(c => c.status === 'approved' || c.status === 'completed').length || 0,
      rejected: claims?.filter(c => c.status === 'rejected').length || 0,
      partial: claims?.filter(c => c.status === 'partial').length || 0,
      totalAmount: claims?.reduce((sum, c) => sum + (c.total_requested_amount || 0), 0) || 0
    };

    return NextResponse.json({
      success: true,
      companyId: actualCompanyId,
      claims: claims || [],
      summary
    });

  } catch (error: any) {
    console.error('Company claims API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}