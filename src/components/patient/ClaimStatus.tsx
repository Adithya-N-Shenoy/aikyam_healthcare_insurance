'use client';

import StatusBadge from '@/components/common/StatusBadge';
import { format } from 'date-fns';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ClaimStatusProps {
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  completedAt?: string;
}

export default function ClaimStatus({ status, submittedAt, reviewedAt, completedAt }: ClaimStatusProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'submitted':
      case 'under_review':
        return <Clock className="h-6 w-6 text-blue-500" />;
      default:
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
    }
  };

  const steps = [
    { key: 'submitted', label: 'Submitted', date: submittedAt },
    { key: 'under_review', label: 'Under Review', date: reviewedAt },
    { key: 'documents_requested', label: 'Documents', date: null },
    { key: 'completed', label: 'Completed', date: completedAt }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === status) + 1;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {getStatusIcon(status)}
          <div>
            <h3 className="text-lg font-semibold">Claim Status</h3>
            <p className="text-sm text-gray-600">
              Submitted on {format(new Date(submittedAt), 'dd MMM yyyy, hh:mm a')}
            </p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Progress Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-0 h-full w-0.5 bg-gray-200"></div>
        
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex - 1;

          return (
            <div key={step.key} className="relative flex items-start mb-6 last:mb-0">
              <div className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center ${
                isCompleted 
                  ? 'bg-green-100' 
                  : isCurrent 
                    ? 'bg-blue-100' 
                    : 'bg-gray-100'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : isCurrent ? (
                  <Clock className="h-5 w-5 text-blue-600" />
                ) : (
                  <div className="h-3 w-3 bg-gray-400 rounded-full" />
                )}
              </div>
              
              <div className="ml-14">
                <p className={`font-medium ${
                  isCompleted 
                    ? 'text-green-600' 
                    : isCurrent 
                      ? 'text-blue-600' 
                      : 'text-gray-400'
                }`}>
                  {step.label}
                </p>
                {step.date && (
                  <p className="text-sm text-gray-500">
                    {format(new Date(step.date), 'dd MMM yyyy, hh:mm a')}
                  </p>
                )}
                {step.key === 'documents_requested' && status === 'documents_requested' && (
                  <p className="text-sm text-yellow-600 mt-1">
                    Additional documents required
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}