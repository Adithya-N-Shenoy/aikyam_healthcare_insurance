'use client';

import { useState, useEffect } from 'react';
import FileUpload from '@/components/common/FileUpload';
import Button from '@/components/common/Button';
import { CheckCircle, Clock, AlertCircle, Download, Eye, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface DocumentRequestProps {
  requests: Array<{
    id: string;
    document_type: string;
    description: string;
    status: 'pending' | 'submitted' | 'approved' | 'rejected';
    submitted_url?: string;
    submitted_at?: string;
    created_at: string;
    file_name?: string;
    file_size?: number;
  }>;
  onSubmitDocument: (requestId: string, file: File) => Promise<void>;
  readOnly?: boolean;
}

export default function DocumentRequest({ requests, onSubmitDocument, readOnly = false }: DocumentRequestProps) {
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [localRequests, setLocalRequests] = useState(requests);

  // Update local state when props change
  useEffect(() => {
    setLocalRequests(requests);
  }, [requests]);

  const handleSubmit = async (requestId: string, file: File) => {
    setSubmittingId(requestId);
    try {
      await onSubmitDocument(requestId, file);
      // The parent component should refresh the data
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setSubmittingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
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

  const getStatusColor = (status: string) => {
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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (localRequests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Required</h3>
        <p className="text-gray-600">
          All required documents have been submitted and verified.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Document Requests</h3>
        <p className="text-sm text-gray-600 mt-1">
          Please upload the requested documents for further processing
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {localRequests.map((request) => (
          <div key={request.id} className="p-6">
            <div 
              className="flex items-start justify-between cursor-pointer"
              onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
            >
              <div className="flex items-start space-x-3 flex-1">
                {getStatusIcon(request.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      {formatDocumentType(request.document_type)}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                </div>
              </div>
            </div>

            {expandedId === request.id && (
              <div className="mt-4 pl-8">
                {request.submitted_url ? (
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Submitted:</span>{' '}
                        {request.submitted_at ? format(new Date(request.submitted_at), 'dd MMM yyyy, hh:mm a') : 'N/A'}
                      </p>
                      {request.file_name && (
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">File:</span> {request.file_name} {request.file_size && `(${formatFileSize(request.file_size)})`}
                        </p>
                      )}
                      <div className="flex space-x-3">
                        <a
                          href={request.submitted_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Document
                        </a>
                        <a
                          href={request.submitted_url}
                          download
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </div>
                    </div>

                    {request.status === 'approved' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Document has been verified and approved by the insurance agent.
                        </p>
                      </div>
                    )}

                    {request.status === 'rejected' && !readOnly && (
                      <div className="space-y-3">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm text-red-800 flex items-center">
                            <XCircle className="h-4 w-4 mr-2" />
                            Document was rejected. Please upload a new version.
                          </p>
                        </div>
                        <FileUpload
                          label="Upload New Document"
                          description="Upload a corrected version of the document"
                          onFileUpload={(file) => handleSubmit(request.id, file)}
                          accept={{
                            'image/*': ['.png', '.jpg', '.jpeg'],
                            'application/pdf': ['.pdf']
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-3">
                    {request.status === 'pending' && !readOnly && (
                      <FileUpload
                        label={`Upload ${formatDocumentType(request.document_type)}`}
                        description="Upload the requested document (PDF or Image, max 50MB)"
                        onFileUpload={(file) => handleSubmit(request.id, file)}
                        accept={{
                          'image/*': ['.png', '.jpg', '.jpeg'],
                          'application/pdf': ['.pdf']
                        }}
                      />
                    )}
                    {request.status === 'pending' && readOnly && (
                      <p className="text-sm text-gray-500">
                        Waiting for patient to upload document.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}