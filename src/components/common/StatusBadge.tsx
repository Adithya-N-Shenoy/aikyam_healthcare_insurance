'use client';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      submitted: { color: 'bg-yellow-100 text-yellow-800', label: 'Submitted' },
      under_review: { color: 'bg-blue-100 text-blue-800', label: 'Under Review' },
      documents_requested: { color: 'bg-purple-100 text-purple-800', label: 'Documents Requested' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      partial: { color: 'bg-orange-100 text-orange-800', label: 'Partially Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      completed: { color: 'bg-gray-100 text-gray-800', label: 'Completed' },
      pending: { color: 'bg-gray-100 text-gray-800', label: 'Pending' }
    };

    const config = configs[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    
    return config;
  };

  const { color, label } = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}