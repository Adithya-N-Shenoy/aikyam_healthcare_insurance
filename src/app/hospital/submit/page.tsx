'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FileUpload from '@/components/common/FileUpload';
import { useGemini } from '@/hooks/useGemini';
import { useUpload } from '@/hooks/useUpload';
import { Loader2, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import type { MedicalChargeItem } from '@/types/claim';
import { MEDICAL_FIELDS } from '@/lib/constants/medicalFields';
import ClaimForm from '@/components/hospital/ClaimForm';
import MedicalChargesForm from '@/components/hospital/MedicalChargesForm';

type Step = 'upload' | 'form' | 'review';

export default function SubmitClaimPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [billFile, setBillFile] = useState<File | null>(null);
  const [roomPhoto, setRoomPhoto] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [medicalCharges, setMedicalCharges] = useState<MedicalChargeItem[]>(() => {
    // Initialize empty charges from constants
    const charges: MedicalChargeItem[] = [];
    MEDICAL_FIELDS.forEach(category => {
      category.subcategories.forEach(sub => {
        charges.push({
          fieldName: sub.field,
          category: category.category,
          subcategory: sub.name,
          requestedAmount: 0,
          status: 'pending'
        });
      });
    });
    return charges;
  });
  const [formData, setFormData] = useState<any>(null);

  const { extractBillData, isLoading: isExtractingBill } = useGemini();
  const { uploadFile, isUploading } = useUpload();

  const handleBillUpload = async (file: File) => {
    setBillFile(file);
    
    // Automatically start extraction
    setIsExtracting(true);
    try {
      toast.loading('Extracting bill data with Gemini AI...', { id: 'extract' });
      
      const result = await extractBillData(file);
      
      // Update medical charges with extracted amounts
      if (result.mappedFields) {
        setMedicalCharges(prev => 
          prev.map(charge => {
            const extractedAmount = result.mappedFields?.[charge.fieldName];
            if (extractedAmount && extractedAmount > 0) {
              return {
                ...charge,
                requestedAmount: extractedAmount
              };
            }
            return charge;
          })
        );
      }
      
      toast.success('Bill data extracted successfully!', { id: 'extract' });
      
      // Move to next step
      setCurrentStep('form');
      
    } catch (error: any) {
      console.error('Extraction error:', error);
      toast.error(`Extraction failed: ${error.message}`, { id: 'extract' });
      
      // Still allow manual entry
      toast((t) => (
        <div className="flex items-center">
          <span>You can still proceed with manual entry</span>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              setCurrentStep('form');
            }}
            className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
          >
            Continue
          </button>
        </div>
      ), { duration: 8000 });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      toast.loading('Submitting claim...', { id: 'submit' });
      
      if (!billFile || !roomPhoto) {
        throw new Error('Please upload both bill and room photo');
      }
      
      // Upload files with correct bucket types
      const billUrl = await uploadFile(billFile, 'bills');
      const roomPhotoUrl = await uploadFile(roomPhoto, 'room-photos');
      
      // Prepare claim data
      const claimData = {
        ...data,
        billFileUrl: billUrl,
        roomPhotoUrl: roomPhotoUrl,
        medicalCharges: medicalCharges.filter(c => c.requestedAmount > 0),
        totalRequested: medicalCharges.reduce((sum, c) => sum + (c.requestedAmount || 0), 0)
      };
      
      // Submit to API
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claimData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Submission failed');
      }
      
      const result = await response.json();
      
      toast.success('Claim submitted successfully!', { id: 'submit' });
      
      // Redirect to tracking page
      router.push(`/patient/track/${result.claimNumber}`);
      
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(`Submission failed: ${error.message}`, { id: 'submit' });
    }
  };

  const steps = [
    { id: 'upload', name: 'Upload Documents', icon: '📤' },
    { id: 'form', name: 'Patient Details', icon: '📋' },
    { id: 'review', name: 'Review & Submit', icon: '✅' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Link
              href="/hospital"
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Submit Insurance Claim</h1>
              <p className="text-gray-600 mt-1">Fill in the details to submit a new claim</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, index) => (
              <li key={step.id} className={`${index !== steps.length - 1 ? 'flex-1' : ''} relative`}>
                <div className="group">
                  <span className="flex items-center">
                    <span className={`flex items-center px-6 py-4 text-sm font-medium ${
                      step.id === currentStep ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      <span className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${
                        step.id === currentStep 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step.icon}
                      </span>
                      <span className="ml-4 hidden sm:block">{step.name}</span>
                    </span>
                  </span>
                </div>
                {index !== steps.length - 1 && (
                  <div className="hidden sm:block absolute top-0 right-0 h-full w-5" aria-hidden="true">
                    <svg
                      className="h-full w-full text-gray-300"
                      viewBox="0 0 22 80"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0 -2L20 40L0 82"
                        vectorEffect="non-scaling-stroke"
                        stroke="currentColor"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'upload' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Step 1: Upload Documents</h2>
              
              <div className="space-y-6">
                <FileUpload
                  label="Patient Bill"
                  description="Upload bill for AI extraction (PDF or Image, max 50MB)"
                  onFileUpload={handleBillUpload}
                  onFileRemove={() => setBillFile(null)}
                  value={billFile}
                  accept={{
                    'image/*': ['.png', '.jpg', '.jpeg'],
                    'application/pdf': ['.pdf']
                  }}
                />

                {(isExtracting || isExtractingBill) && (
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

                <FileUpload
                  label="Patient Room Photo"
                  description="Upload a photo of the patient in the room as proof of admission"
                  onFileUpload={setRoomPhoto}
                  onFileRemove={() => setRoomPhoto(null)}
                  value={roomPhoto}
                  accept={{
                    'image/*': ['.png', '.jpg', '.jpeg']
                  }}
                />
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => {
                    if (!billFile) {
                      toast.error('Please upload patient bill');
                      return;
                    }
                    if (!roomPhoto) {
                      toast.error('Please upload room photo (required for fraud prevention)');
                      return;
                    }
                    setCurrentStep('form');
                  }}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Continue to Patient Details
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'form' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Step 2: Patient & Claim Details</h2>
              
              <ClaimForm
                initialData={formData}
                onSubmit={(data) => {
                  setFormData(data);
                  setCurrentStep('review');
                }}
                onBack={() => setCurrentStep('upload')}
              />
            </div>
          </div>
        )}

        {currentStep === 'review' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Step 3: Review Medical Charges</h2>
              
              <MedicalChargesForm
                charges={medicalCharges}
                onChange={setMedicalCharges}
              />

              <div className="mt-8 border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total Requested Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{medicalCharges.reduce((sum, c) => sum + (c.requestedAmount || 0), 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep('form')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                  >
                    Back to Form
                  </button>
                  
                  <button
                    onClick={() => handleSubmit(formData)}
                    disabled={isUploading}
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-5 w-5" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-5 w-5" />
                        Submit Claim
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}