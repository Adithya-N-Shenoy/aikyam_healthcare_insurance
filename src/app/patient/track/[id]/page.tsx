'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, FileText, Calendar, Phone, Mail, User, Building2 } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import ClaimStatus from '@/components/patient/ClaimStatus';
import BreakdownTable from '@/components/patient/BreakdownTable';
import DocumentRequest from '@/components/patient/DocumentRequest';
import StatusTimeline from '@/components/patient/StatusTimeline';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils/formatters';

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
  reviewed_at?: string;
  completed_at?: string;
  insurance_companies?: {
    name: string;
    code: string;
  };
  claim_items?: any[];
  document_requests?: any[];
  claim_status_history?: any[];
  review_notes?: any[];
}

export default function PatientTrackPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [claim, setClaim] = useState<Claim | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClaim();
  }, [params.id]);

  const fetchClaim = async () => {
    try {
      const response = await fetch(`/api/claims/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch claim');
      }

      setClaim(data.claim);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSubmit = async (requestId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('requestId', requestId);

      const response = await fetch(`/api/claims/${params.id}/documents`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      toast.success('Document uploaded successfully');
      fetchClaim(); // Refresh data
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-10 w-10 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Claim Not Found</h3>
          <p className="text-gray-600 mb-6">
            {error || 'The claim you are looking for does not exist or you may have entered an incorrect claim number.'}
          </p>
          <Link
            href="/patient"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
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
                href="/patient"
                className="mr-4 p-2 hover:bg-gray-100 rounded-full transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Claim Details</h1>
                <p className="text-sm text-gray-600">Claim #{claim.claim_number}</p>
              </div>
            </div>
            <StatusBadge status={claim.status} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Status Timeline */}
          <ClaimStatus
            status={claim.status}
            submittedAt={claim.submitted_at}
            reviewedAt={claim.reviewed_at}
            completedAt={claim.completed_at}
          />

          {/* Patient Information Card */}
          <Card title="Patient Information">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 flex items-center">
                  <User className="h-4 w-4 mr-1" /> Name
                </p>
                <p className="font-medium">{claim.patient_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" /> Date of Birth
                </p>
                <p className="font-medium">{formatDate(claim.patient_dob)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium">{claim.patient_gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center">
                  <Phone className="h-4 w-4 mr-1" /> Contact
                </p>
                <p className="font-medium">{claim.patient_phone}</p>
              </div>
              {claim.patient_email && (
                <div>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Mail className="h-4 w-4 mr-1" /> Email
                  </p>
                  <p className="font-medium">{claim.patient_email}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 flex items-center">
                  <Building2 className="h-4 w-4 mr-1" /> Insurance Company
                </p>
                <p className="font-medium">{claim.insurance_companies?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Policy Number</p>
                <p className="font-medium">{claim.policy_number}</p>
              </div>
            </div>
          </Card>

          {/* Admission Details Card */}
          <Card title="Admission Details">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </Card>

          {/* Complete Transparent Breakdown */}
          {claim.claim_items && claim.claim_items.length > 0 && (
            <BreakdownTable items={claim.claim_items} />
          )}

          {/* Document Requests */}
          {claim.document_requests && claim.document_requests.length > 0 && (
            <DocumentRequest
              requests={claim.document_requests}
              onSubmitDocument={handleDocumentSubmit}
            />
          )}

          {/* Status History */}
          {claim.claim_status_history && claim.claim_status_history.length > 0 && (
            <Card title="Updates & Notifications">
              <StatusTimeline events={claim.claim_status_history} />
            </Card>
          )}

          {/* Review Notes */}
          {claim.review_notes && claim.review_notes.length > 0 && (
            <Card title="Agent Review Notes">
              <div className="space-y-4">
                {claim.review_notes.map((note: any) => (
                  <div key={note.id} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800">{note.notes}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Reviewed on {formatDateTime(note.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Download Buttons */}
          <div className="flex flex-wrap justify-end gap-3">
            <a
              href={claim.bill_file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Bill
            </a>
            <a
              href={claim.room_photo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Room Photo
            </a>
          </div>

          {/* Submitted Date */}
          <p className="text-center text-sm text-gray-500">
            Claim submitted on {formatDateTime(claim.submitted_at)}
          </p>
        </div>
      </main>
    </div>
  );
}