import { useState } from 'react';
import toast from 'react-hot-toast';

interface ExtractedData {
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  billDate?: string;
  hospitalName?: string;
  doctorName?: string;
  items: Array<{
    description: string;
    amount: number;
    category?: string;
  }>;
  totalAmount: number;
  rawText: string;
  mappedFields?: Record<string, number>;
}

export function useGemini() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractBillData = async (file: File): Promise<ExtractedData> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/gemini/extract', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract bill data');
      }

      return data;
    } catch (err: any) {
      // Handle unknown error type
      let errorMessage = 'Unknown error occurred';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      toast.error(`Extraction failed: ${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    extractBillData,
    isLoading,
    error
  };
}