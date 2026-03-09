import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Fetch all insurance companies
    const { data: companies, error } = await supabase
      .from('insurance_companies')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching companies:', error);
      return NextResponse.json(
        { error: 'Failed to fetch companies' },
        { status: 500 }
      );
    }

    // Get claim counts for each company
    const companiesWithStats = await Promise.all(
      (companies || []).map(async (company) => {
        const { data: claims } = await supabase
          .from('claims')
          .select('status')
          .eq('company_id', company.id);

        return {
          ...company,
          stats: {
            total: claims?.length || 0,
            pending: claims?.filter(c => c.status === 'submitted' || c.status === 'under_review').length || 0,
            approved: claims?.filter(c => c.status === 'approved' || c.status === 'completed').length || 0
          }
        };
      })
    );

    return NextResponse.json({
      success: true,
      companies: companiesWithStats
    });

  } catch (error: any) {
    console.error('Companies API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}