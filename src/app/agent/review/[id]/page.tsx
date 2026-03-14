'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, FileText, User, Calendar, Phone, Mail, Building2, 
  Download, Eye, CheckCircle, Clock, AlertCircle, XCircle 
} from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import Button from '@/components/common/Button';
import ClaimItemsReview from '@/components/agent/ClaimItemsReview';
import ReviewForm from '@/components/agent/ReviewForm';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils/formatters';
import { mapClaimToPolicy } from '@/lib/utils/policyMapper';

interface ClaimItem {
  id: string;
  category: string;
  subcategory: string;
  field_name: string;
  requested_amount: number;
  approved_amount?: number;
  rejected_amount?: number;
  rejection_reason?: string;
  status: string;
  auto_mapped?: boolean;
  auto_map_reason?: string;
}

interface DocumentRequest {
  id: string;
  document_type: string;
  description: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submitted_url?: string;
  submitted_at?: string;
  created_at: string;
}

interface Claim {
  id: string;
  claim_number: string;
  status: string;
  patient_name: string;
  patient_dob: string;
  patient_gender: string;
  patient_phone: string;
  patient_email?: string;
  policy_number: string;
  patient_address?: string;
  admission_date: string;
  discharge_date?: string;
  admission_type: string;
  length_of_stay?: number;
  staff_name: string;
  staff_designation: string;
  staff_phone: string;
  staff_email: string;
  bill_file_url: string;
  room_photo_url: string;
  total_requested_amount: number;
  total_approved_amount: number;
  total_rejected_amount: number;
  submitted_at: string;
  company_id: string;
  insurance_companies?: {
    name: string;
    code: string;
  };
  claim_items?: ClaimItem[];
  document_requests?: DocumentRequest[];
}

export default function AgentReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [claim, setClaim] = useState<Claim | null>(null);
  const [items, setItems] = useState<ClaimItem[]>([]);
  const [documents, setDocuments] = useState<DocumentRequest[]>([]);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [autoMappingDone, setAutoMappingDone] = useState(false);

  useEffect(() => {
    fetchAndMapClaim();
  }, [params.id]);

  const fetchAndMapClaim = async () => {
    try {
      const response = await fetch(`/api/claims/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch claim');
      }

      setClaim(data.claim);
      
      // If claim has policyNumber, fetch the policy and auto-map
      if (data.claim.policyNumber && !autoMappingDone) {
        try {
          const policyResponse = await fetch(`/api/policies/${data.claim.policyNumber}`);
          if (policyResponse.ok) {
            const policyData = await policyResponse.json();
            
            // Auto-map bill items to policy
            const mappedItems = mapClaimToPolicy(
              data.claim.claim_items || [],
              policyData.policy
            );
            
            // Convert mapped items to claim items format
            const mappedClaimItems = mappedItems.map(mapped => {
              const originalItem = data.claim.claim_items?.find((i: any) => i.field_name === mapped.fieldName);
              return {
                ...originalItem,
                approved_amount: mapped.suggestedAmount,
                rejected_amount: (originalItem?.requested_amount || 0) - mapped.suggestedAmount,
                status: 'pending',
                auto_mapped: true,
                auto_map_reason: mapped.reason
              };
            });
            
            setItems(mappedClaimItems);
            setAutoMappingDone(true);
            
            // Show toast notification about auto-mapping
            const autoMappedCount = mappedItems.filter(m => m.suggestedAmount < (data.claim.claim_items?.find((i: any) => i.field_name === m.fieldName)?.requested_amount || 0)).length;
            if (autoMappedCount > 0) {
              toast.success(`Auto-mapped ${autoMappedCount} items based on policy limits`);
            }
          } else {
            // Policy not found, initialize with requested amounts
            const initialItems = (data.claim.claim_items || []).map((item: ClaimItem) => ({
              ...item,
              approved_amount: item.approved_amount || item.requested_amount,
              rejected_amount: item.rejected_amount || 0,
              status: item.status || 'pending'
            }));
            
            setItems(initialItems);
          }
        } catch (policyError) {
          console.error('Error fetching policy:', policyError);
          // Fallback to requested amounts if policy fetch fails
          const initialItems = (data.claim.claim_items || []).map((item: ClaimItem) => ({
            ...item,
            approved_amount: item.approved_amount || item.requested_amount,
            rejected_amount: item.rejected_amount || 0,
            status: item.status || 'pending'
          }));
          
          setItems(initialItems);
        }
      } else {
        // No policy number, initialize with requested amounts
        const initialItems = (data.claim.claim_items || []).map((item: ClaimItem) => ({
          ...item,
          approved_amount: item.approved_amount || item.requested_amount,
          rejected_amount: item.rejected_amount || 0,
          status: item.status || 'pending'
        }));
        
        setItems(initialItems);
      }
      
      setDocuments(data.claim.document_requests || []);

      // If there are saved review notes, you might want to load them
      // This depends on how you want to handle saved reviews

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/claims/${params.id}/documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });

      if (!response.ok) {
        throw new Error('Failed to approve document');
      }

      toast.success('Document approved');
      fetchAndMapClaim(); // Refresh
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRejectDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/claims/${params.id}/documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });

      if (!response.ok) {
        throw new Error('Failed to reject document');
      }

      toast.success('Document rejected');
      fetchAndMapClaim(); // Refresh
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSubmitReview = async (formData: any) => {
    console.log('handleSubmitReview called with:', formData);
    setSubmitting(true);
    
    try {
      // Ensure we have all required data
      if (!formData.action) {
        throw new Error('No action selected. Please select approve, reject, or partial.');
      }

      const requestBody = {
        ...formData,
        companyId: claim?.company_id,
        items: items,
        action: formData.action, // Make sure action is explicitly set
        statusNotes: formData.reviewNotes || `Claim ${formData.action} by agent`
      };

      console.log('Sending review request:', requestBody);

      const response = await fetch(`/api/claims/${params.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log('Review response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit review');
      }

      toast.success(result.message || `Claim ${formData.action} successfully`);
      
      // Redirect based on action
      if (formData.action === 'request_documents') {
        // Stay on page to show document requests were sent
        fetchAndMapClaim(); // Refresh to show updated status
      } else {
        // For approve/reject/partial, go back to agent portal
        setTimeout(() => {
          router.push('/agent');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error in handleSubmitReview:', error);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDocumentType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Claim Not Found</h3>
          <p className="text-gray-600 mt-2">The claim you're looking for doesn't exist.</p>
          <Link
            href="/agent"
            className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Agent Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/agent"
                className="mr-4 p-2 hover:bg-gray-100 rounded-full transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Review Claim</h1>
                <p className="text-sm text-gray-600">Claim #{claim.claim_number}</p>
              </div>
            </div>
            <StatusBadge status={claim.status} />
          </div>
        </div>
      </header>

      {/* Auto-mapping Banner */}
      {items.some(item => item.auto_mapped) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Auto-mapping applied:</span> Some items have been automatically adjusted based on policy limits. Please review the suggested amounts below.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Claim Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Patient Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{claim.patient_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Policy Number</p>
                  <p className="font-medium">{claim.policy_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{formatDate(claim.patient_dob)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{claim.patient_gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{claim.patient_phone}</p>
                </div>
                {claim.patient_email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{claim.patient_email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Admission Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Admission Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Admission Date</p>
                  <p className="font-medium">{formatDate(claim.admission_date)}</p>
                </div>
                {claim.discharge_date && (
                  <div>
                    <p className="text-sm text-gray-500">Discharge Date</p>
                    <p className="font-medium">{formatDate(claim.discharge_date)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Admission Type</p>
                  <p className="font-medium capitalize">{claim.admission_type}</p>
                </div>
                {claim.length_of_stay && (
                  <div>
                    <p className="text-sm text-gray-500">Length of Stay</p>
                    <p className="font-medium">{claim.length_of_stay} days</p>
                  </div>
                )}
              </div>
            </div>

            {/* Hospital Staff Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Hospital Staff Contact</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Staff Name</p>
                  <p className="font-medium">{claim.staff_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Designation</p>
                  <p className="font-medium">{claim.staff_designation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{claim.staff_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{claim.staff_email}</p>
                </div>
              </div>
            </div>

            {/* Document Requests Section - Show for agent */}
            {documents.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Document Requests</h2>
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="border rounded-lg overflow-hidden">
                      <div 
                        className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                        onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getDocumentStatusIcon(doc.status)}
                            <div>
                              <p className="font-medium">{formatDocumentType(doc.document_type)}</p>
                              <p className="text-sm text-gray-600">{doc.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDocumentStatusColor(doc.status)}`}>
                              {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {expandedDoc === doc.id && (
                        <div className="p-4 border-t">
                          {doc.submitted_url ? (
                            <div>
                              <p className="text-sm text-gray-600 mb-3">
                                Submitted on {doc.submitted_at ? formatDateTime(doc.submitted_at) : 'N/A'}
                              </p>
                              <div className="flex space-x-3">
                                <a
                                  href={doc.submitted_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Document
                                </a>
                                <a
                                  href={doc.submitted_url}
                                  download
                                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </a>
                              </div>

                              {doc.status === 'submitted' && (
                                <div className="mt-4 flex space-x-3">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveDocument(doc.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve Document
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRejectDocument(doc.id)}
                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject Document
                                  </Button>
                                </div>
                              )}

                              {doc.status === 'approved' && (
                                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                  <p className="text-sm text-green-800 flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Document approved and verified
                                  </p>
                                </div>
                              )}

                              {doc.status === 'rejected' && (
                                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                                  <p className="text-sm text-red-800 flex items-center">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Document rejected
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">
                              Patient hasn't uploaded this document yet.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medical Charges Review */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Medical Charges Breakdown</h2>
              <ClaimItemsReview 
                items={items} 
                onItemsChange={setItems} 
                readOnly={claim.status !== 'submitted' && claim.status !== 'under_review' && claim.status !== 'documents_requested'}
              />
            </div>
          </div>

          {/* Right Column - Review Form and Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Document Links */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Documents</h2>
              <div className="space-y-3">
                <a
                  href={claim.bill_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <FileText className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium">View Patient Bill</span>
                </a>
                <a
                  href={claim.room_photo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <FileText className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm font-medium">View Room Photo</span>
                </a>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Requested Amount:</span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(items.reduce((sum, item) => sum + item.requested_amount, 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Approved Amount:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(items.reduce((sum, item) => sum + (item.approved_amount || 0), 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rejected Amount:</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(items.reduce((sum, item) => sum + (item.rejected_amount || 0), 0))}
                  </span>
                </div>
                {documents.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-600">Documents:</p>
                    <p className="text-sm font-medium">
                      {documents.filter(d => d.status === 'submitted').length} Submitted,{' '}
                      {documents.filter(d => d.status === 'approved').length} Approved,{' '}
                      {documents.filter(d => d.status === 'rejected').length} Rejected
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Review Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <ReviewForm
                claimId={claim.claim_number}
                companyId={claim.company_id}
                onComplete={handleSubmitReview}
                onBack={() => router.push('/agent')}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}