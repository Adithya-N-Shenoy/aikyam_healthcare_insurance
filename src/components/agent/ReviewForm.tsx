'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/common/Input';
import Textarea from '@/components/common/Textarea';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import { Plus, X, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const reviewFormSchema = z.object({
  agentName: z.string().min(1, 'Agent name is required'),
  agentEmail: z.string().email('Invalid email'),
  agentPhone: z.string().min(10, 'Valid phone number is required'),
  reviewNotes: z.string().optional(),
  action: z.enum(['approve', 'reject', 'partial', 'request_documents', 'save']),
});

const documentRequestSchema = z.object({
  documentType: z.string().min(1, 'Document type is required'),
  description: z.string().min(1, 'Description is required'),
});

type ReviewFormData = z.infer<typeof reviewFormSchema>;
type DocumentRequest = z.infer<typeof documentRequestSchema>;

interface ReviewFormProps {
  initialData?: Partial<ReviewFormData>;
  claimId: string;
  companyId?: string;
  onComplete: (data: ReviewFormData & { documentRequests?: DocumentRequest[] }) => void;
  onBack: () => void;
}

export default function ReviewForm({ initialData, claimId, companyId, onComplete, onBack }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>([]);
  const [showDocForm, setShowDocForm] = useState(false);
  const [newDocRequest, setNewDocRequest] = useState<DocumentRequest>({
    documentType: '',
    description: ''
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: initialData || {
      agentName: '',
      agentEmail: '',
      agentPhone: '',
      reviewNotes: '',
      action: 'save'
    }
  });

  const selectedAction = watch('action');

  // Log when action changes for debugging
  useEffect(() => {
    console.log('Selected action changed:', selectedAction);
  }, [selectedAction]);

  const addDocumentRequest = () => {
    try {
      documentRequestSchema.parse(newDocRequest);
      setDocumentRequests([...documentRequests, newDocRequest]);
      setNewDocRequest({ documentType: '', description: '' });
      setShowDocForm(false);
      toast.success('Document request added');
    } catch (error) {
      toast.error('Please fill in both fields');
    }
  };

  const removeDocumentRequest = (index: number) => {
    setDocumentRequests(documentRequests.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ReviewFormData) => {
    console.log('Form submitted with action:', data.action);
    setIsSubmitting(true);
    
    try {
      // Validate based on action
      if (data.action === 'request_documents' && documentRequests.length === 0) {
        toast.error('Please add at least one document request');
        setIsSubmitting(false);
        return;
      }

      // Prepare the complete data
      const completeData = {
        ...data,
        documentRequests: data.action === 'request_documents' ? documentRequests : []
      };

      console.log('Submitting review with data:', completeData);
      
      // Call the onComplete callback with the data
      await onComplete(completeData);
      
    } catch (error: any) {
      console.error('Error in form submission:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionButtonText = () => {
    switch (selectedAction) {
      case 'approve':
        return 'Approve & Complete Claim';
      case 'reject':
        return 'Reject Claim';
      case 'partial':
        return 'Approve Partial Amount';
      case 'request_documents':
        return 'Send Document Requests';
      case 'save':
        return 'Save Review';
      default:
        return 'Submit Review';
    }
  };

  const getActionButtonColor = () => {
    switch (selectedAction) {
      case 'approve':
        return 'bg-green-600 hover:bg-green-700';
      case 'reject':
        return 'bg-red-600 hover:bg-red-700';
      case 'partial':
        return 'bg-orange-600 hover:bg-orange-700';
      case 'request_documents':
        return 'bg-purple-600 hover:bg-purple-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Action Selection */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Review Action</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              console.log('Setting action to approve');
              setValue('action', 'approve');
            }}
            className={`p-3 rounded-lg border-2 transition ${
              selectedAction === 'approve' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-green-200'
            }`}
          >
            <CheckCircle className={`h-6 w-6 mx-auto mb-2 ${
              selectedAction === 'approve' ? 'text-green-500' : 'text-gray-400'
            }`} />
            <span className="text-sm font-medium">Approve</span>
          </button>

          <button
            type="button"
            onClick={() => {
              console.log('Setting action to partial');
              setValue('action', 'partial');
            }}
            className={`p-3 rounded-lg border-2 transition ${
              selectedAction === 'partial' 
                ? 'border-orange-500 bg-orange-50' 
                : 'border-gray-200 hover:border-orange-200'
            }`}
          >
            <AlertCircle className={`h-6 w-6 mx-auto mb-2 ${
              selectedAction === 'partial' ? 'text-orange-500' : 'text-gray-400'
            }`} />
            <span className="text-sm font-medium">Partial</span>
          </button>

          <button
            type="button"
            onClick={() => {
              console.log('Setting action to reject');
              setValue('action', 'reject');
            }}
            className={`p-3 rounded-lg border-2 transition ${
              selectedAction === 'reject' 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-200 hover:border-red-200'
            }`}
          >
            <XCircle className={`h-6 w-6 mx-auto mb-2 ${
              selectedAction === 'reject' ? 'text-red-500' : 'text-gray-400'
            }`} />
            <span className="text-sm font-medium">Reject</span>
          </button>

          <button
            type="button"
            onClick={() => {
              console.log('Setting action to request_documents');
              setValue('action', 'request_documents');
            }}
            className={`p-3 rounded-lg border-2 transition ${
              selectedAction === 'request_documents' 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 hover:border-purple-200'
            }`}
          >
            <FileText className={`h-6 w-6 mx-auto mb-2 ${
              selectedAction === 'request_documents' ? 'text-purple-500' : 'text-gray-400'
            }`} />
            <span className="text-sm font-medium">Request Docs</span>
          </button>
        </div>
        <input type="hidden" {...register('action')} />
      </div>

      {/* Agent Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Agent Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Agent Name"
            error={errors.agentName?.message}
            {...register('agentName')}
            required
          />
          <Input
            label="Email"
            type="email"
            error={errors.agentEmail?.message}
            {...register('agentEmail')}
            required
          />
          <Input
            label="Contact Number"
            type="tel"
            placeholder="+91 9876543210"
            error={errors.agentPhone?.message}
            {...register('agentPhone')}
            required
          />
        </div>
      </div>

      {/* Review Notes */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Review Notes</h3>
        <Textarea
          label="Notes"
          placeholder="Enter your review comments, observations, or additional information..."
          rows={4}
          error={errors.reviewNotes?.message}
          {...register('reviewNotes')}
        />
      </div>

      {/* Document Requests Section - Only show when action is request_documents */}
      {selectedAction === 'request_documents' && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Document Requests</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDocForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Document Request
            </Button>
          </div>

          {/* New Document Request Form */}
          {showDocForm && (
            <div className="mb-4 p-4 bg-white rounded-lg border">
              <div className="grid grid-cols-1 gap-4">
                <Select
                  label="Document Type"
                  options={[
                    { value: 'policy_documents', label: 'Policy Documents' },
                    { value: 'medical_reports', label: 'Medical Reports' },
                    { value: 'discharge_summary', label: 'Discharge Summary' },
                    { value: 'prescriptions', label: 'Prescriptions' },
                    { value: 'identity_proof', label: 'Identity Proof' },
                    { value: 'income_proof', label: 'Income Proof' },
                    { value: 'hospital_bills', label: 'Additional Hospital Bills' },
                    { value: 'doctor_notes', label: 'Doctor\'s Notes' },
                    { value: 'other', label: 'Other' }
                  ]}
                  value={newDocRequest.documentType}
                  onChange={(e) => setNewDocRequest({ ...newDocRequest, documentType: e.target.value })}
                />
                <Textarea
                  label="Description"
                  placeholder="Describe what documents are needed and why"
                  value={newDocRequest.description}
                  onChange={(e) => setNewDocRequest({ ...newDocRequest, description: e.target.value })}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDocForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addDocumentRequest}
                  >
                    Add Request
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Document Requests List */}
          {documentRequests.length > 0 ? (
            <div className="space-y-2">
              {documentRequests.map((req, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{req.documentType}</p>
                    <p className="text-xs text-gray-600 mt-1">{req.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocumentRequest(index)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No document requests added yet
            </p>
          )}

          <p className="text-xs text-gray-500 mt-2">
            Note: You can still approve/reject the claim without requesting documents
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          type="submit" 
          loading={isSubmitting}
          className={getActionButtonColor()}
        >
          {getActionButtonText()}
        </Button>
      </div>
    </form>
  );
}