import { useState } from 'react';
import toast from 'react-hot-toast';

interface DocumentRequest {
  id: string;
  document_type: string;
  description: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submitted_url?: string;
  submitted_at?: string;
  created_at: string;
}

export function useDocuments(claimId: string) {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<DocumentRequest[]>([]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/claims/${claimId}/documents`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch documents');
      }

      setDocuments(data.documents || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitDocument = async (requestId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('requestId', requestId);

    try {
      const response = await fetch(`/api/claims/${claimId}/documents`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload document');
      }

      toast.success('Document uploaded successfully');
      await fetchDocuments(); // Refresh the list
      return data;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  return {
    documents,
    loading,
    fetchDocuments,
    submitDocument
  };
}