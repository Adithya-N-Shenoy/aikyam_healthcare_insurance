'use client';

import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, FileText, MessageSquare } from 'lucide-react';

interface TimelineEvent {
  id: string;
  status: string;
  notes?: string;
  changed_by?: string;
  created_at: string;
}

interface StatusTimelineProps {
  events: TimelineEvent[];
}

export default function StatusTimeline({ events }: StatusTimelineProps) {
  const getEventIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'submitted':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'documents_requested':
        return <MessageSquare className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getEventColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'rejected':
        return 'border-red-200 bg-red-50';
      case 'submitted':
        return 'border-blue-200 bg-blue-50';
      case 'documents_requested':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No status updates yet</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== events.length - 1 ? (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getEventColor(event.status)}`}>
                    {getEventIcon(event.status)}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-900">
                      Status changed to{' '}
                      <span className="font-medium">
                        {formatStatus(event.status)}
                      </span>
                    </p>
                    {event.notes && (
                      <p className="mt-1 text-sm text-gray-600">{event.notes}</p>
                    )}
                    {event.changed_by && (
                      <p className="mt-1 text-xs text-gray-500">
                        By: {event.changed_by}
                      </p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    {format(new Date(event.created_at), 'dd MMM yyyy, hh:mm a')}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}