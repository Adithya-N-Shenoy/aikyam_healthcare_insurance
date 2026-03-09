'use client';

import { useState } from 'react';
import FileUpload from '@/components/common/FileUpload'; // Change this line
import { useGemini } from '@/hooks/useGemini';
import { Loader2, FileText } from 'lucide-react';
import type { MedicalChargeItem } from '@/types/claim';

interface BillUploaderProps {
  onExtracted: (charges: MedicalChargeItem[], patientInfo?: any) => void;
  onFileSelected: (file: File) => void;
}

export default function BillUploader({ onExtracted, onFileSelected }: BillUploaderProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const { extractBillData } = useGemini();

  const handleFileUpload = async (file: File) => {
    onFileSelected(file);
    setIsExtracting(true);
    setExtractedText(null);

    try {
      const result = await extractBillData(file);
      
      // Convert extracted data to medical charges
      const charges: MedicalChargeItem[] = [];
      if (result.mappedFields) {
        Object.entries(result.mappedFields).forEach(([fieldName, amount]) => {
          charges.push({
            fieldName,
            requestedAmount: amount as number,
            status: 'pending',
            category: 'Unknown',
            subcategory: fieldName
          });
        });
      }

      setExtractedText(result.rawText);
      onExtracted(charges, {
        patientName: result.patientName,
        patientAge: result.patientAge,
        patientGender: result.patientGender,
        billDate: result.billDate,
        hospitalName: result.hospitalName
      });

    } catch (error: any) {
      console.error('Extraction failed:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-4">
      <FileUpload
        label="Upload Patient Bill"
        description="Upload bill for AI extraction (PDF or Image, max 50MB)"
        onFileUpload={handleFileUpload}
        accept={{
          'image/*': ['.png', '.jpg', '.jpeg'],
          'application/pdf': ['.pdf']
        }}
      />

      {isExtracting && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-800">Extracting bill data with Gemini AI...</p>
              <p className="text-xs text-blue-600 mt-1">This may take a few seconds</p>
            </div>
          </div>
        </div>
      )}

      {extractedText && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <FileText className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">Extraction Complete!</p>
              <p className="text-xs text-green-600 mt-1">
                Bill data has been extracted and auto-filled in the form below.
                You can review and edit any amounts.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}