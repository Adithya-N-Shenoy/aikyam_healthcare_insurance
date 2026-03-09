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

    // Find company by ID or code
    let query = supabase
      .from('insurance_companies')
      .select('*');

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (uuidRegex.test(companyId)) {
      query = query.eq('id', companyId);
    } else {
      query = query.eq('code', companyId.toUpperCase());
    }

    const { data: company, error } = await query.single();

    if (error || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Get claim statistics
    const { data: claims } = await supabase
      .from('claims')
      .select('status, total_requested_amount, total_approved_amount')
      .eq('company_id', company.id);

    const stats = {
      totalClaims: claims?.length || 0,
      pendingClaims: claims?.filter(c => ['submitted', 'under_review'].includes(c.status)).length || 0,
      approvedClaims: claims?.filter(c => ['approved', 'completed'].includes(c.status)).length || 0,
      rejectedClaims: claims?.filter(c => c.status === 'rejected').length || 0,
      totalRequested: claims?.reduce((sum, c) => sum + (c.total_requested_amount || 0), 0) || 0,
      totalApproved: claims?.reduce((sum, c) => sum + (c.total_approved_amount || 0), 0) || 0
    };

    return NextResponse.json({
      success: true,
      company: {
        ...company,
        stats
      }
    });

  } catch (error: any) {
    console.error('Company details API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}