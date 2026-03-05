import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Claim {
  id: string;
  claim_number: string;
  patient_name: string;
  policy_number: string;
  total_requested_amount: number;
  status: string;
  submitted_at: string;
  insurance_companies?: {
    name: string;
  };
}

interface UseClaimsOptions {
  companyId?: string;
  status?: string;
  claimNumber?: string;
  patientPhone?: string;
}

export function useClaims(options: UseClaimsOptions = {}) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClaims = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.companyId) params.append('companyId', options.companyId);
      if (options.status) params.append('status', options.status);
      if (options.claimNumber) params.append('claimNumber', options.claimNumber);
      if (options.patientPhone) params.append('patientPhone', options.patientPhone);

      const response = await fetch(`/api/claims?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch claims');
      }

      setClaims(data.claims || []);
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to load claims: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [options.companyId, options.status, options.claimNumber, options.patientPhone]);

  const getClaim = async (id: string) => {
    try {
      const response = await fetch(`/api/claims/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch claim');
      }

      return data.claim;
    } catch (err: any) {
      toast.error(`Failed to load claim: ${err.message}`);
      throw err;
    }
  };

  const updateClaim = async (id: string, updates: Partial<Claim>) => {
    try {
      const response = await fetch(`/api/claims/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update claim');
      }

      toast.success('Claim updated successfully');
      await fetchClaims(); // Refresh list
      return data.claim;
    } catch (err: any) {
      toast.error(`Failed to update claim: ${err.message}`);
      throw err;
    }
  };

  return {
    claims,
    loading,
    error,
    refresh: fetchClaims,
    getClaim,
    updateClaim
  };
}